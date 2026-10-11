'use client';

import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { useState } from 'react';

export default function DealsBanner({ deals = [] }) {
  const { addItem } = useCart();
  const [addedDealId, setAddedDealId] = useState(null);

  const handleAddDeal = (deal) => {
    addItem(
      deal,
      deal.variants?.[0]?._id || null,
      deal.variants?.[0]?.name || null,
      [],
      1,
      deal.basePricePKR
    );
    setAddedDealId(deal._id);
    setTimeout(() => setAddedDealId(null), 1500);
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Container */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#002070] via-[#0032A5] to-[#001855] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-blue-400/20">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F8D302]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#F8D302] text-[#0032A5] font-extrabold text-xs tracking-wider uppercase mb-2">
                ⚡ Limited Time Offers
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-poppins">
                Hot Mega Saver <span className="text-[#F8D302]">Deals</span>
              </h2>
            </div>
            <p className="text-blue-100/90 text-sm max-w-sm">
              Maximum taste at unbeatable value. Perfect for Lahore family get-togethers and midnight cravings!
            </p>
          </div>

          {/* Deals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {deals.slice(0, 2).map((deal, idx) => {
              const isAdded = addedDealId === deal._id;
              return (
                <div
                  key={deal._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-yellow-400/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {/* Deal thumbnail */}
                    <div className="relative w-full sm:w-32 h-28 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                      {deal.images?.[0] ? (
                        <Image
                          src={deal.images[0]}
                          alt={deal.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                      )}
                      <span className="absolute top-1 left-1 bg-[#F8D302] text-[#0032A5] font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                        SAVE BIG
                      </span>
                    </div>

                    {/* Deal info */}
                    <div className="flex-1">
                      <h3 className="font-poppins font-bold text-lg text-white group-hover:text-yellow-300 transition-colors">
                        {deal.name}
                      </h3>
                      <p className="text-xs text-blue-100/80 mt-1 line-clamp-2 leading-relaxed">
                        {deal.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/15">
                    <div>
                      <span className="text-[10px] text-blue-200 block">Deal Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#F8D302] font-poppins">
                          PKR {deal.basePricePKR?.toLocaleString()}
                        </span>
                        <span className="text-xs text-blue-300 line-through">
                          PKR {(deal.basePricePKR + 400)?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddDeal(deal)}
                      className={`px-5 py-2.5 rounded-xl font-bold font-poppins text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#F8D302] hover:bg-[#ebd002] text-[#0032A5]'
                      }`}
                    >
                      {isAdded ? (
                        <>✓ Deal Added</>
                      ) : (
                        <>🛒 Add Deal to Cart</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
