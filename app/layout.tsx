import { DataService } from '@/lib/data/store-data';
import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { CartProvider } from '@/lib/store/cart-store';
import { WishlistProvider } from '@/lib/store/wishlist-store';
import { AuthProvider } from '@/lib/store/auth-context';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { SupportedLanguage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/i18n/types';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';
import LiveChatWidget from '@/components/LiveChatWidget';
import CookieConsent from '@/components/CookieConsent';
import NavigationLoader from '@/components/NavigationLoader';
import NotificationPrompt from '@/components/NotificationPrompt';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#e60012',
};

export const metadata: Metadata = {
  title: 'Otantikos Concept | Eminönü Tahtakale Hediyelik Eşya & Trend Ürünler',
  description: 'İstanbul Eminönü Tahtakale merkezli el yapımı mozaik lambalar, trend mekanik oyuncaklar ve özel hediyelik koleksiyonlar. Doğrudan net ve şeffaf fiyatlar.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Otantikos',
  },
  icons: {
    icon: '/icons/icon-192.png',
    shortcut: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  keywords: [
    'Otantikos Concept',
    'Eminönü Hediyelik',
    'Tahtakale Hediyelik',
    'Mozaik Masa Lambası',
    'Trend Uçan Küre',
    'Ahşap Mekanik Maket',
    'Tahtakale Toptan'
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value as SupportedLanguage | undefined;
  const initialLang: SupportedLanguage = rawLocale && SUPPORTED_LANGUAGES.some((l) => l.code === rawLocale)
    ? rawLocale
    : DEFAULT_LANGUAGE;
  const isRTL = initialLang === 'ar';

  const initialCategories = await DataService.getCategories();

  return (
    <html lang={initialLang} dir={isRTL ? 'rtl' : 'ltr'} className={`scroll-smooth bg-white ${isRTL ? 'rtl' : ''}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Otantikos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#e60012" />
      </head>
      <body className="flex flex-col min-h-screen font-sans text-stone-900 w-full max-w-full antialiased relative bg-white">

        <AuthProvider>
          <LanguageProvider initialLanguage={initialLang}>
            <WishlistProvider>
              <CartProvider>
                <Suspense fallback={null}>
                  <Navbar initialCategories={initialCategories} />
                </Suspense>
                <main className="flex-1 pb-16 lg:pb-0 transform-gpu bg-white">{children}</main>
                <Footer initialCategories={initialCategories} />
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
                  <NotificationPrompt />
                </Suspense>
                <Suspense fallback={null}>
                  <PwaInstallPrompt />
                </Suspense>
                <Suspense fallback={null}>
                  <NavigationLoader />
                </Suspense>
                <Toaster position="top-right" richColors closeButton />
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
