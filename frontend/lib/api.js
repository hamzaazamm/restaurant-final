import { PRODUCTS, CATEGORIES } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

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
  // Build the backend-compatible payload
  const backendPayload = {
    customer: orderPayload.customer,
    // Backend expects: delivery.address (string), delivery.area, delivery.instructions
    delivery: {
      address: [
        orderPayload.deliveryAddress?.street,
        orderPayload.deliveryAddress?.area,
        orderPayload.deliveryAddress?.city || 'Lahore',
      ]
        .filter(Boolean)
        .join(', '),
      area: orderPayload.deliveryAddress?.area || null,
      instructions: orderPayload.specialInstructions || null,
    },
    // Backend expects items with `productId` (MongoDB ObjectId), not `product`
    items: orderPayload.items.map((item) => ({
      productId: item.product,
      variantId: item.variantId || null,
      extras: item.extras || [],
      quantity: item.quantity,
    })),
    // Required by backend for idempotency (prevent duplicate orders)
    idempotencyKey: crypto.randomUUID(),
    offerId: null,
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      // Surface backend validation details if available
      const detail = data.details?.map((d) => d.message).join(', ');
      throw new Error(detail || data.message || 'Failed to place order');
    }
    // Normalise: backend returns `orderRef`, frontend uses `orderNumber`
    return { ...data.data, orderNumber: data.data.orderRef };
  } catch (err) {
    // Fallback simulation for offline/demo use
    console.warn('Backend API unavailable, simulating successful local order:', err.message);
    const mockOrderNumber = `ENB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockOrder = {
      _id: 'mock-' + Date.now(),
      orderNumber: mockOrderNumber,
      orderRef: mockOrderNumber,
      status: 'pending',
      customer: orderPayload.customer,
      items: orderPayload.items,
      pricing: {
        subtotalPKR: orderPayload.items.reduce((acc, i) => acc + (i.unitPricePKR * i.quantity), 0),
        deliveryFeePKR: 150,
        totalPKR: orderPayload.items.reduce((acc, i) => acc + (i.unitPricePKR * i.quantity), 0) + 150,
      },
      payment: { method: 'cash_on_delivery', status: 'pending' },
      branch: 'Samanabad Branch',
      estimatedDeliveryTime: '35 - 45 mins',
      createdAt: new Date().toISOString(),
    };

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

export async function fetchOrders(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch orders from database');
    }
    const data = await res.json();
    return data.data; // { orders: [...], pagination: {...} }
  } catch (err) {
    console.error('fetchOrders error:', err);
    throw err;
  }
}

export async function updateOrderStatusApi(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update order status');
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('updateOrderStatusApi error:', err);
    throw err;
  }
}
