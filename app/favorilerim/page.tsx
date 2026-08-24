'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useCart } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils/format';

export default function WishlistPage() {
  const { favorites, toggleFavorite } = useWishlist();
  const { addItem } = useCart();

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-stone-900">Favorileriniz Boş</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Beğendiğiniz Tahtakale ürünlerini kalp ikonuna tıklayarak favorilerinize ekleyebilir, dilediğinizde tek tıkla sepete atabilirsiniz.
        </p>
        <Link
          href="/kategori/tum-urunler"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition"
        >
          <span>Ürünleri Keşfet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
          Favorilerim ({favorites.length} Ürün)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Kaydettiğiniz ürünleri buradan inceleyebilir ve doğrudan sepete ekleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((product) => {
          const cover = product.images?.[0]?.image_url || '/images/logo.webp';

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col"
            >
              <div className="relative aspect-square bg-stone-100">
                <Link href={`/urun/${product.slug}`}>
                  <Image src={cover} alt={product.name} fill className="object-cover" />
                </Link>
                <button
                  onClick={() => toggleFavorite(product)}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-rose-600 hover:bg-rose-50 transition shadow-sm"
                  title="Favorilerden Çıkar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700">
                    {product.category?.name || 'Tahtakale'}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 mt-1 line-clamp-2 hover:text-amber-700">
                    <Link href={`/urun/${product.slug}`}>{product.name}</Link>
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-black text-sm text-amber-700">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => addItem(product, product.variants?.[0] || null)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sepete Ekle</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
