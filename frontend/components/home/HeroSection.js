'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RESTAURANT_INFO } from '@/lib/data';

export default function HeroSection({ onExploreMenuClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#002275] via-[#0032A5] to-[#001850] text-white pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F8D302]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Call To Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-yellow-300">
              <span className="flex h-2 w-2 rounded-full bg-[#F8D302] animate-ping" />
              <span>Samanabad & Model Town, Lahore • Open till 2:00 AM</span>
            </div>

            {/* Bold Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-poppins leading-[1.15] tracking-tight">
              Lahore’s Craziest <br />
              <span className="text-[#F8D302] drop-shadow-sm">Molten Burgers</span> &amp; <br />
              Crown Crust Pizzas!
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-blue-100/90 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Flame-grilled gourmet patties, explosive cheese burst pizzas, and Lahore-style crispy crunch broast. Prepared fresh and delivered blazing hot to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreMenuClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F8D302] text-[#0032A5] font-bold font-poppins text-base hover:bg-[#ebd002] transition-all transform hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(248,211,2,0.35)] flex items-center justify-center gap-2"
              >
                <span>🍕 Order Online Now</span>
              </button>

              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold font-poppins text-base backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>📞 Call {RESTAURANT_INFO.phoneDisplay}</span>
              </a>
            </div>

            {/* Trust & Delivery highlights */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/15 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">⚡</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">35-45 Mins</h4>
                  <p className="text-[10px] sm:text-xs text-blue-200">Express Delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">💵</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Cash on Delivery</h4>
                  <p className="text-[10px] sm:text-xs text-blue-200">Pay at Doorstep</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">⭐</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">4.8 / 5 Rating</h4>
                  <p className="text-[10px] sm:text-xs text-blue-200">10k+ Lahoris</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Food Visual & Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Glowing disc background */}
            <div className="absolute inset-0 max-w-[420px] max-h-[420px] mx-auto my-auto rounded-full bg-gradient-to-tr from-[#F8D302]/30 to-blue-400/20 blur-2xl -z-1" />

            <div className="relative w-full max-w-[440px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
              <Image
                src="/images/hero_burger.jpg"
                alt="Eats N Bites Gourmet Molten Lava Burger"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 90vw, 450px"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badge 1 - Price Callout */}
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-400/40 text-yellow-300 text-xs font-bold font-poppins shadow-lg">
                🔥 Molten Lava Double • PKR 650
              </div>

              {/* Floating Badge 2 - Free delivery perk */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center justify-between text-gray-900 border border-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0032A5] text-[#F8D302] flex items-center justify-center font-bold text-lg">
                    🛵
                  </div>
                  <div>
                    <h5 className="font-poppins font-bold text-xs text-gray-900">Free Delivery Lahore</h5>
                    <p className="text-[11px] text-gray-500">On all orders above PKR 1,500</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0032A5] px-2.5 py-1 bg-blue-50 rounded-lg">
                  HOT DEAL
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
