import './globals.css';
import { Poppins, Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartProvider from '@/components/cart/CartProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Eats N Bites | Lahore\'s Favourite Fast Food',
    template: '%s | Eats N Bites',
  },
  description: 'Order delicious burgers, pizzas, fried chicken & more from Eats N Bites, Lahore. Fast delivery across the city. Cash on Delivery available.',
  keywords: ['Eats N Bites', 'ENB', 'restaurant Lahore', 'burger Lahore', 'pizza Lahore', 'fast food Lahore', 'order food online Lahore', 'cash on delivery'],
  authors: [{ name: 'Eats N Bites' }],
  creator: 'Eats N Bites',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'Eats N Bites',
    title: 'Eats N Bites | Lahore\'s Favourite Fast Food',
    description: 'Fresh, bold, delicious — fast food the Lahore way. Order online & enjoy cash on delivery.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Eats N Bites' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eats N Bites | Lahore\'s Favourite Fast Food',
    description: 'Order burgers, pizzas & more from Eats N Bites, Lahore.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport = {
  themeColor: '#0032A5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-inter antialiased bg-[#FDFDFD]">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
