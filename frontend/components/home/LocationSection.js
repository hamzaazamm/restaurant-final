import { RESTAURANT_INFO } from '@/lib/data';

export default function LocationSection() {
  return (
    <section className="py-16 bg-[#0032A5] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branch Info */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#F8D302] text-xs font-bold uppercase tracking-wider">
              Visit Us or Order Delivery
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-poppins">
              Serving Samanabad &amp; Across Lahore
            </h2>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              Dine-in, takeaway, or fast home delivery. We are operational 7 days a week, keeping Lahore fed with piping hot food till the early morning hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Branch 1 */}
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📍</span>
                  <h4 className="font-poppins font-bold text-sm text-yellow-300">
                    {RESTAURANT_INFO.branch1.name}
                  </h4>
                </div>
                <p className="text-xs text-blue-100 mb-2 leading-relaxed">
                  {RESTAURANT_INFO.branch1.address}
                </p>
                <div className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>{RESTAURANT_INFO.branch1.timing}</span>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📍</span>
                  <h4 className="font-poppins font-bold text-sm text-yellow-300">
                    {RESTAURANT_INFO.branch2.name}
                  </h4>
                </div>
                <p className="text-xs text-blue-100 mb-2 leading-relaxed">
                  {RESTAURANT_INFO.branch2.address}
                </p>
                <div className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>{RESTAURANT_INFO.branch2.timing}</span>
                </div>
              </div>
            </div>

            {/* Delivery Areas */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
                Prime Delivery Zones:
              </h5>
              <div className="flex flex-wrap gap-2">
                {[...RESTAURANT_INFO.branch1.deliveryAreas, ...RESTAURANT_INFO.branch2.deliveryAreas.slice(0, 3)].map((area, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white/15 px-2.5 py-1 rounded-lg text-white font-medium"
                  >
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant Call / WhatsApp Box */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl">
              <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider block mb-1">
                Order Directly by Phone
              </span>
              <h3 className="text-2xl font-extrabold font-poppins text-gray-900 mb-2">
                Need Help or Prefer to Call?
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Our Samanabad branch order desk is ready to take your phone order or answer questions about custom party deals.
              </p>

              <div className="space-y-3">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0032A5] hover:bg-[#00257a] text-white font-bold font-poppins text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span className="text-lg">📞</span>
                  <span>Call {RESTAURANT_INFO.phoneDisplay}</span>
                </a>

                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=Hi%20Eats%20N%20Bites,%20I%20want%20to%20place%20an%20order`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-poppins text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span className="text-lg">💬</span>
                  <span>Order via WhatsApp</span>
                </a>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Kitchen is Active
                </span>
                <span>Avg delivery: 35 mins</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
