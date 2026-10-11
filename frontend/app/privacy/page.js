import Link from 'next/link';

export default function PolicyPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-6">
          <Link href="/" className="text-xs font-semibold text-[#0032A5] hover:underline">
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-extrabold font-poppins text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400">Last updated: October 2026</p>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">1. Information We Collect</h2>
            <p>
              When you place an order with Eats N Bites (Samanabad & Model Town, Lahore), we collect necessary delivery details including your full name, phone number, and street delivery address in Lahore to ensure accurate order delivery.
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">2. How We Use Your Data</h2>
            <p>
              Your contact details are used exclusively for kitchen preparation, rider dispatch, and phone confirmation of your order. We do not sell or lease your personal information to third parties.
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">3. Data Security &amp; Contact</h2>
            <p>
              We maintain strict organizational and technical measures to protect customer privacy. If you have questions regarding your data, contact our Samanabad helpline at 0300-0820363.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
