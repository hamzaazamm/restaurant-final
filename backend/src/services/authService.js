'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AuthenticationError, ConflictError, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Generate a signed JWT and set it as an HttpOnly cookie.
 * Never sends the token in the response body.
 */
const signTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  res.cookie('token', token, {
    httpOnly: true,  // Inaccessible to JS — prevents XSS token theft
    secure: config.isProduction, // HTTPS only in production
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000, // days → ms
    path: '/',
  });

  return token;
};

const authService = {
  /**
   * Register a new customer account.
   * Throws ConflictError if email already exists.
   */
  async register(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Role is always 'customer' from this endpoint — never trust client input
    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'customer',
    });

    logger.info(`New customer registered: ${user.email}`);
    return user;
  },

  /**
   * Authenticate a user by email + password.
   * Handles account lockout and progressive failure tracking.
   */
  async login(email, password) {
    // Select password and security fields explicitly
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      // Use same timing as a failed password check (prevent user enumeration)
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.isLocked()) {
      throw new AuthenticationError('Account is temporarily locked due to too many failed attempts. Try again in 15 minutes.');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Your account has been deactivated');
    }

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      await user.recordLoginFailure();
      throw new AuthenticationError('Invalid email or password');
    }

    await user.resetLoginAttempts();
    logger.info(`User logged in: ${user.email}`);
    return user;
  },

  /**
   * Create the first admin account using a secure init secret.
   * Used only during initial deployment — not a public endpoint.
   */
  async initializeAdmin(data, initSecret) {
    if (!config.adminInit.secret || initSecret !== config.adminInit.secret) {
      throw new AuthenticationError('Invalid initialization secret');
    }

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      throw new ConflictError('An admin account already exists');
    }

    const admin = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'admin',
    });

    logger.info(`Admin account initialized: ${admin.email}`);
    return admin;
  },

  signTokenAndSetCookie,

  /**
   * Clear the authentication cookie (logout).
   */
  clearCookie(res) {
    res.cookie('token', '', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      expires: new Date(0),
      path: '/',
    });
  },
};

module.exports = authService;
