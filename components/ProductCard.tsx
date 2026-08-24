'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();

  const isFav = isFavorite(product.id);
  const coverImage = product.images?.find((img) => img.is_cover)?.image_url || 
                     product.images?.[0]?.image_url || 
                     '/images/logo.webp';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Bu ürün şu anda tükenmiştir.');
      return;
    }
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addItem(product, defaultVariant, 1);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image Box */}
      <div className="relative aspect-square sm:aspect-[4/5] bg-stone-100 overflow-hidden shrink-0">
        <Link href={`/urun/${product.slug}`} className="block w-full h-full">
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-xs">
              Yeni
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-xs">
              Son {product.stock} Adet
            </span>
          )}
          {product.stock <= 0 && (
            <span className="px-2 py-0.5 bg-stone-800 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-xs">
              Tükendi
            </span>
          )}
        </div>

        {/* Wishlist Button (Min 44x44px Touch Target) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          className="absolute top-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-600 active:scale-90 transition-all shadow-xs z-10"
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Pill / SKU */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-400 mb-1">
            <span className="truncate max-w-[70%] font-medium">
              {product.category?.name || 'Otantikos'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating || 5.0}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/urun/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 hover:text-amber-700 transition leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-[10px] text-stone-400 hidden sm:block">Net Fiyat:</div>
            <div className="text-sm sm:text-base font-black text-amber-700 leading-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs ${
              product.stock > 0
                ? 'bg-stone-900 text-white hover:bg-amber-700'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock > 0 ? 'Sepete Ekle' : 'Tükendi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
