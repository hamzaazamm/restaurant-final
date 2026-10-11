'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';

export default function CartDrawer({ open, onClose }) {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  const deliveryCharge = subtotal >= 500 ? 0 : 100;
  const total = subtotal + deliveryCharge;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 flex flex-col slide-up"
        style={{ background: '#FDFDFD', boxShadow: '-4px 0 24px rgba(0,50,165,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: '#0032A5' }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#F8D302]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="font-poppins font-bold text-white text-lg">
              Your Cart {itemCount > 0 && <span className="text-[#F8D302]">({itemCount})</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* COD Notice */}
        <div className="px-6 py-2.5 text-xs font-semibold text-center" style={{ background: '#F8D302', color: '#001a5e' }}>
          💵 Cash on Delivery Only — Pay when we arrive!
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
                🛒
              </div>
              <div>
                <p className="font-poppins font-semibold text-gray-700 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add some delicious items from our menu!</p>
              </div>
              <Link href="/menu" onClick={onClose} className="btn-blue text-sm px-6 py-2.5">
                Browse Menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
                    )}
                    {item.extras?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {item.extras.map(e => e.name).join(', ')}
                      </p>
                    )}
                    <p className="text-[#0032A5] font-bold text-sm mt-1">
                      PKR {(item.unitPricePKR * item.quantity).toLocaleString()}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0032A5] hover:text-[#0032A5] transition-colors font-bold text-base leading-none"
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        −
                      </button>
                      <span className="font-semibold text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0032A5] hover:text-[#0032A5] transition-colors font-bold text-base leading-none"
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors p-1"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `PKR ${deliveryCharge}`}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-gray-400">
                  Add PKR {(500 - subtotal).toLocaleString()} more for free delivery
                </p>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-[#0032A5]">PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full justify-center text-base py-3.5"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
