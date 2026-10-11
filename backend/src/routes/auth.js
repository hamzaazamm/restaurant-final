'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../validators');
const { authLimiter, authSpeedLimiter } = require('../middleware/rateLimiter');

// POST /api/v1/auth/register
router.post('/register', authLimiter, validate(schemas.register), authController.register);

// POST /api/v1/auth/login
router.post('/login', authLimiter, authSpeedLimiter, validate(schemas.login), authController.login);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/v1/auth/me — returns current user info
router.get('/me', authenticate, authController.me);

// POST /api/v1/auth/init-admin — one-time admin initialization, requires secret
router.post('/init-admin', authController.initAdmin);

module.exports = router;
