export default function WhyChooseUs() {
  const features = [
    {
      icon: '🔥',
      title: 'Flame-Grilled & Fresh',
      desc: '100% pure beef & fresh poultry, never frozen patties, seasoned with our proprietary secret spices.',
    },
    {
      icon: '🍕',
      title: 'Hand-Tossed Crown Crust',
      desc: 'Artisanal dough kneaded fresh every single morning, stone-baked with stuffed spiced kabab crusts.',
    },
    {
      icon: '⚡',
      title: 'Express Lahore Delivery',
      desc: 'Hot and crispy delivery within 35 to 45 minutes across Samanabad, Model Town and surrounding Lahore.',
    },
    {
      icon: '💵',
      title: 'Cash on Delivery',
      desc: 'No advance payment hassle. Inspect your hot meal at your doorstep and pay with simple cash.',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider">The Eats N Bites Difference</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-poppins mt-1">
            Why Lahoris Love <span className="text-[#0032A5]">Eats N Bites</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            We don’t cut corners. From our kitchen to your dining table, taste the difference in every single bite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0032A5] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-[#0032A5] group-hover:text-[#F8D302] transition-all">
                {feat.icon}
              </div>
              <h3 className="font-poppins font-bold text-gray-900 text-base mb-2 group-hover:text-[#0032A5] transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
