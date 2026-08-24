'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/store/wishlist-store';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { favorites } = useWishlist();

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4 pb-24">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-stone-900">Favorileriniz Boş</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Beğendiğiniz Tahtakale ürünlerini kalp butonuna dokunarak favorilerinize ekleyebilir, dilediğinizde tek tıkla sepete atabilirsiniz.
        </p>
        <Link
          href="/kategori/tum-urunler"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl transition min-h-[44px]"
        >
          <span>Ürünleri Keşfet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 pb-24 lg:pb-12">
      <div className="border-b border-stone-200 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
          Favorilerim ({favorites.length} Ürün)
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Kaydettiğiniz ürünleri buradan inceleyebilir ve doğrudan sepete ekleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
        {favorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
