import Image from 'next/image';
import Link from 'next/link';
import { RESTAURANT_INFO } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0032A5] text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#F8D302] uppercase tracking-widest block mb-2">
          Lahori Passion &amp; Quality
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-poppins">
          About Eats N Bites
        </h1>
        <p className="text-blue-100 max-w-xl mx-auto mt-3 text-sm sm:text-base">
          Born in the vibrant heart of Lahore, crafted for true fast-food connoisseurs who value fresh ingredients and big flavors.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider">
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-poppins text-gray-900 leading-snug">
              From Samanabad to Every Foodie’s Heart in Lahore
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              At Eats N Bites, we believe great fast food should never compromise on quality. Located prominently at <strong>19-A Main, Poonch Road, Samanabad</strong> and expanded to <strong>Model Town</strong>, we set out to craft burgers that drip with genuine gourmet satisfaction and pizzas that redefine crust quality.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every burger patty is cooked to perfection, every pizza dough is hand-stretched and topped with pure mozzarella, and our famous <strong>Crown Crust Kabab Pizza</strong> has earned a dedicated following across town.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-block px-6 py-3 bg-[#F8D302] text-[#0032A5] font-extrabold font-poppins text-sm rounded-xl shadow-md hover:bg-[#ebd002] transition-all"
              >
                Explore What We Cook
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <Image
              src="/images/hero_burger.jpg"
              alt="Gourmet Burger preparation at Eats N Bites"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0032A5] flex items-center justify-center text-2xl mb-4 font-bold">
              🥩
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-lg mb-2">100% Halal &amp; Fresh</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              We never use pre-frozen mystery meats. All chicken and beef is locally sourced, fresh daily, and certified 100% Halal.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-[#E3A000] flex items-center justify-center text-2xl mb-4 font-bold">
              🍕
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-lg mb-2">Stone-Baked Perfection</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Our pizza dough is kneaded every morning with olive oil and proofed slowly for maximum crunch and airy texture.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-bold">
              ⚡
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-lg mb-2">Piping Hot Delivery</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Specially insulated delivery bags ensure your food reaches your doorstep at the exact temperature it left our kitchen.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
