'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  ChevronRight, 
  ChevronLeft,
  Truck,
  Store,
  ShieldCheck,
  MessageCircle,
  Gem,
  Award,
  Gift,
  Tag,
  Package,
  MapPin,
  FileText
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';
import HeroBannerSlider from '@/components/HeroBannerSlider';



// Miniso Inspired Circular Pastel Category Themes
const CIRCULAR_PASTEL_THEMES = [
  {
    ringBg: 'bg-gradient-to-b from-rose-100/90 via-pink-100/70 to-rose-200/80',
    innerBg: 'bg-white/90',
    border: 'border-rose-200/90 group-hover:border-rose-400',
    shadow: 'shadow-md shadow-rose-200/40 group-hover:shadow-rose-300/60',
    iconColor: 'text-rose-500',
    icon: Tag,
  },
  {
    ringBg: 'bg-gradient-to-b from-purple-100/90 via-fuchsia-100/70 to-purple-200/80',
    innerBg: 'bg-white/90',
    border: 'border-purple-200/90 group-hover:border-purple-400',
    shadow: 'shadow-md shadow-purple-200/40 group-hover:shadow-purple-300/60',
    iconColor: 'text-purple-500',
    icon: Gem,
  },
  {
    ringBg: 'bg-gradient-to-b from-sky-100/90 via-blue-100/70 to-sky-200/80',
    innerBg: 'bg-white/90',
    border: 'border-sky-200/90 group-hover:border-sky-400',
    shadow: 'shadow-md shadow-sky-200/40 group-hover:shadow-sky-300/60',
    iconColor: 'text-sky-500',
    icon: Gift,
  },
  {
    ringBg: 'bg-gradient-to-b from-amber-100/90 via-yellow-100/70 to-amber-200/80',
    innerBg: 'bg-white/90',
    border: 'border-amber-200/90 group-hover:border-amber-400',
    shadow: 'shadow-md shadow-amber-200/40 group-hover:shadow-amber-300/60',
    iconColor: 'text-amber-600',
    icon: ShoppingBag,
  },
  {
    ringBg: 'bg-gradient-to-b from-emerald-100/90 via-teal-100/70 to-emerald-200/80',
    innerBg: 'bg-white/90',
    border: 'border-emerald-200/90 group-hover:border-emerald-400',
    shadow: 'shadow-md shadow-emerald-200/40 group-hover:shadow-emerald-300/60',
    iconColor: 'text-emerald-500',
    icon: Sparkles,
  },
  {
    ringBg: 'bg-gradient-to-b from-orange-100/90 via-amber-100/70 to-orange-200/80',
    innerBg: 'bg-white/90',
    border: 'border-orange-200/90 group-hover:border-orange-400',
    shadow: 'shadow-md shadow-orange-200/40 group-hover:shadow-orange-300/60',
    iconColor: 'text-orange-500',
    icon: Package,
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category scroll container ref
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          DataService.getPublicProducts(),
          DataService.getCategories(),
        ]);
        setProducts(prodList);
        setCategories(catList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      categoriesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const getCategoryPhoto = (cat: Category) => {
    if (cat.image_url && cat.image_url.trim() && cat.image_url !== '/images/logo.webp') {
      return cat.image_url;
    }
    const cName = (cat.name || '').toLowerCase();
    const cSlug = (cat.slug || '').toLowerCase();

    const matched = products.find((p) => {
      if (p.category_id && p.category_id === cat.id) return true;
      if (p.category && (p.category.id === cat.id || p.category.slug === cat.slug)) return true;
      const pName = (p.name || '').toLowerCase();
      const cNameClean = cName.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '');
      return cNameClean.length > 2 && pName.includes(cNameClean);
    });

    const validImages = (matched?.images || []).filter(
      (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
    );
    return validImages.find((img) => img.is_cover)?.image_url || validImages[0]?.image_url || null;
  };

  const featuredProducts = products.filter((p) => p.is_featured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 relative bg-white">
      
      {/* ============================================================ */}
      {/* 1. MINISO STYLE HERO BANNER SLIDER (YÖNETİM MERKEZİNDEN KONTROLLÜ) */}
      {/* ============================================================ */}
      <HeroBannerSlider />

      {/* ============================================================ */}
      {/* 2. MINISO STYLE CIRCULAR PASTEL CATEGORY CAROUSEL            */}
      {/* ============================================================ */}
      {categories.length > 0 && (
        <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border border-amber-200/60 shadow-lg shadow-orange-950/[0.03] space-y-5 overflow-hidden relative group/catsection">
            
            {/* Cheerful Rainbow Top Accent Trim */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-purple-400 via-amber-400 to-orange-400" />

            {/* Header Row */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
                    Kategorileri Keşfet
                  </h2>
                  <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                    Renkli ve sevimli koleksiyonlarımızı keşfe çıkın
                  </p>
                </div>
              </div>

              <Link
                href="/kategori/tum-urunler"
                className="text-xs sm:text-sm font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 group py-1"
              >
                <span>Tüm Kategoriler</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Miniso Style Circular Categories Carousel with Left/Right Buttons */}
            <div className="relative">
              {/* Left Arrow Button */}
              <button
                onClick={() => scrollCategories('left')}
                aria-label="Kategorileri Sola Kaydır"
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-red-600 hover:scale-110 active:scale-95 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Categories Horizontal Scroll Row */}
              <div
                ref={categoriesScrollRef}
                className="flex items-start gap-5 sm:gap-8 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
              >
                {categories.map((cat, idx) => {
                  const theme = CIRCULAR_PASTEL_THEMES[idx % CIRCULAR_PASTEL_THEMES.length];
                  const IconComp = theme.icon;
                  const photo = getCategoryPhoto(cat);

                  return (
                    <Link
                      key={cat.id}
                      href={cat.slug === 'toptan-satis' ? '/toptan-satis' : `/kategori/${cat.slug}`}
                      className="group/item flex flex-col items-center cursor-pointer shrink-0 w-24 sm:w-28 md:w-32 transition-transform active:scale-95"
                    >
                      {/* Miniso Style Circular Disc (Image 5) */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-1 bg-white border-2 border-stone-200 hover:border-red-400 shadow-xs group-hover/item:shadow-md flex items-center justify-center group-hover/item:scale-105 transition-all duration-300">
                        <div className="w-full h-full rounded-full bg-stone-50 flex items-center justify-center overflow-hidden relative">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={cat.name}
                              fill
                              sizes="(max-width: 640px) 96px, 128px"
                              className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                            />
                          ) : cat.icon ? (
                            <span className="text-3xl sm:text-4xl select-none group-hover/item:scale-110 transition-transform">
                              {cat.icon}
                            </span>
                          ) : (
                            <IconComp className={`w-7 h-7 sm:w-9 sm:h-9 ${theme.iconColor} group-hover/item:rotate-6 transition-transform`} />
                          )}
                        </div>
                      </div>

                      {/* Title Below Disc */}
                      <div className="text-center mt-2.5 w-full px-1">
                        <h3 className="text-xs sm:text-[13px] font-bold text-stone-800 group-hover/item:text-red-600 transition-colors line-clamp-2 leading-tight">
                          {cat.name}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={() => scrollCategories('right')}
                aria-label="Kategorileri Sağa Kaydır"
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-red-600 hover:scale-110 active:scale-95 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. TRENDYOL STYLE "POPÜLER ÜRÜNLER" VİTRİNİ                  */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border border-amber-200/60 shadow-lg shadow-orange-950/[0.03] space-y-6 overflow-hidden relative">
          
          {/* Cheerful Warm Top Accent Trim */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400" />

          {/* Header Row */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                  Öne Çıkan Ürünler
                </h2>
                <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                  Tahtakale Eminönü vitrinimizden seçkin modeller
                </p>
              </div>
            </div>

            <Link
              href="/kategori/tum-urunler"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 group py-1"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-3 space-y-3 shadow-2xs">
                  <div className="aspect-square w-full bg-stone-100 rounded-xl" />
                  <div className="h-3 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-4 bg-orange-100/70 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">Ürünler Hazırlanıyor</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Koleksiyonumuz güncelleniyor, lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
              {displayProducts.slice(0, 12).map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 6} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TAHTAKALE EMİNÖNÜ & DHL GÜVEN ŞERİDİ (MINISO PASTEL TARZ) */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white rounded-2xl sm:rounded-3xl border border-rose-200/80 shadow-2xs hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#e60012] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Hızlı Sevkiyat & DHL</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Siparişleriniz güvenli ve korumalı paketleme ile 1-3 iş gününde kargoya verilir.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xs hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Mağazadan Elden Teslim</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Tahtakale Eminönü fiziki şubemizden kargo bedelsiz elden teslim alabilirsiniz.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-2xl sm:rounded-3xl border border-emerald-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Net & Şeffaf Fiyat</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Yanıltıcı sahte indirimler yok; perakende ve toptanda doğrudan net liste fiyatları.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white rounded-2xl sm:rounded-3xl border border-blue-200/80 shadow-2xs hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">WhatsApp Canlı Destek</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Toptan alımlar ve özel siparişleriniz için WhatsApp hattımızdan doğrudan iletişim.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. MINISO STYLE WHOLESALE & HERITAGE SHOWCASE BANNER         */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-amber-50/80 p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-xl shadow-rose-950/[0.03] border border-rose-200/80">
          
          {/* Playful Ambient Pastel Glow Effects */}
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-rose-200/50 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-60 h-60 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/90 border border-rose-200 text-[#e60012] text-[11px] sm:text-xs font-black shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[#e60012]" />
              <span>Eminönü Tahtakale Ticaret Geleneği</span>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-sans font-black text-stone-900 leading-tight tracking-tight">
              Toptan ve Perakendede <br className="hidden sm:block" />
              <span className="text-[#e60012]">Şeffaf ve Dürüst Fiyat Politikası</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
              Tahtakale&apos;nin tarihi ticaret sokaklarında; yapay indirim oyunları yerine doğrudan net ve adil fiyatlandırma sunuyoruz. İster DHL Kargo ile kapınıza gelsin, ister Eminönü şubemizden teslim alın.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/toptan-satis"
                className="px-6 py-3 sm:px-8 sm:py-3.5 bg-[#e60012] hover:bg-[#c90010] text-white text-xs sm:text-sm font-black rounded-full shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tahtakale Toptan Teklif Al</span>
              </Link>
              <Link
                href="/hakkimizda"
                className="px-6 py-3 sm:px-8 sm:py-3.5 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-bold rounded-full border border-stone-200/90 shadow-2xs hover:border-stone-400 transition-all text-center"
              >
                Kurumsal Hikayemiz
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
