'use strict';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const { Order } = require('../src/models/Order');
const orderService = require('../src/services/orderService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
});

describe('Order Service Tests', () => {
  test('Server strictly prices items from database and applies standard delivery under 500 PKR threshold', async () => {
    const category = await Category.create({
      name: 'Drinks',
      slug: 'drinks',
      sortOrder: 1,
    });

    const drink = await Product.create({
      name: 'Chilled Shake',
      slug: 'chilled-shake',
      category: category._id,
      basePricePKR: 350,
      isAvailable: true,
    });

    // 1 item: subtotal = 350 PKR (< 500 threshold, so standard 100 delivery charge applies)
    const orderInput = {
      idempotencyKey: 'test-key-001',
      customer: {
        name: 'Ali Ahmed',
        phone: '03001234567',
        email: 'ali@example.com',
      },
      delivery: {
        address: '19-A Main, Poonch Road',
        area: 'Samanabad',
        notes: 'Ring doorbell twice',
      },
      items: [
        {
          productId: drink._id.toString(),
          quantity: 1,
        },
      ],
    };

    const order = await orderService.createOrder(orderInput);

    expect(order).toBeDefined();
    expect(order.orderRef).toMatch(/^ENB-[A-Za-z0-9_-]{6}$/);
    expect(order.customer.name).toBe('Ali Ahmed');
    expect(order.status).toBe('pending');

    // Subtotal = 350 PKR, deliveryCharge = 100 PKR, total = 450 PKR
    expect(order.pricing.subtotalPKR).toBe(350);
    expect(order.pricing.deliveryChargePKR).toBe(100);
    expect(order.pricing.totalPKR).toBe(450);
  });

  test('Applies free delivery when subtotal meets or exceeds 500 PKR threshold', async () => {
    const category = await Category.create({ name: 'Burgers', slug: 'burgers' });
    const burger = await Product.create({
      name: 'Molten Lava Pro Burger',
      slug: 'molten-lava-pro-burger',
      category: category._id,
      basePricePKR: 650,
      isAvailable: true,
    });

    const orderInput = {
      idempotencyKey: 'free-delivery-key-002',
      customer: { name: 'Bilal Khan', phone: '03009876543' },
      delivery: { address: 'Model Town, Lahore', area: 'Model Town' },
      items: [{ productId: burger._id.toString(), quantity: 1 }],
    };

    const order = await orderService.createOrder(orderInput);
    expect(order.pricing.subtotalPKR).toBe(650);
    expect(order.pricing.deliveryChargePKR).toBe(0); // Free delivery!
    expect(order.pricing.totalPKR).toBe(650);
  });

  test('Prevents duplicate submissions via idempotency key', async () => {
    const category = await Category.create({ name: 'Pizzas', slug: 'pizzas' });
    const pizza = await Product.create({
      name: 'Crown Crust Pizza',
      slug: 'crown-crust-pizza',
      category: category._id,
      basePricePKR: 950,
      isAvailable: true,
    });

    const orderInput = {
      idempotencyKey: 'idempotent-repeat-123',
      customer: { name: 'Sara Khan', phone: '03211234567' },
      delivery: { address: 'Model Town, Lahore', area: 'Model Town' },
      items: [{ productId: pizza._id.toString(), quantity: 1 }],
    };

    const firstOrder = await orderService.createOrder(orderInput);
    const secondOrder = await orderService.createOrder(orderInput);

    expect(secondOrder.orderRef).toBe(firstOrder.orderRef);
  });

  test('Validates status transitions accurately through full order lifecycle', async () => {
    const category = await Category.create({ name: 'Drinks', slug: 'drinks' });
    const drink = await Product.create({
      name: 'Mint Margarita',
      slug: 'mint-margarita',
      category: category._id,
      basePricePKR: 240,
      isAvailable: true,
    });

    const created = await orderService.createOrder({
      idempotencyKey: 'status-test-key',
      customer: { name: 'Hamza Tariq', phone: '03331234567' },
      delivery: { address: 'Gulshan-e-Ravi', area: 'Gulshan-e-Ravi' },
      items: [{ productId: drink._id.toString(), quantity: 2 }],
    });

    const staffId = new mongoose.Types.ObjectId();

    // pending -> confirmed
    const confirmed = await orderService.updateStatus(created._id, 'confirmed', staffId);
    expect(confirmed.status).toBe('confirmed');

    // confirmed -> preparing
    const preparing = await orderService.updateStatus(created._id, 'preparing', staffId);
    expect(preparing.status).toBe('preparing');

    // preparing -> ready
    const ready = await orderService.updateStatus(created._id, 'ready', staffId);
    expect(ready.status).toBe('ready');

    // ready -> out_for_delivery
    const dispatched = await orderService.updateStatus(created._id, 'out_for_delivery', staffId);
    expect(dispatched.status).toBe('out_for_delivery');

    // out_for_delivery -> delivered
    const delivered = await orderService.updateStatus(created._id, 'delivered', staffId);
    expect(delivered.status).toBe('delivered');
  });
});
