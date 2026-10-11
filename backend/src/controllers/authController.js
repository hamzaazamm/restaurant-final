'use strict';

const authService = require('../services/authService');
const { AppError } = require('../utils/errors');

const authController = {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      authService.signTokenAndSetCookie(user._id, res);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      authService.signTokenAndSetCookie(user._id, res);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      authService.clearCookie(res);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async initAdmin(req, res, next) {
    try {
      const { initSecret, ...userData } = req.body;
      const admin = await authService.initializeAdmin(userData, initSecret);

      res.status(201).json({
        success: true,
        message: 'Admin account created. Remove ADMIN_INIT_SECRET from environment.',
        data: { email: admin.email, role: admin.role },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
