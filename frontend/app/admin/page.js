'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { fetchOrders, updateOrderStatusApi } from '@/lib/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  preparing: { label: 'In Kitchen', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  ready: { label: 'Ready', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  out_for_delivery: { label: 'On The Road', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
  rejected: { label: 'Rejected', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-500' },
};

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch orders from MongoDB backend
  const loadOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);
    setError('');

    try {
      const data = await fetchOrders({ limit: 100 });
      if (data?.orders) {
        setOrders(data.orders);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load orders from database:', err);
      setError('Could not sync with live database. Trying localStorage backup if available.');
      if (typeof window !== 'undefined') {
        const local = JSON.parse(localStorage.getItem('enb_orders') || '[]');
        if (local.length > 0) setOrders(local);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-refresh interval (every 12 seconds)
  useEffect(() => {
    loadOrders(false);
    const interval = setInterval(() => {
      loadOrders(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Update order status in MongoDB
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');

    try {
      await updateOrderStatusApi(orderId, newStatus);
      // Optimistically update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === 'all' || o.status === filter;
      const ref = (o.orderRef || o.orderNumber || '').toLowerCase();
      const customerName = (o.customer?.name || '').toLowerCase();
      const customerPhone = (o.customer?.phone || '').toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || ref.includes(q) || customerName.includes(q) || customerPhone.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const inKitchen = orders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length;
    const onRoad = orders.filter((o) => o.status === 'out_for_delivery').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + (o.pricing?.totalPKR || 0), 0);

    return { total, pending, inKitchen, onRoad, delivered, revenue };
  }, [orders]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#0032A5] tracking-wider uppercase font-poppins">
                  MongoDB Atlas Live Kitchen Console
                </span>
                {lastUpdated && (
                  <span className="text-[11px] text-gray-400">
                    • Synced {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-gray-900">
                Kitchen &amp; Order Dispatch Panel
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Real-time incoming customer orders stored directly in database collection &quot;orders&quot;.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadOrders(false)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold font-poppins rounded-xl transition-all disabled:opacity-50"
              >
                <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
                {refreshing ? 'Refreshing...' : 'Refresh Orders'}
              </button>

              <Link
                href="/"
                className="px-4 py-2.5 bg-[#0032A5] hover:bg-[#002275] text-white text-xs font-bold font-poppins rounded-xl shadow-sm transition-all"
              >
                View Website ↗
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Orders</span>
              <span className="text-xl font-extrabold font-poppins text-gray-900">{stats.total}</span>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">New / Pending</span>
              <span className="text-xl font-extrabold font-poppins text-amber-600">{stats.pending}</span>
            </div>

            <div className="bg-orange-50 rounded-2xl p-3 text-center border border-orange-100">
              <span className="text-[10px] uppercase font-bold text-orange-700 block">In Kitchen</span>
              <span className="text-xl font-extrabold font-poppins text-orange-600">{stats.inKitchen}</span>
            </div>

            <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">On The Road</span>
              <span className="text-xl font-extrabold font-poppins text-purple-600">{stats.onRoad}</span>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Delivered</span>
              <span className="text-xl font-extrabold font-poppins text-emerald-600">{stats.delivered}</span>
            </div>

            <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
              <span className="text-[10px] uppercase font-bold text-[#0032A5] block">Order Value</span>
              <span className="text-base font-extrabold font-poppins text-[#0032A5]">
                PKR {stats.revenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'confirmed', label: 'Confirmed', count: orders.filter((o) => o.status === 'confirmed').length },
              { id: 'preparing', label: 'Kitchen', count: orders.filter((o) => o.status === 'preparing').length },
              { id: 'out_for_delivery', label: 'On Road', count: stats.onRoad },
              { id: 'delivered', label: 'Delivered', count: stats.delivered },
              { id: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.status === 'cancelled').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-poppins whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filter === tab.id
                    ? 'bg-[#0032A5] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by Order #, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
            />
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-4xl block animate-spin mb-3">⏳</span>
            <p className="text-sm font-bold text-gray-600 font-poppins">Loading orders from MongoDB database...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderRef = order.orderRef || order.orderNumber || order._id;
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isUpdating = updatingId === order._id;
              const deliveryAddress =
                order.delivery?.address ||
                order.deliveryAddress?.street ||
                'Lahore';
              const area = order.delivery?.area || order.deliveryAddress?.area || 'Lahore';
              const instructions = order.delivery?.instructions || order.specialInstructions;

              return (
                <div
                  key={order._id || orderRef}
                  className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                    {/* Left Column: Customer & Delivery Information */}
                    <div className="flex-1 space-y-3">
                      {/* Order Badges Header */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-poppins font-black text-sm tracking-wide bg-blue-50 text-[#0032A5] px-3 py-1 rounded-xl border border-blue-100">
                          {orderRef}
                        </span>

                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl uppercase ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                          {statusCfg.label}
                        </span>

                        <span className="text-xs text-gray-400 font-medium">
                          🕒 {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer Contact */}
                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-gray-900 font-poppins">
                            {order.customer?.name || 'Guest Customer'}
                          </span>
                          {order.customer?.phone && (
                            <a
                              href={`tel:${order.customer.phone}`}
                              className="text-xs font-bold text-[#0032A5] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              📞 {order.customer.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
                          <span>📍</span>
                          <span>
                            <strong>{deliveryAddress}</strong>
                            {area && <span className="ml-1 text-gray-400">({area})</span>}
                          </span>
                        </p>

                        {instructions && (
                          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 mt-2 inline-block">
                            📝 <strong>Special Note:</strong> {instructions}
                          </p>
                        )}
                      </div>

                      {/* Items Ordered */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Order Items ({order.items?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 border border-gray-200/60 rounded-xl px-3 py-1.5 text-xs text-gray-800 flex items-center gap-1.5"
                            >
                              <span className="font-bold text-[#0032A5]">{item.quantity}×</span>
                              <span className="font-medium">{item.name || item.productName}</span>
                              {item.variantName && (
                                <span className="text-gray-400 text-[11px]">({item.variantName})</span>
                              )}
                              <span className="text-gray-500 font-semibold ml-1">
                                PKR {(item.lineTotalPKR || item.unitPricePKR * item.quantity)?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Pricing & Quick Actions */}
                    <div className="lg:w-72 flex flex-col justify-between items-start lg:items-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      
                      {/* Price Summary */}
                      <div className="text-left lg:text-right w-full bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                        <div className="flex justify-between lg:justify-end gap-3 text-xs text-gray-500 mb-0.5">
                          <span>Subtotal:</span>
                          <span>PKR {order.pricing?.subtotalPKR?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between lg:justify-end gap-3 text-xs text-gray-500 mb-1">
                          <span>Delivery:</span>
                          <span>PKR {order.pricing?.deliveryChargePKR?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between lg:justify-end gap-3 font-poppins font-extrabold text-base text-[#0032A5] border-t border-gray-200 pt-1">
                          <span>Total (COD):</span>
                          <span>PKR {order.pricing?.totalPKR?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="w-full space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-left lg:text-right">
                          Change Status
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5 justify-start lg:justify-end">
                          {/* Pending -> Confirmed */}
                          {order.status === 'pending' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order._id, 'confirmed')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-poppins transition-all shadow-sm disabled:opacity-50"
                            >
                              ✓ Confirm
                            </button>
                          )}

                          {/* Move to Kitchen */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order._id, 'preparing')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold font-poppins transition-all shadow-sm disabled:opacity-50"
                            >
                              🍳 Send to Kitchen
                            </button>
                          )}

                          {/* Move to Rider */}
                          {(order.status === 'preparing' || order.status === 'ready') && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order._id, 'out_for_delivery')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold font-poppins transition-all shadow-sm disabled:opacity-50"
                            >
                              🛵 Hand to Rider
                            </button>
                          )}

                          {/* Mark Delivered */}
                          {order.status === 'out_for_delivery' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order._id, 'delivered')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-poppins transition-all shadow-sm disabled:opacity-50"
                            >
                              🎉 Mark Delivered
                            </button>
                          )}

                          {/* Cancel if pending */}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel order ${orderRef}?`)) {
                                  handleStatusChange(order._id, 'cancelled');
                                }
                              }}
                              className="px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-xl text-xs font-bold font-poppins transition-all disabled:opacity-50"
                            >
                              ✕ Cancel
                            </button>
                          )}

                          {/* Track Link */}
                          <Link
                            href={`/track?orderNumber=${orderRef}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold font-poppins transition-all inline-flex items-center gap-1"
                          >
                            <span>🔍 Track</span>
                          </Link>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-2">📦</span>
            <h3 className="text-lg font-bold text-gray-800 font-poppins mb-1">No Orders Found</h3>
            <p className="text-xs text-gray-500">
              {search ? 'No orders match your search criteria.' : 'No orders in this status category.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
