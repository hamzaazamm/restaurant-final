'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../validators');
const { orderLimiter, trackingLimiter } = require('../middleware/rateLimiter');

const config = require('../config');

// In development, allow staff/admin dashboard access with optional auth; in production enforce strict auth
const staffOrDevAuth = (req, res, next) => {
  if (config.isDevelopment) {
    return optionalAuth(req, res, next);
  }
  authenticate(req, res, (err) => {
    if (err) return next(err);
    requireRole('admin', 'staff')(req, res, next);
  });
};

// ─── Public routes ─────────────────────────────────────────────────────────────

// POST /api/v1/orders — guest or authenticated checkout
router.post(
  '/',
  orderLimiter,
  optionalAuth,
  validate(schemas.createOrder),
  orderController.createOrder
);

// GET /api/v1/orders/track/:orderRef — public order tracking by reference
router.get('/track/:orderRef', trackingLimiter, orderController.trackOrder);

// ─── Admin/Staff routes ──────────────────────────────────────────────

// GET /api/v1/orders — list all orders (staff+)
router.get(
  '/',
  staffOrDevAuth,
  orderController.listOrders
);

// GET /api/v1/orders/dashboard — admin dashboard stats
router.get(
  '/dashboard',
  staffOrDevAuth,
  orderController.getDashboard
);

// GET /api/v1/orders/:orderRef — full order detail (staff+)
router.get(
  '/:orderRef',
  staffOrDevAuth,
  orderController.getOrder
);

// PATCH /api/v1/orders/:id/status — update status (staff+)
router.patch(
  '/:id/status',
  staffOrDevAuth,
  validate(schemas.updateOrderStatus),
  orderController.updateStatus
);

// PATCH /api/v1/orders/:id/payment — record COD collection (staff+)
router.patch(
  '/:id/payment',
  staffOrDevAuth,
  orderController.recordPayment
);

module.exports = router;
