import { PRODUCTS, CATEGORIES } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    if (data?.data && Array.isArray(data.data)) {
      return [{ id: 'all', name: 'All Menu', icon: '🍽️', slug: 'all' }, ...data.data];
    }
    return CATEGORIES;
  } catch (err) {
    // Graceful fallback to rich local menu
    return CATEGORIES;
  }
}

export async function fetchProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    if (data?.data?.products) {
      return data.data.products;
    }
    return PRODUCTS;
  } catch (err) {
    // Graceful fallback filtering locally
    let items = [...PRODUCTS];
    if (params.category && params.category !== 'all') {
      items = items.filter((p) => p.category?.slug === params.category || p.category?._id === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return items;
  }
}

export async function createOrder(orderPayload) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to place order');
    }
    return data.data;
  } catch (err) {
    // Fallback simulation for offline/demo use
    console.warn('Backend API unavailable, simulating successful local order:', err.message);
    const mockOrderNumber = `ENB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockOrder = {
      _id: 'mock-' + Date.now(),
      orderNumber: mockOrderNumber,
      status: 'pending',
      customer: orderPayload.customer,
      items: orderPayload.items,
      pricing: {
        subtotalPKR: orderPayload.items.reduce((acc, i) => acc + (i.unitPricePKR * i.quantity), 0),
        deliveryFeePKR: 150,
        totalPKR: orderPayload.items.reduce((acc, i) => acc + (i.unitPricePKR * i.quantity), 0) + 150,
      },
      payment: {
        method: 'cash_on_delivery',
        status: 'pending',
      },
      branch: 'Samanabad Branch',
      estimatedDeliveryTime: '35 - 45 mins',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage if in browser
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('enb_orders') || '[]');
      existing.unshift(mockOrder);
      localStorage.setItem('enb_orders', JSON.stringify(existing));
    }

    return mockOrder;
  }
}

export async function fetchOrderTracking(orderNumber) {
  try {
    const res = await fetch(`${API_BASE}/orders/track/${orderNumber}`);
    if (!res.ok) throw new Error('Order not found on server');
    const data = await res.json();
    return data.data;
  } catch (err) {
    // Check localStorage fallback
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('enb_orders') || '[]');
      const found = orders.find((o) => o.orderNumber === orderNumber || o._id === orderNumber);
      if (found) return found;
    }
    throw new Error('Order not found with number ' + orderNumber);
  }
}
