import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/store/cart-store';
import { WishlistProvider } from '@/lib/store/wishlist-store';
import { AuthProvider } from '@/lib/store/auth-context';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';
import LiveChatWidget from '@/components/LiveChatWidget';
import CookieConsent from '@/components/CookieConsent';
import NavigationLoader from '@/components/NavigationLoader';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#cf8644',
};

export const metadata: Metadata = {
  title: 'Otantikos Concept | Eminönü Tahtakale Hediyelik Eşya, Çelik Takı & Trend Oyuncaklar',
  description: 'İstanbul Eminönü Tahtakale merkezli 316L kararmaz çelik takılar, el yapımı mozaik lambalar, trend mekanik oyuncaklar ve özel hediyelik koleksiyonlar. Doğrudan net ve şeffaf fiyatlar.',
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
  keywords: [
    'Otantikos Concept',
    'Eminönü Hediyelik',
    'Tahtakale Takı',
    '316L Çelik Kolye',
    'Kararmaz Çelik Bileklik',
    'Mozaik Masa Lambası',
    'Trend Uçan Küre',
    'Ahşap Mekanik Maket',
    'Tahtakale Toptan'
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="flex flex-col min-h-screen font-sans bg-stone-50 text-stone-900 overflow-x-hidden w-full max-w-full antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
              <Footer />
              <Suspense fallback={null}>
                <MobileBottomNav />
              </Suspense>
              <Suspense fallback={null}>
                <CartDrawer />
              </Suspense>
              <Suspense fallback={null}>
                <LiveChatWidget />
              </Suspense>
              <CookieConsent />
              <Suspense fallback={null}>
                <NavigationLoader />
              </Suspense>
              <Toaster position="top-right" richColors closeButton />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
