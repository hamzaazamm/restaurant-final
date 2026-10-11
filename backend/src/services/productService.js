'use strict';

const Product = require('../models/Product');
const Category = require('../models/Category');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const productService = {
  /**
   * Get paginated products with optional filters and search.
   */
  async getProducts({ category, search, page = 1, limit = 16, sortBy = 'sortOrder', available = true } = {}) {
    const filter = { isArchived: false };

    if (available === true || available === 'true') {
      filter.isAvailable = true;
    }

    if (category) {
      // Accept slug or ObjectId
      if (category.length === 24) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category, isActive: true });
        if (!cat) return { products: [], pagination: { total: 0, page, pages: 0, limit } };
        filter.category = cat._id;
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortMap = {
      sortOrder: { sortOrder: 1, name: 1 },
      price_asc: { basePricePKR: 1 },
      price_desc: { basePricePKR: -1 },
      newest: { createdAt: -1 },
      name: { name: 1 },
    };
    const sort = sortMap[sortBy] || { sortOrder: 1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  /**
   * Get featured products for the homepage.
   */
  async getFeaturedProducts(limit = 8) {
    return Product.find({ isFeatured: true, isAvailable: true, isArchived: false })
      .populate('category', 'name slug')
      .sort({ sortOrder: 1 })
      .limit(limit)
      .lean();
  },

  /**
   * Get best sellers for homepage.
   */
  async getBestSellers(limit = 4) {
    return Product.find({ isBestSeller: true, isAvailable: true, isArchived: false })
      .populate('category', 'name slug')
      .sort({ sortOrder: 1 })
      .limit(limit)
      .lean();
  },

  /**
   * Get a single product by slug or ID.
   */
  async getProduct(identifier) {
    const filter =
      identifier.length === 24
        ? { _id: identifier }
        : { slug: identifier };

    const product = await Product.findOne({ ...filter, isArchived: false })
      .populate('category', 'name slug');

    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  /**
   * Create a new product (admin only — enforced at controller level).
   */
  async createProduct(data) {
    const product = await Product.create(data);
    logger.info(`Product created: ${product.name} (${product._id})`);
    return product;
  },

  /**
   * Update product fields (admin only).
   */
  async updateProduct(id, data) {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new NotFoundError('Product not found');
    logger.info(`Product updated: ${product.name} (${product._id})`);
    return product;
  },

  /**
   * Archive a product (soft delete — never hard delete with orders referencing it).
   */
  async archiveProduct(id) {
    const product = await Product.findByIdAndUpdate(
      id,
      { isArchived: true, isAvailable: false },
      { new: true }
    );
    if (!product) throw new NotFoundError('Product not found');
    logger.info(`Product archived: ${product.name} (${product._id})`);
    return product;
  },

  /**
   * Toggle product availability.
   */
  async setAvailability(id, isAvailable) {
    const product = await Product.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  // ─── Category methods ──────────────────────────────────────────────────────

  async getCategories() {
    return Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  },

  async createCategory(data) {
    const existing = await Category.findOne({ name: data.name });
    if (existing) throw new ConflictError('Category already exists');
    const category = await Category.create(data);
    logger.info(`Category created: ${category.name}`);
    return category;
  },

  async updateCategory(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },
};

module.exports = productService;
