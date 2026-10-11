'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import PopularCategories from '@/components/home/PopularCategories';
import MenuSection from '@/components/home/MenuSection';
import DealsBanner from '@/components/home/DealsBanner';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ReviewsSection from '@/components/home/ReviewsSection';
import LocationSection from '@/components/home/LocationSection';
import { CATEGORIES, PRODUCTS } from '@/lib/data';

export default function HomePage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    // Attempt dynamic fetch from backend if running, otherwise keep rich initial data
    const loadDynamicData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      } catch (e) {
        // Fallback already pre-loaded
      }
    };

    loadDynamicData();
  }, []);

  const handleExploreMenuClick = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const deals = products.filter((p) => p.category?.slug === 'deals' || p.tags?.includes('family-deal') || p.tags?.includes('solo-deal'));

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (Design 1: Bold & Royal Blue) */}
      <HeroSection onExploreMenuClick={handleExploreMenuClick} />

      {/* 2. Popular Categories Quick Navigator */}
      <PopularCategories categories={categories} />

      {/* 3. OUR MENU Section (Design 3: Clean Tabs, Live Search, Tags & Sleek Grid) */}
      <MenuSection products={products} categories={categories} />

      {/* 4. Mega Saver Deals Banner */}
      <DealsBanner deals={deals.length > 0 ? deals : products.slice(0, 2)} />

      {/* 5. Why Choose Us (Halal, Fresh, Express Lahore Delivery) */}
      <WhyChooseUs />

      {/* 6. Customer Testimonials */}
      <ReviewsSection />

      {/* 7. Locations & Samanabad Branch Call/WhatsApp Box */}
      <LocationSection />
    </div>
  );
}
