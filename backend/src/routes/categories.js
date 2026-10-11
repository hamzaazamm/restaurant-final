'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

// GET /api/v1/categories
router.get('/', productController.getCategories);

// POST /api/v1/categories (admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(schemas.createCategory),
  productController.createCategory
);

// PATCH /api/v1/categories/:id (admin only)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  productController.updateCategory
);

module.exports = router;
