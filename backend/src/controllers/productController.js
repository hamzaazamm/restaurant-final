'use strict';

const productService = require('../services/productService');

const productController = {
  async getProducts(req, res, next) {
    try {
      const { category, search, page, limit, sortBy, available } = req.query;
      const result = await productService.getProducts({
        category,
        search,
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 16, 50),
        sortBy,
        available: available !== 'false',
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getFeatured(req, res, next) {
    try {
      const products = await productService.getFeaturedProducts(8);
      res.status(200).json({ success: true, data: { products } });
    } catch (err) {
      next(err);
    }
  },

  async getBestSellers(req, res, next) {
    try {
      const products = await productService.getBestSellers(4);
      res.status(200).json({ success: true, data: { products } });
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req, res, next) {
    try {
      const product = await productService.getProduct(req.params.identifier);
      res.status(200).json({ success: true, data: { product } });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: { product } });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.status(200).json({ success: true, data: { product } });
    } catch (err) {
      next(err);
    }
  },

  async archiveProduct(req, res, next) {
    try {
      const product = await productService.archiveProduct(req.params.id);
      res.status(200).json({ success: true, message: 'Product archived', data: { product } });
    } catch (err) {
      next(err);
    }
  },

  async setAvailability(req, res, next) {
    try {
      const { isAvailable } = req.body;
      const product = await productService.setAvailability(req.params.id, isAvailable);
      res.status(200).json({ success: true, data: { product } });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      res.status(200).json({ success: true, data: { categories } });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await productService.createCategory(req.body);
      res.status(201).json({ success: true, data: { category } });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const category = await productService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, data: { category } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productController;
