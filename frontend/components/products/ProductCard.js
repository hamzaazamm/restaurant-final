'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import ProductCustomizerModal from './ProductCustomizerModal';

const CATEGORY_FALLBACKS = {
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  pizzas: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'fried-chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
  deals: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  sides: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80',
  drinks: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
};

const getDefaultImage = (product) => {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  const slug = product.category?.slug || (typeof product.category === 'string' ? product.category : '');
  return CATEGORY_FALLBACKS[slug] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80';
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(getDefaultImage(product));

  // Default variant or base price
  const defaultVariant = product.variants?.find((v) => v.isDefault && v.isAvailable) || product.variants?.[0];
  const displayPrice = defaultVariant ? defaultVariant.pricePKR : product.basePricePKR;
  const hasCustomizations = (product.variants && product.variants.length > 1) || (product.extras && product.extras.length > 0);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (hasCustomizations) {
      setIsModalOpen(true);
      return;
    }

    addItem(
      product,
      defaultVariant?._id || null,
      defaultVariant?.name || null,
      [],
      1,
      displayPrice
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white rounded-2xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,50,165,0.12)] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
        aria-label={product.name}
      >
        {/* Product Image Container */}
        <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              setImgSrc('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80');
            }}
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.isBestSeller && (
              <span className="bg-[#E3A000] text-slate-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 font-poppins">
                🔥 Bestseller
              </span>
            )}
            {product.isFeatured && !product.isBestSeller && (
              <span className="bg-[#0032A5] text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 font-poppins">
                ⭐ Special
              </span>
            )}
          </div>

          {/* Customization available tag */}
          {hasCustomizations && (
            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Options Available
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#0032A5] uppercase tracking-wider">
              {product.category?.name || 'Lahore Bites'}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Fresh
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-poppins font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-[#0032A5] transition-colors mb-1.5">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          {/* Price & Action Row */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-gray-400 block font-medium">Starting from</span>
              <span className="text-lg font-extrabold text-[#0032A5] font-poppins tracking-tight">
                PKR {displayPrice?.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to cart`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-poppins transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F8D302] hover:bg-[#ebd002] text-[#0032A5] hover:shadow-md'
              }`}
            >
              {added ? (
                <>✓ Added</>
              ) : hasCustomizations ? (
                <>⚙ Options</>
              ) : (
                <>+ Add</>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Customizer modal */}
      <ProductCustomizerModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
