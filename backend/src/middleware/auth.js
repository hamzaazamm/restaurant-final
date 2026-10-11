'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

/**
 * Verifies the JWT from the HttpOnly cookie.
 * Attaches the full user document to req.user.
 * Does NOT authorize — use requireRole() for that.
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from HttpOnly cookie only (not Authorization header — avoids XSS risk)
    const token = req.cookies?.token;

    if (!token) {
      throw new AuthenticationError('You must be logged in to access this resource');
    }

    // Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw new AuthenticationError('Your session has expired, please log in again');
      }
      throw new AuthenticationError('Invalid authentication token');
    }

    // Load the user — confirm they still exist and are active
    const user = await User.findById(decoded.id).select('+loginAttempts +lockUntil');
    if (!user) {
      throw new AuthenticationError('The account belonging to this token no longer exists');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Your account has been deactivated');
    }

    // Confirm password hasn't changed since token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AuthenticationError('Password was changed recently, please log in again');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware factory: requires the authenticated user to have one of the specified roles.
 * Must be used after authenticate().
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access restricted to: ${roles.join(', ')}`));
    }
    next();
  };
};

/**
 * Optional authentication — attaches user to req if token is present and valid,
 * but does not reject unauthenticated requests. Used for guest-friendly endpoints.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      return next(); // Invalid token — treat as guest
    }

    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, requireRole, optionalAuth };
