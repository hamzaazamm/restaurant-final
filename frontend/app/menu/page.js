'use client';

import { useState } from 'react';
import MenuSection from '@/components/home/MenuSection';
import { CATEGORIES, PRODUCTS } from '@/lib/data';

export default function MenuPage() {
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
      <MenuSection products={PRODUCTS} categories={CATEGORIES} />
    </div>
  );
}
