'use strict';

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, 'Description cannot exceed 600 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'combo'],
      required: true,
    },
    // Discount value: % for percentage type, PKR for fixed_amount
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Discount value must be an integer' },
    },
    // Optional: min order value to unlock this offer (in PKR)
    minOrderAmountPKR: {
      type: Number,
      default: 0,
      validate: { validator: Number.isInteger, message: 'Min order amount must be integer PKR' },
    },
    // For combo offers: list of products included in the combo
    comboProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],
    comboPricePKR: {
      type: Number,
      default: null,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: 'Combo price must be integer PKR or null',
      },
    },
    image: {
      type: String,
      default: null,
    },
    // Max uses across all orders (null = unlimited)
    maxUses: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ slug: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });

// Auto-generate slug
offerSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

/**
 * Check if this offer is currently valid (active + within date range + uses remaining).
 */
offerSchema.methods.isCurrentlyValid = function () {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
  return true;
};

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
