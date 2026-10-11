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
  { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 1, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', description: 'Juicy, flame-grilled burgers loaded with fresh toppings' },
  { name: 'Pizzas', slug: 'pizzas', icon: '🍕', sortOrder: 2, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', description: 'Freshly baked pizzas with premium toppings' },
  { name: 'Fried Chicken', slug: 'fried-chicken', icon: '🍗', sortOrder: 3, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80', description: 'Crispy golden fried chicken — Lahore style' },
  { name: 'Deals', slug: 'deals', icon: '🎁', sortOrder: 4, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', description: 'Best value combo deals for the whole family' },
  { name: 'Sides', slug: 'sides', icon: '🍟', sortOrder: 5, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&q=80', description: 'Loaded fries, spring rolls, and more' },
  { name: 'Drinks', slug: 'drinks', icon: '🥤', sortOrder: 6, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80', description: 'Refreshing beverages to complement your meal' },
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
      description: 'A signature double-patty burger with molten cheese, crispy lettuce, fresh tomatoes, and our special ENB sauce.',
      category: catMap['burgers'],
      basePricePKR: 650,
      images: ['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80'],
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
      description: 'Crispy spiced chicken fillet with coleslaw and mayo in a toasted bun.',
      category: catMap['burgers'],
      basePricePKR: 420,
      images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'],
      isFeatured: true,
      isBestSeller: true,
      tags: ['chicken', 'crispy'],
      sortOrder: 2,
    },
    {
      name: 'Fish Fillet Burger',
      slug: 'fish-fillet-burger',
      description: 'Crispy fish fillet with tartar sauce and fresh lettuce.',
      category: catMap['burgers'],
      basePricePKR: 380,
      images: ['https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80'],
      tags: ['fish'],
      sortOrder: 3,
    },
    {
      name: 'Classic Beef Burger',
      slug: 'classic-beef-burger',
      description: 'A no-frills classic beef patty with all the essentials.',
      category: catMap['burgers'],
      basePricePKR: 320,
      images: ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'],
      sortOrder: 4,
    },

    // ─── PIZZAS ────────────────────────────────────────────────────────────────
    {
      name: 'Crown Crust Kabab Pizza',
      slug: 'crown-crust-kabab-pizza',
      description: 'A fan favourite — loaded kabab toppings on our special crown crust base.',
      category: catMap['pizzas'],
      basePricePKR: 950,
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'],
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
      description: 'Tender chicken tikka chunks with onions, capsicum, and masala sauce.',
      category: catMap['pizzas'],
      basePricePKR: 850,
      images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80'],
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
      description: 'Smoky BBQ sauce base topped with grilled chicken and mozzarella.',
      category: catMap['pizzas'],
      basePricePKR: 780,
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'],
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
      description: 'Our signature crispy spiced chicken pieces, golden and juicy inside.',
      category: catMap['fried-chicken'],
      basePricePKR: 380,
      images: ['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80'],
      isBestSeller: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Hot Wings (6 Pcs)',
      slug: 'hot-wings-6pc',
      description: 'Spicy buffalo wings tossed in our house hot sauce.',
      category: catMap['fried-chicken'],
      basePricePKR: 420,
      images: ['https://images.unsplash.com/photo-1527477378408-180a5633205b?w=800&q=80'],
      tags: ['spicy', 'wings'],
      sortOrder: 2,
    },

    // ─── SIDES ─────────────────────────────────────────────────────────────────
    {
      name: 'Loaded Fries',
      slug: 'loaded-fries',
      description: 'Crispy fries topped with cheese sauce, jalapeños, and sour cream.',
      category: catMap['sides'],
      basePricePKR: 280,
      images: ['https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80'],
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Spring Rolls (4 Pcs)',
      slug: 'spring-rolls-4pc',
      description: 'Crispy vegetable spring rolls served with sweet chilli dip.',
      category: catMap['sides'],
      basePricePKR: 200,
      images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'],
      sortOrder: 2,
    },
    {
      name: 'Mexican Sandwich',
      slug: 'mexican-sandwich',
      description: 'Spiced chicken with guacamole and jalapeños in a toasted sub.',
      category: catMap['sides'],
      basePricePKR: 350,
      images: ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80'],
      sortOrder: 3,
    },

    // ─── DRINKS ────────────────────────────────────────────────────────────────
    {
      name: 'Soft Drink',
      slug: 'soft-drink',
      description: 'Pepsi, 7Up, or Mountain Dew.',
      category: catMap['drinks'],
      basePricePKR: 80,
      images: ['https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'],
      variants: [
        { name: 'Regular (330ml)', pricePKR: 80, isDefault: true },
        { name: 'Large (500ml)', pricePKR: 120 },
      ],
      sortOrder: 1,
    },
    {
      name: 'Mineral Water',
      slug: 'mineral-water',
      description: 'Nestle Pure Life 500ml.',
      category: catMap['drinks'],
      basePricePKR: 60,
      images: ['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&q=80'],
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
