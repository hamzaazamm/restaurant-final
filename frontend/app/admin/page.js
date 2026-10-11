'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('enb_orders') || '[]');
        if (stored.length === 0) {
          const sampleOrders = [
            {
              _id: 'sample-1',
              orderNumber: 'ENB-20261010-9182',
              status: 'preparing',
              customer: { name: 'Zainab Bibi', phone: '0321-4829104' },
              deliveryAddress: { street: 'Street 4, Poonch Road', area: 'Samanabad', city: 'Lahore' },
              items: [
                { productName: 'Molten Lava Pro Burger', variantName: 'Double Patty', quantity: 2, unitPricePKR: 650 },
                { productName: 'Loaded Cheesy Dynamite Fries', quantity: 1, unitPricePKR: 480 },
              ],
              pricing: { subtotalPKR: 1780, deliveryFeePKR: 0, totalPKR: 1780 },
              payment: { method: 'cash_on_delivery', status: 'pending' },
              createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            },
            {
              _id: 'sample-2',
              orderNumber: 'ENB-20261010-7213',
              status: 'out_for_delivery',
              customer: { name: 'Usman Ghani', phone: '0300-8842193' },
              deliveryAddress: { street: 'House 22, Block A', area: 'Gulshan-e-Ravi', city: 'Lahore' },
              items: [
                { productName: 'Crown Crust Kabab Pizza', variantName: 'Large 12"', quantity: 1, unitPricePKR: 1150 },
              ],
              pricing: { subtotalPKR: 1150, deliveryFeePKR: 150, totalPKR: 1300 },
              payment: { method: 'cash_on_delivery', status: 'pending' },
              createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            },
          ];
          localStorage.setItem('enb_orders', JSON.stringify(sampleOrders));
          setOrders(sampleOrders);
        } else {
          setOrders(stored);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateOrderStatus = (orderNumber, newStatus) => {
    const updated = orders.map((o) =>
      o.orderNumber === orderNumber ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('enb_orders', JSON.stringify(updated));
    }
  };

  const filteredOrders = orders.filter((o) => filter === 'all' || o.status === filter);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.totalPKR || 0), 0);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider block mb-1">
              Internal Kitchen Console
            </span>
            <h1 className="text-3xl font-extrabold font-poppins text-gray-900">
              Kitchen &amp; Dispatch Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Live orders from Samanabad &amp; Model Town branches
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl border border-gray-200 text-right">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Today&apos;s Revenue</span>
              <span className="font-extrabold text-[#0032A5] font-poppins text-lg">
                PKR {totalRevenue.toLocaleString()}
              </span>
            </div>
            <Link
              href="/"
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-bold font-poppins text-gray-700 transition-colors"
            >
              View Website
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'preparing', label: 'In Kitchen' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-poppins whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-[#0032A5] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label} ({orders.filter(o => tab.id === 'all' || o.status === tab.id).length})
            </button>
          ))}
        </div>

        {/* Orders Table / Cards */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderNumber}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Order Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-poppins font-black text-sm text-gray-900 bg-blue-50 text-[#0032A5] px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-[#0032A5]'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-800">
                      {order.customer?.name} • <span className="font-normal text-gray-600">{order.customer?.phone}</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.area}, Lahore
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-600">
                    {order.items?.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded">
                        {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount and Status Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-gray-400 block">Total (COD)</span>
                    <span className="font-poppins font-extrabold text-base text-[#0032A5]">
                      PKR {order.pricing?.totalPKR?.toLocaleString()}
                    </span>
                  </div>

                  {/* Quick Status Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'preparing')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        order.status === 'preparing'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🍳 Kitchen
                    </button>

                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'out_for_delivery')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        order.status === 'out_for_delivery'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🛵 Rider
                    </button>

                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'delivered')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        order.status === 'delivered'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ✓ Delivered
                    </button>

                    <Link
                      href={`/track?orderNumber=${order.orderNumber}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-[#0032A5] hover:bg-blue-100 transition-colors"
                    >
                      🔍 Track
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
            No orders found matching filter.
          </div>
        )}

      </div>
    </div>
  );
}
