'use strict';

/**
 * Database seed script — inserts clearly labeled SAMPLE data.
 * ⚠️  This script populates SAMPLE/PROVISIONAL data for development and demo.
 *     All menu items, prices, and descriptions are fabricated.
 *     Replace with verified Eats N Bites official data before production launch.
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const logger = require('../utils/logger');

const SAMPLE_CATEGORIES = [
  { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 1, description: 'Juicy, flame-grilled burgers loaded with fresh toppings' },
  { name: 'Pizzas', slug: 'pizzas', icon: '🍕', sortOrder: 2, description: 'Freshly baked pizzas with premium toppings' },
  { name: 'Fried Chicken', slug: 'fried-chicken', icon: '🍗', sortOrder: 3, description: 'Crispy golden fried chicken — Lahore style' },
  { name: 'Deals', slug: 'deals', icon: '🎁', sortOrder: 4, description: 'Best value combo deals for the whole family' },
  { name: 'Sides', slug: 'sides', icon: '🍟', sortOrder: 5, description: 'Loaded fries, spring rolls, and more' },
  { name: 'Drinks', slug: 'drinks', icon: '🥤', sortOrder: 6, description: 'Refreshing beverages to complement your meal' },
];

// NOTE: All prices below are SAMPLE/PROVISIONAL — replace with verified menu data
const getSampleProducts = (categories) => {
  const catMap = {};
  categories.forEach((c) => { catMap[c.slug] = c._id; });

  return [
    // ─── BURGERS ───────────────────────────────────────────────────────────────
    {
      name: 'Molten Lava Pro Burger',
      slug: 'molten-lava-pro-burger',
      description: '[SAMPLE] A signature double-patty burger with molten cheese, crispy lettuce, fresh tomatoes, and our special ENB sauce.',
      category: catMap['burgers'],
      basePricePKR: 650,
      variants: [
        { name: 'Single', pricePKR: 450, isDefault: true },
        { name: 'Double', pricePKR: 650 },
      ],
      extras: [
        { name: 'Extra Cheese', pricePKR: 50 },
        { name: 'Extra Patty', pricePKR: 150 },
        { name: 'Jalapeños', pricePKR: 30 },
      ],
      isFeatured: true,
      isBestSeller: true,
      tags: ['bestseller', 'spicy'],
      sortOrder: 1,
    },
    {
      name: 'Zinger Burger',
      slug: 'zinger-burger',
      description: '[SAMPLE] Crispy spiced chicken fillet with coleslaw and mayo in a toasted bun.',
      category: catMap['burgers'],
      basePricePKR: 420,
      isFeatured: true,
      isBestSeller: true,
      tags: ['chicken', 'crispy'],
      sortOrder: 2,
    },
    {
      name: 'Fish Fillet Burger',
      slug: 'fish-fillet-burger',
      description: '[SAMPLE] Crispy fish fillet with tartar sauce and fresh lettuce.',
      category: catMap['burgers'],
      basePricePKR: 380,
      tags: ['fish'],
      sortOrder: 3,
    },
    {
      name: 'Classic Beef Burger',
      slug: 'classic-beef-burger',
      description: '[SAMPLE] A no-frills classic beef patty with all the essentials.',
      category: catMap['burgers'],
      basePricePKR: 320,
      sortOrder: 4,
    },

    // ─── PIZZAS ────────────────────────────────────────────────────────────────
    {
      name: 'Crown Crust Kabab Pizza',
      slug: 'crown-crust-kabab-pizza',
      description: '[SAMPLE] A fan favourite — loaded kabab toppings on our special crown crust base.',
      category: catMap['pizzas'],
      basePricePKR: 950,
      variants: [
        { name: 'Medium (8")', pricePKR: 650, isDefault: true },
        { name: 'Large (12")', pricePKR: 950 },
        { name: 'Family (16")', pricePKR: 1350 },
      ],
      isFeatured: true,
      isBestSeller: true,
      tags: ['kabab', 'bestseller'],
      sortOrder: 1,
    },
    {
      name: 'Chicken Tikka Pizza',
      slug: 'chicken-tikka-pizza',
      description: '[SAMPLE] Tender chicken tikka chunks with onions, capsicum, and masala sauce.',
      category: catMap['pizzas'],
      basePricePKR: 850,
      variants: [
        { name: 'Medium (8")', pricePKR: 600, isDefault: true },
        { name: 'Large (12")', pricePKR: 850 },
        { name: 'Family (16")', pricePKR: 1200 },
      ],
      isFeatured: true,
      tags: ['tikka', 'spicy'],
      sortOrder: 2,
    },
    {
      name: 'BBQ Chicken Pizza',
      slug: 'bbq-chicken-pizza',
      description: '[SAMPLE] Smoky BBQ sauce base topped with grilled chicken and mozzarella.',
      category: catMap['pizzas'],
      basePricePKR: 780,
      variants: [
        { name: 'Medium (8")', pricePKR: 550, isDefault: true },
        { name: 'Large (12")', pricePKR: 780 },
      ],
      sortOrder: 3,
    },

    // ─── FRIED CHICKEN ─────────────────────────────────────────────────────────
    {
      name: 'Crispy Fried Chicken (2 Pcs)',
      slug: 'crispy-fried-chicken-2pc',
      description: '[SAMPLE] Our signature crispy spiced chicken pieces, golden and juicy inside.',
      category: catMap['fried-chicken'],
      basePricePKR: 380,
      isBestSeller: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Hot Wings (6 Pcs)',
      slug: 'hot-wings-6pc',
      description: '[SAMPLE] Spicy buffalo wings tossed in our house hot sauce.',
      category: catMap['fried-chicken'],
      basePricePKR: 420,
      tags: ['spicy', 'wings'],
      sortOrder: 2,
    },

    // ─── SIDES ─────────────────────────────────────────────────────────────────
    {
      name: 'Loaded Fries',
      slug: 'loaded-fries',
      description: '[SAMPLE] Crispy fries topped with cheese sauce, jalapeños, and sour cream.',
      category: catMap['sides'],
      basePricePKR: 280,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Spring Rolls (4 Pcs)',
      slug: 'spring-rolls-4pc',
      description: '[SAMPLE] Crispy vegetable spring rolls served with sweet chilli dip.',
      category: catMap['sides'],
      basePricePKR: 200,
      sortOrder: 2,
    },
    {
      name: 'Mexican Sandwich',
      slug: 'mexican-sandwich',
      description: '[SAMPLE] Spiced chicken with guacamole and jalapeños in a toasted sub.',
      category: catMap['sides'],
      basePricePKR: 350,
      sortOrder: 3,
    },

    // ─── DRINKS ────────────────────────────────────────────────────────────────
    {
      name: 'Soft Drink',
      slug: 'soft-drink',
      description: '[SAMPLE] Pepsi, 7Up, or Mountain Dew.',
      category: catMap['drinks'],
      basePricePKR: 80,
      variants: [
        { name: 'Regular (330ml)', pricePKR: 80, isDefault: true },
        { name: 'Large (500ml)', pricePKR: 120 },
      ],
      sortOrder: 1,
    },
    {
      name: 'Mineral Water',
      slug: 'mineral-water',
      description: '[SAMPLE] Nestle Pure Life 500ml.',
      category: catMap['drinks'],
      basePricePKR: 60,
      sortOrder: 2,
    },
  ];
};

const SAMPLE_OFFERS = [
  {
    title: 'Family Deal',
    slug: 'family-deal',
    description: '[SAMPLE] Feed the whole family — 2 large pizzas + 4 drinks + fries. Great value!',
    type: 'combo',
    discountValue: 200,
    comboPricePKR: 1800,
    minOrderAmountPKR: 0,
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  {
    title: '10% Off Your First Order',
    slug: 'first-order-discount',
    description: '[SAMPLE] New to Eats N Bites? Get 10% off on your first order!',
    type: 'percentage',
    discountValue: 10,
    minOrderAmountPKR: 500,
    isActive: true,
  },
  {
    title: 'Free Delivery Deal',
    slug: 'free-delivery-deal',
    description: '[SAMPLE] Order above PKR 500 and enjoy free delivery!',
    type: 'fixed_amount',
    discountValue: 100, // Covers delivery charge
    minOrderAmountPKR: 500,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await connectDB();
    logger.info('🌱 Starting database seed...');
    logger.warn('⚠️  This inserts SAMPLE/PROVISIONAL data. Replace with verified menu data before production.');

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Offer.deleteMany({}),
    ]);
    logger.info('Cleared existing categories, products, and offers');

    // Insert categories
    const categories = await Category.insertMany(SAMPLE_CATEGORIES);
    logger.info(`✅ Inserted ${categories.length} sample categories`);

    // Insert products
    const productData = getSampleProducts(categories);
    const products = await Product.insertMany(productData);
    logger.info(`✅ Inserted ${products.length} sample products`);

    // Insert offers
    const offers = await Offer.insertMany(SAMPLE_OFFERS);
    logger.info(`✅ Inserted ${offers.length} sample offers`);

    logger.info('🎉 Seed completed successfully!');
    logger.info('Next steps: Run npm run seed:admin to create the first admin account');

  } catch (err) {
    logger.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
