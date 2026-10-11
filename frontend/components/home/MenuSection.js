'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';

export default function MenuSection({ products = [], categories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category check
      const catMatch =
        selectedCategory === 'all' ||
        product.category?.slug === selectedCategory ||
        product.category?._id === selectedCategory;

      // Search check
      const queryMatch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter tag check
      let tagMatch = true;
      if (filterTag === 'bestseller') tagMatch = product.isBestSeller;
      if (filterTag === 'featured') tagMatch = product.isFeatured;
      if (filterTag === 'spicy') tagMatch = product.tags?.includes('spicy');

      return catMatch && queryMatch && tagMatch;
    });
  }, [products, selectedCategory, searchQuery, filterTag]);

  return (
    <section id="menu-section" className="py-16 md:py-24 bg-[#FAFAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Design 3 upscale styling */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-[#0032A5] uppercase tracking-wider mb-3">
            <span>✨ Freshly Prepared Daily</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-poppins tracking-tight">
            OUR <span className="text-[#0032A5]">MENU</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
            Explore Lahore’s most loved burgers, stone-baked crown crust pizzas, and crunchy broast. Made with premium halal ingredients.
          </p>
        </div>

        {/* Search Bar & Tag Filters Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search dishes (e.g. Lava Burger, Pizza)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0032A5] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
            />
            <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tags (Bestsellers, Spicy, etc.) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap hidden sm:inline">Filter:</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'bestseller', label: '🔥 Bestsellers' },
              { id: 'featured', label: '⭐ Special' },
              { id: 'spicy', label: '🌶️ Spicy' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(tag.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  filterTag === tag.id
                    ? 'bg-[#0032A5] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Navigation Tabs (Design 3 Style Horizontal Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-gray-200/80">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug || (cat.id === 'all' && selectedCategory === 'all');
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold font-poppins whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0032A5] text-white shadow-[0_4px_16px_rgba(0,50,165,0.25)] scale-102'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 border border-gray-100'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F8D302]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-500 font-medium">
          <span>
            Showing <strong className="text-gray-800">{filteredProducts.length}</strong> items in{' '}
            <strong className="text-[#0032A5]">
              {categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || 'Menu'}
            </strong>
          </span>
          {searchQuery && (
            <span>Filtering by query: &ldquo;{searchQuery}&rdquo;</span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-md mx-auto my-8 shadow-sm">
            <span className="text-5xl block mb-3">🔍</span>
            <h3 className="font-poppins font-bold text-gray-800 text-lg mb-1">No items found</h3>
            <p className="text-sm text-gray-500 mb-4">
              We couldn’t find any matches for &ldquo;{searchQuery}&rdquo;. Try another term or clear filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterTag('all');
              }}
              className="px-4 py-2 bg-[#0032A5] text-white rounded-lg text-xs font-bold font-poppins"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Full Menu CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-gray-50 border-2 border-[#0032A5] text-[#0032A5] font-bold font-poppins text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <span>📜 View Complete Detailed Menu</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
