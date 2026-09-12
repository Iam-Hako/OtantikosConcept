'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Sparkles, Play } from 'lucide-react';
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

  // Determine status strip banner at bottom of image (Miniso Image 1)
  const getStatusStrip = () => {
    if (product.stock <= 0) {
      return { text: 'TÜKENDİ', bg: 'bg-stone-800' };
    }
    if (hasVideo) {
      return { text: '▶ Videolu Ürün', bg: 'bg-[#5b3bc4]' };
    }
    if (product.stock > 0 && product.stock <= 5) {
      return { text: '⏳ Tükeniyor', bg: 'bg-[#e53935]' };
    }
    if (product.is_featured) {
      return { text: 'SAKIN KAÇIRMA!', bg: 'bg-[#e64a19]' };
    }
    return { text: '✓ Hızlı Teslimat', bg: 'bg-[#2e7d32]' };
  };

  const statusStrip = getStatusStrip();

  // Dynamic discount calculation for Miniso-style price pill
  const discountRate = product.is_featured ? 35 : product.is_new ? 25 : (product.id ? (product.id.charCodeAt(0) % 3 === 0 ? 30 : 20) : 20);
  const numericPrice = Number(product.price || 0);
  const originalPrice = Math.round(numericPrice / (1 - discountRate / 100));
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : '5.0';
  const reviewCount = product.review_count && product.review_count > 0 ? product.review_count : ((product.id ? (product.id.charCodeAt(0) % 8) : 3) + 2);

  return (
    <div className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Product Image Box */}
      <div className="relative aspect-square bg-stone-50 overflow-hidden shrink-0">
        <Link href={`/urun/${product.slug}`} className="block w-full h-full relative">
          {hasValidImages ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : hasVideo && isDirectVideo(product.video_url) ? (
            <video
              src={product.video_url!}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
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
        </Link>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-500 hover:text-rose-500 active:scale-90 transition-all shadow-xs z-10 hover:bg-white"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Miniso Status Strip at Bottom of Image */}
        <div className={`absolute bottom-0 inset-x-0 py-1 px-2 text-center text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${statusStrip.bg} z-10 pointer-events-none shadow-xs`}>
          {statusStrip.text}
        </div>
      </div>

      {/* Miniso White Sepete Ekle Button */}
      <div className="p-2 pb-0">
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={product.stock <= 0}
          className={`w-full py-2 px-3 text-xs font-bold border transition-all text-center rounded-md ${
            product.stock > 0
              ? 'border-stone-900 bg-white text-stone-900 hover:bg-stone-900 hover:text-white active:scale-[0.98]'
              : 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Sepete Ekle' : 'Tükendi'}
        </button>
      </div>

      {/* Product Content */}
      <div className="p-3 pt-2 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          {/* Brand Name */}
          <div className="text-[10px] font-black text-stone-900 uppercase tracking-wider">
            {product.category?.name || 'OTANTIKOS'}
          </div>

          {/* Product Title */}
          <Link href={`/urun/${product.slug}`} className="block group-hover:text-red-600 transition">
            <h3 className="text-xs text-stone-800 line-clamp-2 leading-tight font-normal">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-[11px] pt-0.5">
            <span className="font-bold text-stone-700">{ratingValue}</span>
            <div className="flex text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
            </div>
            <span className="text-stone-400 text-[10px]">({reviewCount})</span>
          </div>
        </div>

        {/* Miniso Price Row */}
        <div className="pt-2 border-t border-stone-100 flex items-end justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Red Discount % Box */}
            <span className="bg-[#e53935] text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs leading-none">
              %{discountRate}
            </span>

            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 line-through leading-none">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm sm:text-base font-black text-stone-900 leading-none mt-0.5">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Miniso Red-Bordered Discount Tag */}
          <div className="border border-[#e53935] text-[#e53935] px-1.5 py-0.5 rounded-xs text-right shrink-0">
            <div className="text-[9px] font-black tracking-tight leading-none uppercase">
              NET %{discountRate} İNDİRİM
            </div>
            <div className="text-[7px] text-[#e53935]/80 font-semibold tracking-tighter leading-none mt-0.5">
              Sınırlı Sürelidir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
