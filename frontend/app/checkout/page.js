'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder } from '@/lib/api';
import { RESTAURANT_INFO } from '@/lib/data';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryCharge, total, updateQuantity, removeItem, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    area: 'Samanabad',
    streetAddress: '',
    landmark: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';

    // Pakistani phone number validation (e.g. 03001234567 or 0300-1234567)
    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    if (!phoneClean) {
      errs.phone = 'Phone number is required for order delivery';
    } else if (!/^(\+92|0)?3[0-9]{9}$/.test(phoneClean)) {
      errs.phone = 'Enter a valid Pakistani mobile number (e.g. 0300-1234567)';
    }

    if (!formData.streetAddress.trim()) {
      errs.streetAddress = 'Complete street and house address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
        },
        deliveryAddress: {
          street: formData.streetAddress.trim(),
          area: formData.area,
          city: 'Lahore',
          landmark: formData.landmark.trim() || undefined,
        },
        items: items.map((item) => ({
          product: item.product._id || item.product.slug,
          productName: item.product.name,
          variantName: item.variantName || null,
          extras: item.extras || [],
          quantity: item.quantity,
          unitPricePKR: item.unitPricePKR,
        })),
        specialInstructions: formData.specialInstructions.trim() || undefined,
        paymentMethod: 'cash_on_delivery',
      };

      const placedOrder = await createOrder(orderPayload);
      clearCart();
      router.push(`/track?orderNumber=${placedOrder.orderNumber}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again or call our branch.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">
            Looks like you haven&apos;t added any delicious food yet. Check out our burgers and pizzas!
          </p>
          <Link
            href="/menu"
            className="inline-block px-6 py-3 bg-[#0032A5] text-white font-bold font-poppins rounded-xl shadow-md hover:bg-[#002275] transition-all text-sm"
          >
            Browse Menu &amp; Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <Link href="/menu" className="text-xs font-semibold text-[#0032A5] hover:underline mb-2 inline-block">
            ← Continue Ordering
          </Link>
          <h1 className="text-3xl font-extrabold font-poppins text-gray-900">
            Checkout &amp; Delivery
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Deliver to your doorstep in Lahore • Cash on Delivery
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠️ {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-[#0032A5] text-xs font-black flex items-center justify-center">1</span>
                  <span>Contact Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5] ${
                        errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5] ${
                        errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="ali@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-[#0032A5] text-xs font-black flex items-center justify-center">2</span>
                  <span>Delivery Address (Lahore)</span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Lahore, Pakistan"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Area / Locality *
                      </label>
                      <select
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                      >
                        <option value="Samanabad">Samanabad</option>
                        <option value="Poonch Road">Poonch Road</option>
                        <option value="Gulshan-e-Ravi">Gulshan-e-Ravi</option>
                        <option value="Ichhra">Ichhra</option>
                        <option value="Chauburji">Chauburji</option>
                        <option value="Mozang">Mozang</option>
                        <option value="Model Town">Model Town</option>
                        <option value="Faisal Town">Faisal Town</option>
                        <option value="Johar Town">Johar Town</option>
                        <option value="Garden Town">Garden Town</option>
                        <option value="Other Lahore Area">Other Lahore Area</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Street &amp; House Address *
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. House # 14, Street 3, Block C, near Poonch Road"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5] ${
                        errors.streetAddress ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shell Petrol Pump or Jamia Masjid"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Special Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring the bell twice, don't call after 11 PM"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-lg font-bold font-poppins text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-[#0032A5] text-xs font-black flex items-center justify-center">3</span>
                  <span>Payment Method</span>
                </h2>

                <div className="p-4 rounded-2xl border-2 border-[#0032A5] bg-blue-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-gray-900">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Pay cash directly to our rider upon receiving your hot meal.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0032A5] bg-white px-3 py-1 rounded-full border border-blue-200">
                    Active
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#F8D302] hover:bg-[#ebd002] text-[#0032A5] font-extrabold font-poppins text-base shadow-lg transition-all hover:shadow-xl active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>⏳ Processing your order...</span>
                ) : (
                  <span>🚀 Place Order • PKR {total.toLocaleString()} (COD)</span>
                )}
              </button>

            </form>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-poppins font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-gray-500">{items.length} items</span>
              </h3>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.key} className="py-3 flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xl">🍔</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-[11px] text-gray-500">{item.variantName}</p>
                      )}
                      {item.extras?.length > 0 && (
                        <p className="text-[10px] text-gray-400">
                          +{item.extras.map((e) => e.name).join(', ')}
                        </p>
                      )}
                      <p className="text-xs font-bold text-[#0032A5] mt-0.5">
                        PKR {(item.unitPricePKR * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-4 mt-2 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-600 font-bold' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `PKR ${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[11px] text-amber-600">
                    💡 Add PKR {(RESTAURANT_INFO.freeDeliveryThresholdPKR - subtotal).toLocaleString()} more for FREE Delivery!
                  </p>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total (PKR)</span>
                  <span className="text-[#0032A5]">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 space-y-1">
                <p>📍 Dispatch from: <strong>{RESTAURANT_INFO.branch1.name}</strong></p>
                <p>⏱️ Estimated arrival: <strong>{RESTAURANT_INFO.avgDeliveryMinutes}</strong></p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
