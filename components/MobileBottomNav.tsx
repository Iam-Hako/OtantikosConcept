'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { totalFavorites } = useWishlist();

  // Hide on admin routes or checkout for clean focus
  if (pathname.startsWith('/admin') || pathname === '/odeme') {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
            pathname === '/' ? 'text-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Ana Sayfa</span>
        </Link>

        {/* Categories */}
        <Link
          href="/kategori/tum-urunler"
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
            pathname.startsWith('/kategori') ? 'text-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Kategoriler</span>
        </Link>

        {/* Search */}
        <Link
          href="/kategori/tum-urunler?focus=search"
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
            pathname.includes('ara=') ? 'text-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Canlı Ara</span>
        </Link>

        {/* Wishlist */}
        <Link
          href="/favorilerim"
          className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
            pathname === '/favorilerim' ? 'text-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {totalFavorites}
              </span>
            )}
          </div>
          <span>Favoriler</span>
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={openDrawer}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-stone-500 hover:text-amber-700 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="font-bold text-stone-800">Sepet</span>
        </button>
      </div>
    </div>
  );
}
