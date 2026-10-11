import Link from 'next/link';

export default function DeliveryPolicyPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-6">
          <Link href="/" className="text-xs font-semibold text-[#0032A5] hover:underline">
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-extrabold font-poppins text-gray-900">
            Delivery Policy
          </h1>
          <p className="text-xs text-gray-400">Lahore Express Delivery Coverage</p>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">1. Delivery Timeframes</h2>
            <p>
              Our average kitchen prep and delivery time is between <strong>35 to 45 minutes</strong> under typical traffic conditions in Lahore. During intense rain, severe weather, or major Lahore rush hours, slight delays may occur.
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">2. Delivery Charges</h2>
            <p>
              Standard delivery fee across our delivery zones is <strong>PKR 150</strong>. Orders totaling <strong>PKR 1,500 or more</strong> qualify for <strong>Free Delivery</strong>.
            </p>

            <h2 className="text-lg font-bold text-gray-900 font-poppins">3. Verification &amp; Handover</h2>
            <p>
              Our rider will contact your provided mobile number upon reaching your destination. Please ensure your phone is reachable to prevent delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
