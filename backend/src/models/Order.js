'use strict';

const mongoose = require('mongoose');

// ORDER_STATUSES defines the valid lifecycle transitions
const ORDER_STATUSES = [
  'pending',       // Just placed — awaiting staff confirmation
  'confirmed',     // Confirmed by staff
  'preparing',     // Being prepared in kitchen
  'ready',         // Ready for dispatch/pickup
  'out_for_delivery', // Out for delivery
  'delivered',     // Successfully delivered
  'cancelled',     // Cancelled by customer or staff
  'rejected',      // Rejected by restaurant
];

// Valid transitions: what status can follow each status
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [], // Terminal
  cancelled: [], // Terminal
  rejected: [],  // Terminal
};

// Immutable snapshot of an ordered item — never references live product
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Snapshot fields — captured at order time, immutable after creation
    name: { type: String, required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    variantName: { type: String, default: null },
    extras: [
      {
        extraId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        pricePKR: { type: Number },
      },
    ],
    unitPricePKR: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Price must be integer PKR' },
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [20, 'Quantity cannot exceed 20'],
      validate: { validator: Number.isInteger, message: 'Quantity must be integer' },
    },
    lineTotalPKR: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Line total must be integer PKR' },
    },
  },
  { _id: true }
);

// Audit log entry for order events
const auditEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Public-facing reference — safe to share, non-sequential
    orderRef: {
      type: String,
      required: true,
      unique: true,
    },
    // Idempotency key from client to prevent duplicate submissions
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    // Customer info — captured for COD delivery
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [80, 'Name cannot exceed 80 characters'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^(\+92|0092|0)?3[0-9]{9}$/, 'Valid Pakistani phone number required'],
      },
      email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
        default: null,
      },
    },
    // Delivery details
    delivery: {
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true,
        maxlength: [400, 'Address cannot exceed 400 characters'],
      },
      instructions: {
        type: String,
        default: null,
        maxlength: [300, 'Instructions cannot exceed 300 characters'],
      },
      area: {
        type: String,
        default: null,
      },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },
    // Pricing — all in integer PKR, calculated on backend
    pricing: {
      subtotalPKR: {
        type: Number,
        required: true,
        min: 0,
        validate: { validator: Number.isInteger, message: 'Subtotal must be integer PKR' },
      },
      deliveryChargePKR: {
        type: Number,
        required: true,
        default: 100,
        validate: { validator: Number.isInteger, message: 'Delivery charge must be integer PKR' },
      },
      discountPKR: {
        type: Number,
        default: 0,
        validate: { validator: Number.isInteger, message: 'Discount must be integer PKR' },
      },
      totalPKR: {
        type: Number,
        required: true,
        min: 0,
        validate: { validator: Number.isInteger, message: 'Total must be integer PKR' },
      },
    },
    appliedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    // COD only — payment fields
    paymentMethod: {
      type: String,
      enum: ['cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'collected'],
      default: 'pending',
    },
    paymentCollectedAt: {
      type: Date,
      default: null,
    },
    paymentCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Which user account placed the order (null for guest orders)
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Cancellation/rejection info
    cancellation: {
      reason: { type: String, default: null },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      cancelledAt: { type: Date, default: null },
    },
    // Audit trail for all status changes
    auditLog: {
      type: [auditEntrySchema],
      default: [],
    },
    // Estimated delivery time (set by staff after confirmation)
    estimatedDeliveryAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common order queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ placedBy: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

/**
 * Check if a transition to a new status is valid.
 * Enforced on the backend — clients cannot skip states.
 */
orderSchema.methods.canTransitionTo = function (newStatus) {
  const allowed = VALID_TRANSITIONS[this.status] || [];
  return allowed.includes(newStatus);
};

/**
 * Add an entry to the immutable audit log.
 */
orderSchema.methods.addAuditEntry = function (action, performedBy = null, note = null) {
  this.auditLog.push({ action, performedBy, note, timestamp: new Date() });
};

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order, ORDER_STATUSES, VALID_TRANSITIONS };
