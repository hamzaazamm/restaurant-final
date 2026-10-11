'use strict';

const { nanoid } = require('nanoid');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const { Order } = require('../models/Order');
const config = require('../config');
const { ValidationError, NotFoundError, ConflictError, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Generate a human-readable, non-sequential order reference.
 * Format: ENB-XXXXXX (6 uppercase alphanumeric chars)
 */
const generateOrderRef = () => `ENB-${nanoid(6).toUpperCase()}`;

const orderService = {
  /**
   * Core order creation service.
   * ALL pricing is calculated here — client prices are completely ignored.
   * @param {object} orderData - Validated order input
   * @param {string|null} userId - ID of authenticated user (null for guests)
   * @returns {object} Created order document
   */
  async createOrder(orderData, userId = null) {
    const { customer, delivery, items, offerId, idempotencyKey } = orderData;

    // 1. Idempotency check — prevent duplicate submissions
    const existing = await Order.findOne({ idempotencyKey }).select('orderRef status');
    if (existing) {
      // Return the existing order — safe replay
      logger.info(`Duplicate order submission for key ${idempotencyKey}, returning existing order ${existing.orderRef}`);
      return existing;
    }

    // 2. Validate and price each item against live database values
    const resolvedItems = [];
    let subtotalPKR = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).populate('category');

      if (!product) {
        throw new NotFoundError(`Product not found: ${item.productId}`);
      }
      if (product.isArchived || !product.isAvailable) {
        throw new ValidationError(`Product is not currently available: ${product.name}`);
      }

      // Resolve variant price from database — never from client
      let unitPricePKR = product.basePricePKR;
      let variantId = null;
      let variantName = null;

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          throw new ValidationError(`Variant not found for product: ${product.name}`);
        }
        if (!variant.isAvailable) {
          throw new ValidationError(`Variant "${variant.name}" is not currently available`);
        }
        unitPricePKR = variant.pricePKR;
        variantId = variant._id;
        variantName = variant.name;
      }

      // Resolve extras from database
      const resolvedExtras = [];
      if (item.extras && item.extras.length > 0) {
        for (const extraId of item.extras) {
          const extra = product.extras.id(extraId);
          if (!extra) {
            throw new ValidationError(`Extra not found: ${extraId} on product: ${product.name}`);
          }
          if (!extra.isAvailable) {
            throw new ValidationError(`Extra "${extra.name}" is not currently available`);
          }
          unitPricePKR += extra.pricePKR;
          resolvedExtras.push({
            extraId: extra._id,
            name: extra.name,
            pricePKR: extra.pricePKR,
          });
        }
      }

      const lineTotalPKR = unitPricePKR * item.quantity;
      subtotalPKR += lineTotalPKR;

      resolvedItems.push({
        product: product._id,
        name: product.name, // Snapshot
        variantId,
        variantName,
        extras: resolvedExtras,
        unitPricePKR,
        quantity: item.quantity,
        lineTotalPKR,
      });
    }

    // 3. Validate minimum order amount
    if (subtotalPKR < config.business.minOrderAmountPKR) {
      throw new ValidationError(
        `Minimum order amount is PKR ${config.business.minOrderAmountPKR}. Your subtotal is PKR ${subtotalPKR}.`
      );
    }

    // 4. Apply offer/discount — validated on server
    let discountPKR = 0;
    let appliedOffer = null;

    if (offerId) {
      const offer = await Offer.findById(offerId);
      if (!offer || !offer.isCurrentlyValid()) {
        throw new ValidationError('The selected offer is no longer valid');
      }
      if (subtotalPKR < offer.minOrderAmountPKR) {
        throw new ValidationError(
          `This offer requires a minimum order of PKR ${offer.minOrderAmountPKR}`
        );
      }

      if (offer.type === 'percentage') {
        discountPKR = Math.floor((subtotalPKR * offer.discountValue) / 100);
      } else if (offer.type === 'fixed_amount') {
        discountPKR = Math.min(offer.discountValue, subtotalPKR);
      }

      appliedOffer = offer._id;
    }

    // 5. Calculate delivery charge
    const afterDiscount = subtotalPKR - discountPKR;
    const deliveryChargePKR =
      afterDiscount >= config.business.freeDeliveryThresholdPKR
        ? 0
        : config.business.deliveryChargePKR;

    // 6. Calculate final total (all integers)
    const totalPKR = afterDiscount + deliveryChargePKR;

    // 7. Generate unique order reference (retry on collision — extremely rare)
    let orderRef;
    let attempts = 0;
    do {
      orderRef = generateOrderRef();
      const refExists = await Order.findOne({ orderRef }).select('_id');
      if (!refExists) break;
      attempts++;
    } while (attempts < 5);

    if (attempts >= 5) {
      throw new AppError('Failed to generate unique order reference', 500);
    }

    // 8. Create the order document
    const order = await Order.create({
      orderRef,
      idempotencyKey,
      customer,
      delivery,
      items: resolvedItems,
      pricing: {
        subtotalPKR,
        deliveryChargePKR,
        discountPKR,
        totalPKR,
      },
      appliedOffer,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      placedBy: userId,
      auditLog: [
        {
          action: 'order_placed',
          performedBy: userId,
          note: 'Order placed by customer',
          timestamp: new Date(),
        },
      ],
    });

    // 9. Increment offer usage count (non-atomic but acceptable for read-light usage)
    if (appliedOffer) {
      await Offer.findByIdAndUpdate(appliedOffer, { $inc: { usedCount: 1 } });
    }

    logger.info(`Order created: ${order.orderRef} — PKR ${order.pricing.totalPKR} (COD)`);
    return order;
  },

  /**
   * Get order by public reference — safe for customer tracking.
   * Only returns safe fields — no idempotency key, no internal IDs.
   */
  async getOrderByRef(orderRef) {
    const order = await Order.findOne({ orderRef })
      .populate('items.product', 'name slug images')
      .select('-idempotencyKey -__v');

    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  },

  /**
   * Update order status — validates transition, records audit entry.
   * Only callable by authorized staff/admin via the controller.
   */
  async updateStatus(orderId, newStatus, performedBy, note = null) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (!order.canTransitionTo(newStatus)) {
      throw new ValidationError(
        `Cannot transition order from "${order.status}" to "${newStatus}"`
      );
    }

    order.status = newStatus;
    order.addAuditEntry(`status_changed_to_${newStatus}`, performedBy, note);

    if (newStatus === 'cancelled' || newStatus === 'rejected') {
      order.cancellation = {
        reason: note,
        cancelledBy: performedBy,
        cancelledAt: new Date(),
      };
    }

    await order.save();
    logger.info(`Order ${order.orderRef} status updated to: ${newStatus} by user ${performedBy}`);
    return order;
  },

  /**
   * Record COD payment collection — only by authorized staff.
   * Marks payment as collected only when staff physically collects the cash.
   */
  async recordPaymentCollection(orderId, staffId) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.status !== 'delivered') {
      throw new ValidationError('Payment can only be collected for delivered orders');
    }
    if (order.paymentStatus === 'collected') {
      throw new ConflictError('Payment has already been recorded as collected');
    }

    order.paymentStatus = 'collected';
    order.paymentCollectedAt = new Date();
    order.paymentCollectedBy = staffId;
    order.addAuditEntry('cod_payment_collected', staffId, 'Cash on delivery payment collected');

    await order.save();
    logger.info(`COD payment collected for order ${order.orderRef} by staff ${staffId}`);
    return order;
  },

  /**
   * Admin: paginated list of orders with optional filters.
   */
  async listOrders({ status, page = 1, limit = 20, search } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderRef: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-idempotencyKey -__v')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  /**
   * Dashboard stats — carefully distinguishes pending vs collected revenue.
   */
  async getDashboardStats() {
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      outForDelivery,
      deliveredOrders,
      collectedRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ status: 'out_for_delivery' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { paymentStatus: 'collected' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalPKR' } } },
      ]),
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderRef status pricing.totalPKR customer.name createdAt paymentStatus')
      .lean();

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      outForDelivery,
      deliveredOrders,
      // Only report actually collected cash — never count pending COD as revenue
      collectedRevenuePKR: collectedRevenue[0]?.total || 0,
      recentOrders,
    };
  },
};

module.exports = orderService;
