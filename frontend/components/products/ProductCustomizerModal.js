'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';

export default function ProductCustomizerModal({ product, isOpen, onClose }) {
  const { addItem } = useCart();

  const defaultVariant = product?.variants?.find((v) => v.isDefault && v.isAvailable) || product?.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant || null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!isOpen || !product) return null;

  const currentPrice = (selectedVariant ? selectedVariant.pricePKR : product.basePricePKR) +
    selectedExtras.reduce((sum, extra) => sum + (extra.pricePKR || 0), 0);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e._id === extra._id);
      if (exists) {
        return prev.filter((e) => e._id !== extra._id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleAddToCart = () => {
    addItem(
      product,
      selectedVariant?._id || null,
      selectedVariant?.name || null,
      selectedExtras,
      quantity,
      currentPrice
    );
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 500px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍔</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            ✕
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F8D302] text-[#0032A5] inline-block mb-1">
              {product.category?.name || 'Lahore Special'}
            </span>
            <h2 className="text-xl font-bold font-poppins drop-shadow-sm leading-tight">{product.name}</h2>
          </div>
        </div>

        {/* Scrollable details & customizations */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants selection */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 font-poppins flex items-center gap-1.5">
                <span>Select Size / Option:</span>
                <span className="text-xs text-red-500 font-normal">*Required</span>
              </h3>
              <div className="space-y-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?._id === v._id;
                  return (
                    <label
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0032A5] bg-blue-50/70 text-[#0032A5] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="productVariant"
                          checked={isSelected}
                          onChange={() => setSelectedVariant(v)}
                          className="accent-[#0032A5] w-4 h-4"
                        />
                        <span>{v.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">PKR {v.pricePKR}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras selection */}
          {product.extras && product.extras.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 font-poppins flex items-center justify-between">
                <span>Add Extra Toppings:</span>
                <span className="text-xs text-gray-400 font-normal">Optional</span>
              </h3>
              <div className="space-y-2">
                {product.extras.map((extra) => {
                  const isChecked = selectedExtras.some((e) => e._id === extra._id);
                  return (
                    <label
                      key={extra._id}
                      onClick={() => toggleExtra(extra)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#F8D302] bg-yellow-50 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleExtra(extra)}
                          className="accent-[#0032A5] w-4 h-4 rounded"
                        />
                        <span>{extra.name}</span>
                      </div>
                      <span className="font-bold text-[#0032A5]">+ PKR {extra.pricePKR}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Quantity</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-700 font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-gray-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-700 font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Total Price:</span>
            <span className="text-xl font-extrabold text-[#0032A5] font-poppins">
              PKR {(currentPrice * quantity).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-5 rounded-xl font-bold font-poppins text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              addedAnimation
                ? 'bg-green-600 text-white'
                : 'bg-[#F8D302] hover:bg-[#e6c200] text-[#0032A5] active:scale-95'
            }`}
          >
            {addedAnimation ? (
              <>✓ Added to Cart</>
            ) : (
              <>🛒 Add PKR {(currentPrice * quantity).toLocaleString()} to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
