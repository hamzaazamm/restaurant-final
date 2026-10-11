'use client';

export default function PopularCategories({ categories = [], onSelectCategory }) {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider">Quick Browse</span>
            <h2 className="text-2xl font-extrabold text-gray-900 font-poppins">Popular Categories</h2>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">Tap to explore items</span>
        </div>

        {/* Categories Horizontal Scroll / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.filter(c => c.id !== 'all').map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.slug || cat.id);
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group p-4 rounded-2xl bg-gray-50/80 hover:bg-blue-50/70 border border-gray-200/60 hover:border-[#0032A5]/30 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </div>
              <span className="font-poppins font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#0032A5] transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
