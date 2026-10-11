'use strict';

const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Pakistani phone number regex — accepts:
 * 03XXXXXXXXX, +923XXXXXXXXX, 00923XXXXXXXXX, 3XXXXXXXXX
 */
const PAKISTANI_PHONE_REGEX = /^(\+92|0092|0)?3[0-9]{9}$/;

// ─── Common schemas ────────────────────────────────────────────────────────────

const mongoIdSchema = Joi.string().hex().length(24).required();

// ─── Auth validators ───────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().lowercase().max(254).required(),
  phone: Joi.string().pattern(PAKISTANI_PHONE_REGEX).required().messages({
    'string.pattern.base': 'Please provide a valid Pakistani phone number (e.g. 03001234567)',
  }),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

// ─── Order validators ──────────────────────────────────────────────────────────

const orderItemSchema = Joi.object({
  productId: mongoIdSchema,
  variantId: Joi.string().hex().length(24).allow(null).default(null),
  extras: Joi.array()
    .items(Joi.string().hex().length(24))
    .max(10)
    .default([]),
  quantity: Joi.number().integer().min(1).max(20).required(),
});

const createOrderSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    phone: Joi.string().pattern(PAKISTANI_PHONE_REGEX).required().messages({
      'string.pattern.base': 'Please provide a valid Pakistani phone number',
    }),
    email: Joi.string().trim().email().lowercase().max(254).allow('', null).default(null),
  }).required(),
  delivery: Joi.object({
    address: Joi.string().trim().min(10).max(400).required(),
    instructions: Joi.string().trim().max(300).allow('', null).default(null),
    area: Joi.string().trim().max(80).allow('', null).default(null),
  }).required(),
  items: Joi.array().items(orderItemSchema).min(1).max(50).required(),
  offerId: Joi.string().hex().length(24).allow(null).default(null),
  idempotencyKey: Joi.string().uuid().required(),
});

// ─── Product validators ────────────────────────────────────────────────────────

const variantSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  pricePKR: Joi.number().integer().min(0).required(),
  isDefault: Joi.boolean().default(false),
  isAvailable: Joi.boolean().default(true),
});

const extraSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  pricePKR: Joi.number().integer().min(0).required(),
  isAvailable: Joi.boolean().default(true),
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  description: Joi.string().trim().max(800).allow('').default(''),
  category: mongoIdSchema,
  basePricePKR: Joi.number().integer().min(0).required(),
  variants: Joi.array().items(variantSchema).default([]),
  extras: Joi.array().items(extraSchema).default([]),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
  isFeatured: Joi.boolean().default(false),
  isBestSeller: Joi.boolean().default(false),
  isAvailable: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).default([]),
  sortOrder: Joi.number().integer().default(0),
});

const updateProductSchema = createProductSchema.fork(
  ['name', 'category', 'basePricePKR'],
  (schema) => schema.optional()
);

// ─── Category validators ───────────────────────────────────────────────────────

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(60).required(),
  description: Joi.string().trim().max(300).allow('').default(''),
  image: Joi.string().uri().allow(null).default(null),
  icon: Joi.string().max(30).allow(null).default(null),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
});

// ─── Order status update validator ────────────────────────────────────────────

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'rejected')
    .required(),
  note: Joi.string().trim().max(300).allow('', null).default(null),
});

// ─── Contact form validator ────────────────────────────────────────────────────

const contactFormSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().pattern(PAKISTANI_PHONE_REGEX).allow('', null).default(null),
  subject: Joi.string().trim().max(120).required(),
  message: Joi.string().trim().min(10).max(2000).required(),
});

// ─── Validation middleware factory ─────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against the given schema.
 * Throws ValidationError with field details on failure.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove unexpected fields
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }

    req.body = value; // Use sanitized/coerced value
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    createOrder: createOrderSchema,
    createProduct: createProductSchema,
    updateProduct: updateProductSchema,
    createCategory: createCategorySchema,
    updateOrderStatus: updateOrderStatusSchema,
    contactForm: contactFormSchema,
  },
};
