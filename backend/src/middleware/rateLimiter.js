'use strict';

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const config = require('../config');

/**
 * General API rate limiter — applied globally.
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.max,           // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: () => config.isDevelopment, // Skip in dev for convenience (remove in staging)
});

/**
 * Strict limiter for authentication endpoints.
 * Prevents brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 login attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
});

/**
 * Speed limiter for auth — progressively slows down repeated requests.
 */
const authSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,       // Start slowing after 3 requests
  delayMs: (hits) => (hits - 3) * 500, // Add 500ms per request beyond the threshold
});

/**
 * Strict limiter for order submission endpoint.
 * Prevents rapid duplicate order submissions.
 */
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,                   // 5 order submissions per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order submissions. Please wait a few minutes.',
  },
});

/**
 * Limiter for public contact/enquiry form.
 * Basic spam prevention.
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact requests. Please try again later.',
  },
});

/**
 * Order tracking limiter — prevents enumeration of order references.
 */
const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many tracking requests. Please try again later.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  authSpeedLimiter,
  orderLimiter,
  contactLimiter,
  trackingLimiter,
};
