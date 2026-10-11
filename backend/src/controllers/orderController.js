'use strict';

const orderService = require('../services/orderService');

const orderController = {
  async createOrder(req, res, next) {
    try {
      // userId from authenticated user (null for guest checkout)
      const userId = req.user ? req.user._id : null;
      const order = await orderService.createOrder(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully! We will confirm your order shortly.',
        data: {
          orderRef: order.orderRef,
          status: order.status,
          pricing: order.pricing,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async trackOrder(req, res, next) {
    try {
      const order = await orderService.getOrderByRef(req.params.orderRef);

      // Only return safe public fields for tracking
      res.status(200).json({
        success: true,
        data: {
          orderRef: order.orderRef,
          status: order.status,
          pricing: order.pricing,
          items: order.items.map((item) => ({
            name: item.name,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPricePKR: item.unitPricePKR,
            lineTotalPKR: item.lineTotalPKR,
          })),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          estimatedDeliveryAt: order.estimatedDeliveryAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin/Staff endpoints
  async listOrders(req, res, next) {
    try {
      const { status, page, limit, search } = req.query;
      const result = await orderService.listOrders({
        status,
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 20, 100),
        search,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req, res, next) {
    try {
      const order = await orderService.getOrderByRef(req.params.orderRef);
      res.status(200).json({ success: true, data: { order } });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status, note } = req.body;
      const order = await orderService.updateStatus(
        req.params.id,
        status,
        req.user._id,
        note
      );
      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { orderRef: order.orderRef, status: order.status },
      });
    } catch (err) {
      next(err);
    }
  },

  async recordPayment(req, res, next) {
    try {
      const order = await orderService.recordPaymentCollection(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: 'COD payment recorded as collected',
        data: {
          orderRef: order.orderRef,
          paymentStatus: order.paymentStatus,
          paymentCollectedAt: order.paymentCollectedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req, res, next) {
    try {
      const stats = await orderService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = orderController;
