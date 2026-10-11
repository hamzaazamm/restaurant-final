'use client';

import { useState } from 'react';
import { RESTAURANT_INFO } from '@/lib/data';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-[#0032A5] text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#F8D302] uppercase tracking-widest block mb-2">
          We&apos;re Always Here
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-poppins">
          Contact &amp; Locations
        </h1>
        <p className="text-blue-100 max-w-xl mx-auto mt-3 text-sm sm:text-base">
          Got feedback, catering inquiry, or need to place a custom party order? Reach out anytime!
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider block mb-1">
                  Main Location
                </span>
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">
                  {RESTAURANT_INFO.branch1.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {RESTAURANT_INFO.branch1.address}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  🕒 {RESTAURANT_INFO.branch1.timing}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-[#0032A5] uppercase tracking-wider block mb-1">
                  Second Location
                </span>
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">
                  {RESTAURANT_INFO.branch2.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {RESTAURANT_INFO.branch2.address}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  🕒 {RESTAURANT_INFO.branch2.timing}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#0032A5] text-white font-bold font-poppins text-xs flex items-center justify-center gap-2 hover:bg-[#00257a] transition-all"
                >
                  <span>📞 Call: {RESTAURANT_INFO.phoneDisplay}</span>
                </a>

                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=Hi%20Eats%20N%20Bites`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold font-poppins text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                >
                  <span>💬 WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">
                Have an inquiry about large family deals, birthday events, or suggestions? Leave a note below.
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                  <span className="text-4xl block">🎉</span>
                  <h3 className="font-bold font-poppins">Message Received!</h3>
                  <p className="text-xs">Thank you for getting in touch. Our manager will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Usman Malik"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0300-XXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Message / Feedback
                    </label>
                    <textarea
                      rows="4"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you'd like to share or ask..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0032A5]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0032A5] hover:bg-[#002275] text-white font-bold font-poppins rounded-xl text-sm transition-all shadow-md"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
