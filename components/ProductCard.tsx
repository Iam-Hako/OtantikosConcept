'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Play, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { formatPrice, convertGoogleDriveVideoUrl } from '@/lib/utils/format';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();

  const isFav = isFavorite(product.id);
  const validImages = (product.images || []).filter(
    (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
  );
  const hasValidImages = validImages.length > 0;
  const hasVideo = Boolean(product.video_url && product.video_url.trim());
  const coverImage = validImages.find((img) => img.is_cover)?.image_url || validImages[0]?.image_url;

  const isDirectVideo = (url?: string | null) => {
    if (!url) return false;
    const clean = url.split('?')[0].toLowerCase();
    return (
      clean.endsWith('.mp4') ||
      clean.endsWith('.webm') ||
      clean.endsWith('.mov') ||
      clean.endsWith('.ogg') ||
      url.includes('/storage/v1/object/public/') ||
      url.includes('supabase.co/storage')
    );
  };

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

  // Strikethrough old market price calculation (typical e-commerce display)
  const marketPrice = Math.round(product.price * 1.22);
  const reviewCount = product.review_count && product.review_count > 0 ? product.review_count : ((product.id.charCodeAt(0) * 7) % 60) + 40;
  const ratingValue = product.rating && product.rating > 0 ? product.rating : 4.9;

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full ring-1 ring-black/[0.03]">
      {/* Product Image Box */}
      <div className="relative aspect-square sm:aspect-[4/5] bg-stone-50 overflow-hidden shrink-0">
        <Link href={`/urun/${product.slug}`} className="block w-full h-full relative">
          {hasValidImages ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : hasVideo && isDirectVideo(product.video_url) ? (
            <video
              src={product.video_url!}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
            />
          ) : hasVideo ? (
            <div className="relative w-full h-full bg-stone-950 overflow-hidden pointer-events-none">
              <iframe
                src={convertGoogleDriveVideoUrl(product.video_url!)}
                className="w-full h-full border-0 pointer-events-none object-cover scale-105"
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4">
              <Sparkles className="w-8 h-8 text-amber-500/40 mb-1" />
              <span className="text-[11px] font-medium text-stone-500 text-center line-clamp-1">{product.name}</span>
            </div>
          )}

          {/* Trendyol Style Bottom Bar on Image: Free Shipping */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent py-1 px-2.5 flex items-center justify-between text-[10px] text-white font-bold">
            <span className="bg-emerald-500/90 text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide">
              Kargo Bedava
            </span>
            <span className="text-[9px] text-stone-200">
              Hızlı Teslimat
            </span>
          </div>
        </Link>

        {/* Floating Trendyol Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {/* Trendyol Style Circular 'EN ÇOK SATAN' / 'SÜPER FİYAT' Stamp */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-md flex flex-col items-center justify-center text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none text-center border-2 border-white rotate-[-6deg] group-hover:rotate-0 transition-transform">
            <span>EN ÇOK</span>
            <span className="text-yellow-200">SATAN</span>
          </div>

          {hasVideo && hasValidImages && (
            <span className="px-2 py-0.5 bg-stone-900/85 backdrop-blur-md text-amber-400 text-[9px] font-bold rounded-full shadow-xs flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-amber-400" />
              <span>Video</span>
            </span>
          )}

          {product.wholesale_price ? (
            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-bold rounded-md shadow-xs flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>Toptan Fiyat</span>
            </span>
          ) : null}

          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded-md shadow-xs">
              Son {product.stock} Adet
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          className="absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-stone-500 hover:text-rose-500 active:scale-90 transition-all shadow-sm z-10 hover:bg-white"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Trendyol 'İYİ FİYAT' Stamp & Category Tag */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">
              ⚡ İYİ FİYAT
            </span>
            <span className="text-[10px] text-stone-400 font-medium truncate max-w-[110px]">
              {product.category?.name || 'Otantikos Concept'}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/urun/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 hover:text-orange-600 transition leading-snug">
              <span className="font-extrabold text-stone-950">Otantikos</span> • {product.name}
            </h3>
          </Link>

          {/* Trendyol Style Star Rating & Social Proof */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-stone-800">{ratingValue}</span>
            <span className="text-[10px] text-stone-400">({reviewCount})</span>
          </div>

          {/* Trendyol Mini Social Proof Tag */}
          <div className="mt-1.5 text-[10px] font-semibold text-orange-700 bg-orange-50/80 px-2 py-0.5 rounded-md inline-block border border-orange-100">
            🔥 Son 24 saatte 40+ kişi inceledi
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-stone-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 line-through">
                {formatPrice(marketPrice)}
              </span>
              <span className="text-base sm:text-xl font-black text-orange-600 tracking-tight leading-none">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.wholesale_price && (
              <div className="text-right">
                <span className="text-[9px] text-stone-400 uppercase font-semibold block">Toptan</span>
                <span className="text-xs font-bold text-emerald-700">
                  {formatPrice(product.wholesale_price)}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs ${
              product.stock > 0
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
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
