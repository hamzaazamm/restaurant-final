'use client';

import DealsBanner from '@/components/home/DealsBanner';
import { PRODUCTS } from '@/lib/data';
import Link from 'next/link';

export default function DealsPage() {
  const deals = PRODUCTS.filter((p) => p.category?.slug === 'deals' || p.tags?.includes('family-deal') || p.tags?.includes('solo-deal'));

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-[#0032A5] text-white py-12 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#F8D302] uppercase tracking-widest block mb-2">
          Lahore Specials
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-poppins">
          Exclusive Value Deals
        </h1>
        <p className="text-blue-100 max-w-xl mx-auto mt-2 text-sm sm:text-base">
          Get maximum food for less with our curated combos, student packs, and family platters.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <DealsBanner deals={deals} />

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 bg-[#0032A5] text-white font-bold font-poppins rounded-xl shadow-md hover:bg-[#002275] transition-all"
          >
            Explore Individual Items
          </Link>
        </div>
      </div>
    </div>
  );
}
