'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../validators');
const { orderLimiter, trackingLimiter } = require('../middleware/rateLimiter');

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

// ─── Admin/Staff protected routes ──────────────────────────────────────────────

// GET /api/v1/orders — list all orders (staff+)
router.get(
  '/',
  authenticate,
  requireRole('admin', 'staff'),
  orderController.listOrders
);

// GET /api/v1/orders/dashboard — admin dashboard stats
router.get(
  '/dashboard',
  authenticate,
  requireRole('admin'),
  orderController.getDashboard
);

// GET /api/v1/orders/:orderRef — full order detail (staff+)
router.get(
  '/:orderRef',
  authenticate,
  requireRole('admin', 'staff'),
  orderController.getOrder
);

// PATCH /api/v1/orders/:id/status — update status (staff+)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin', 'staff'),
  validate(schemas.updateOrderStatus),
  orderController.updateStatus
);

// PATCH /api/v1/orders/:id/payment — record COD collection (staff+)
router.patch(
  '/:id/payment',
  authenticate,
  requireRole('admin', 'staff'),
  orderController.recordPayment
);

module.exports = router;
