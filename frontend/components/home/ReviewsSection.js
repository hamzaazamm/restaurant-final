export default function ReviewsSection() {
  const reviews = [
    {
      name: 'Hamza Farooq',
      area: 'Samanabad, Lahore',
      rating: 5,
      comment: 'The Molten Lava Pro burger is insanely good! The cheese burst is real and the patty is juicy. Arrived piping hot in 30 minutes to Poonch Road.',
      order: 'Molten Lava Pro Burger + Loaded Fries',
    },
    {
      name: 'Ayesha Siddiqui',
      area: 'Model Town, Lahore',
      rating: 5,
      comment: 'Crown Crust Kabab Pizza is unbeatable. The crust itself is a full meal! Our entire family loved it during our weekend get-together.',
      order: 'Crown Crust Pizza (Large)',
    },
    {
      name: 'Bilal Tariq',
      area: 'Gulshan-e-Ravi, Lahore',
      rating: 5,
      comment: 'Best value for money deals in town. Fast delivery, generous portions, and the crunchy chicken broast was crispy till the last bite!',
      order: 'Family Feast Combo (Deal 1)',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider">Customer Love</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-poppins mt-1">
            What Lahore Says About Us
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Over 10,000+ happy meals delivered with an average rating of 4.8 / 5.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-yellow-400 mb-3 text-sm">
                  {[...Array(rev.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <span className="text-xs text-gray-400 ml-1 font-semibold">5.0</span>
                </div>

                <p className="text-gray-700 text-sm italic leading-relaxed mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-poppins font-bold text-gray-900 text-xs sm:text-sm">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-gray-400">{rev.area}</p>
                </div>
                <span className="text-[10px] font-semibold text-[#0032A5] bg-blue-50 px-2 py-1 rounded-md">
                  Verified Order
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
