'use strict';

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');
const config = require('../config');

/**
 * Centralized error handler for Express.
 * Converts all errors to consistent JSON API responses.
 * Never leaks stack traces or internal details in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // --- Handle specific error types ---

  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    details = null;
  }

  // Mongoose cast error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
    details = null;
  }

  // JWT errors (should be caught in auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    details = null;
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    details = null;
  }

  // --- Log the error ---
  const isOperational = err.isOperational === true;
  if (statusCode >= 500 && !isOperational) {
    // Unexpected error — log full details for investigation
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error', {
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // --- Build safe response ---
  const response = {
    success: false,
    message,
    ...(details && { details }),
    // Only include stack trace in development for non-500 bugs
    ...(config.isDevelopment && statusCode >= 500 && { stack: err.stack }),
  };

  // Generic message for unexpected server errors in production
  if (statusCode === 500 && config.isProduction) {
    response.message = 'An internal error occurred. Please try again later.';
    delete response.details;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler — catches unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFoundHandler };
