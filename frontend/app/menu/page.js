'use client';

import { useState, useEffect } from 'react';
import MenuSection from '@/components/home/MenuSection';
import { CATEGORIES, PRODUCTS } from '@/lib/data';

export default function MenuPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const [catRes, prodRes] = await Promise.allSettled([
          fetch(`${apiUrl}/categories`).then((r) => r.json()),
          fetch(`${apiUrl}/products?limit=50`).then((r) => r.json()),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data?.length > 0) {
          setCategories([{ id: 'all', name: 'All Menu', icon: '🍽️', slug: 'all' }, ...catRes.value.data]);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value?.data?.products?.length > 0) {
          setProducts(prodRes.value.data.products);
        }
      } catch (err) {
        console.warn('API fetch failed in menu page, using static data', err);
      }
    };

    loadDynamicData();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-[#FAFAFC]">
      {/* Banner */}
      <div className="bg-[#0032A5] text-white py-12 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#F8D302] uppercase tracking-widest block mb-2">
          Lahore Fast Food &amp; Pizza
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-poppins">
          Our Complete Menu
        </h1>
        <p className="text-blue-100 max-w-xl mx-auto mt-2 text-sm sm:text-base">
          Every item is crafted fresh to order. Customize your patty, crust size, and favorite extra toppings.
        </p>
      </div>

      {/* Menu Section */}
      <MenuSection products={products} categories={categories} />
    </div>
  );
}
