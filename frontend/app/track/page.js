'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchOrderTracking } from '@/lib/api';
import { RESTAURANT_INFO } from '@/lib/data';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📝', desc: 'Received at Samanabad Branch' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Order approved by restaurant' },
  { key: 'preparing', label: 'In Kitchen', icon: '🍳', desc: 'Fresh patties & crust baking' },
  { key: 'out_for_delivery', label: 'On The Way', icon: '🛵', desc: 'Rider is on road with your meal' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your delicious feast!' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNo = searchParams.get('orderNumber') || '';

  const [searchNumber, setSearchNumber] = useState(initialOrderNo);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (numToSearch) => {
    const query = numToSearch || searchNumber;
    if (!query?.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchOrderTracking(query.trim());
      setOrder(data);
    } catch (err) {
      setError('Order not found on server. Try searching with a valid order number or check recent orders.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [searchNumber]);

  useEffect(() => {
    if (initialOrderNo) {
      const timer = setTimeout(() => {
        handleSearch(initialOrderNo);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialOrderNo, handleSearch]);

  const getStepStatus = (stepKey, currentStatus = 'pending') => {
    const keys = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = keys.indexOf(currentStatus);
    const stepIndex = keys.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider block mb-1">
            Live Delivery Radar
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-poppins text-gray-900">
            Track Your Order
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your order reference number to follow kitchen status and rider delivery.
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-2 max-w-lg mx-auto mb-10">
          <input
            type="text"
            placeholder="e.g. ENB-20261010-4821"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            className="flex-1 px-4 py-2 text-sm text-gray-900 bg-transparent focus:outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-2.5 bg-[#0032A5] hover:bg-[#00257a] text-white font-bold font-poppins text-xs rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8 animate-fade-in">
            {/* Status header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0032A5] uppercase">Order Number:</span>
                  <span className="font-poppins font-black text-base text-gray-900 bg-blue-50 px-2 py-0.5 rounded">
                    {order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500 block">Estimated Arrival</span>
                <span className="text-lg font-extrabold text-emerald-600 font-poppins">
                  {order.estimatedDeliveryTime || '35 - 45 mins'}
                </span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                Delivery Progress
              </h3>

              <div className="relative">
                {/* Horizontal progress bar for desktop */}
                <div className="hidden md:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-gray-100 -z-0" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step) => {
                    const status = getStepStatus(step.key, order.status);
                    return (
                      <div
                        key={step.key}
                        className={`flex md:flex-col items-center gap-3 md:gap-2 p-3 md:p-2 rounded-xl transition-all ${
                          status === 'current'
                            ? 'bg-blue-50/70 border border-[#0032A5]/30'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-sm ${
                            status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : status === 'current'
                              ? 'bg-[#0032A5] text-white ring-4 ring-blue-100 animate-pulse'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {status === 'completed' ? '✓' : step.icon}
                        </div>

                        <div className="text-left md:text-center">
                          <h4
                            className={`font-poppins font-bold text-xs ${
                              status === 'current'
                                ? 'text-[#0032A5]'
                                : status === 'completed'
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-gray-400">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Customer &amp; Contact</h4>
                <p className="text-gray-600">{order.customer?.name}</p>
                <p className="text-gray-600">{order.customer?.phone}</p>
                <p className="text-gray-500 mt-1">Payment: <strong>Cash on Delivery (COD)</strong></p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-1">Delivery Destination</h4>
                <p className="text-gray-600">{order.deliveryAddress?.street || 'Provided Street'}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress?.area || 'Samanabad'}, Lahore
                </p>
                {order.deliveryAddress?.landmark && (
                  <p className="text-gray-400 mt-1">Near: {order.deliveryAddress.landmark}</p>
                )}
              </div>
            </div>

            {/* Ordered items breakdown */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Ordered Items
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{item.productName || item.product?.name || 'Item'}</span>
                      {item.variantName && <span className="text-gray-500 ml-1.5">({item.variantName})</span>}
                      {item.extras?.length > 0 && (
                        <p className="text-[10px] text-gray-400">
                          +{item.extras.map((e) => e.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 mr-2">{item.quantity} × PKR {item.unitPricePKR}</span>
                      <strong className="text-[#0032A5]">PKR {(item.quantity * item.unitPricePKR).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}

                <div className="p-3 sm:p-4 bg-gray-50 flex justify-between font-bold text-sm text-gray-900">
                  <span>Grand Total (COD)</span>
                  <span className="text-[#0032A5]">PKR {order.pricing?.totalPKR?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Assistance bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Any issues with your delivery? Call Samanabad helpline:
              </span>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="px-4 py-2 rounded-xl bg-blue-50 text-[#0032A5] font-bold font-poppins text-xs hover:bg-blue-100 transition-colors"
              >
                📞 {RESTAURANT_INFO.phoneDisplay}
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-sm text-gray-400">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
