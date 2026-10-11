import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-6">
          <Link href="/" className="text-xs font-semibold text-[#0032A5] hover:underline">
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-extrabold font-poppins text-gray-900">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs text-gray-400">Last updated: October 2026</p>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">1. Order Placement &amp; Acceptance</h2>
            <p>
              All orders placed through our website are subject to kitchen operational availability and branch delivery radius (primarily Samanabad, Model Town, Gulshan-e-Ravi, and surrounding Lahore neighborhoods).
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">2. Pricing &amp; Payment</h2>
            <p>
              All listed prices are in Pakistani Rupees (PKR). Payment is made via Cash on Delivery (COD) to the rider upon receipt.
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">3. Cancellations</h2>
            <p>
              Because our food is freshly cooked to order, cancellations must be made within 5 minutes of placing your order by calling our branch at 0300-0820363.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
