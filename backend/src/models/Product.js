'use strict';

const mongoose = require('mongoose');

// Sub-schema for variants (e.g., Small / Medium / Large)
const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Variant name cannot exceed 50 characters'],
    },
    // Price stored as integer PKR to avoid floating-point issues
    pricePKR: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer (PKR)',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

// Sub-schema for extras/add-ons (e.g., Extra Cheese)
const extraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Extra name cannot exceed 50 characters'],
    },
    pricePKR: {
      type: Number,
      required: true,
      min: [0, 'Extra price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Extra price must be an integer (PKR)',
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
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
      maxlength: [800, 'Description cannot exceed 800 characters'],
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    // Base price — used when no variants exist
    basePricePKR: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Base price must be an integer (PKR)',
      },
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    extras: {
      type: [extraSchema],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    // Tags for filtering: e.g., 'spicy', 'vegetarian'
    tags: {
      type: [String],
      default: [],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    // Nutritional info — optional, populated if known
    nutrition: {
      calories: { type: Number, default: null },
      allergens: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
// Note: slug unique index is already defined via `unique: true` on the field
productSchema.index({ category: 1, isAvailable: 1, isArchived: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Full-text search

// Auto-generate slug from name
productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

/**
 * Calculate the effective price for a given variant ID.
 * Falls back to base price if no variants or variant not found.
 * Returns integer PKR.
 */
productSchema.methods.getPrice = function (variantId = null) {
  if (variantId && this.variants.length > 0) {
    const variant = this.variants.id(variantId);
    if (variant && variant.isAvailable) return variant.pricePKR;
  }
  // Fall back to default variant or base price
  const defaultVariant = this.variants.find((v) => v.isDefault && v.isAvailable);
  return defaultVariant ? defaultVariant.pricePKR : this.basePricePKR;
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
