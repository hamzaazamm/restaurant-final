'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

// ─── Public routes ─────────────────────────────────────────────────────────────

// GET /api/v1/products
router.get('/', productController.getProducts);

// GET /api/v1/products/featured
router.get('/featured', productController.getFeatured);

// GET /api/v1/products/best-sellers
router.get('/best-sellers', productController.getBestSellers);

// GET /api/v1/products/:identifier (by slug or ID)
router.get('/:identifier', productController.getProduct);

// ─── Admin/Staff protected routes ──────────────────────────────────────────────

// POST /api/v1/products (admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(schemas.createProduct),
  productController.createProduct
);

// PATCH /api/v1/products/:id (admin only)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(schemas.updateProduct),
  productController.updateProduct
);

// DELETE /api/v1/products/:id — archives, never hard-deletes
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  productController.archiveProduct
);

// PATCH /api/v1/products/:id/availability (admin or staff)
router.patch(
  '/:id/availability',
  authenticate,
  requireRole('admin', 'staff'),
  productController.setAvailability
);

module.exports = router;
