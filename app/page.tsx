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
import { DataService, DEFAULT_STORE_CATEGORIES } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';

// 10 Genuine Circular Quick Navigation & Category Bubbles (No Fake Labels)
const STORY_ITEMS = [
  {
    id: 'story-tum-urunler',
    title: 'Tüm Ürünler',
    icon: Sparkles,
    href: '/kategori/tum-urunler',
    ringGradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-50 to-amber-50',
    iconColor: 'text-orange-600',
  },
  {
    id: 'story-kirtasiye',
    title: 'Kırtasiye',
    icon: Tag,
    href: '/kategori/k-rtasiye-r-nleri',
    ringGradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'story-hediyelik',
    title: 'Hediyelik',
    icon: Gift,
    href: '/kategori/tum-urunler',
    ringGradient: 'from-pink-500 via-rose-500 to-red-500',
    bgGradient: 'from-pink-50 to-rose-50',
    iconColor: 'text-pink-600',
  },
  {
    id: 'story-dogal-tas',
    title: 'Doğal Taş & Takı',
    icon: Gem,
    href: '/kategori/tum-urunler',
    ringGradient: 'from-purple-500 via-violet-500 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'story-toptan',
    title: 'Tahtakale Toptan',
    icon: Package,
    href: '/toptan-satis',
    ringGradient: 'from-emerald-500 via-teal-500 to-green-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'story-dhl-kargo',
    title: 'DHL Kargo',
    icon: Truck,
    href: '/iade-ve-teslimat',
    ringGradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-50 to-orange-50',
    iconColor: 'text-amber-700',
  },
  {
    id: 'story-magaza',
    title: 'Eminönü Şube',
    icon: Store,
    href: '/iletisim',
    ringGradient: 'from-rose-500 via-orange-500 to-amber-500',
    bgGradient: 'from-rose-50 to-orange-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'story-siparis-takip',
    title: 'Sipariş Takip',
    icon: FileText,
    href: '/siparis-takip',
    ringGradient: 'from-sky-500 via-blue-500 to-indigo-500',
    bgGradient: 'from-sky-50 to-blue-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'story-konum',
    title: 'Harita & Konum',
    icon: MapPin,
    href: '/iletisim',
    ringGradient: 'from-teal-500 via-emerald-500 to-green-500',
    bgGradient: 'from-teal-50 to-emerald-50',
    iconColor: 'text-teal-700',
  },
  {
    id: 'story-destek',
    title: 'Canlı Destek',
    icon: MessageCircle,
    href: 'https://wa.me/905077737777',
    ringGradient: 'from-emerald-500 via-green-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-green-50',
    iconColor: 'text-emerald-600',
  },
];

// Vibrant Pastel Palette for Trendyol Style Category Discovery Cards
const PASTEL_THEMES = [
  {
    bg: 'bg-rose-100/80 hover:bg-rose-200/90',
    border: 'border-rose-200/90 hover:border-rose-400',
    badge: 'bg-rose-500 text-white',
    iconColor: 'text-rose-600',
    icon: Tag,
  },
  {
    bg: 'bg-purple-100/80 hover:bg-purple-200/90',
    border: 'border-purple-200/90 hover:border-purple-400',
    badge: 'bg-purple-500 text-white',
    iconColor: 'text-purple-600',
    icon: Gem,
  },
  {
    bg: 'bg-sky-100/80 hover:bg-sky-200/90',
    border: 'border-sky-200/90 hover:border-sky-400',
    badge: 'bg-sky-500 text-white',
    iconColor: 'text-sky-600',
    icon: Gift,
  },
  {
    bg: 'bg-amber-100/80 hover:bg-amber-200/90',
    border: 'border-amber-200/90 hover:border-amber-400',
    badge: 'bg-amber-500 text-white',
    iconColor: 'text-amber-700',
    icon: ShoppingBag,
  },
  {
    bg: 'bg-orange-100/80 hover:bg-orange-200/90',
    border: 'border-orange-200/90 hover:border-orange-400',
    badge: 'bg-orange-500 text-white',
    iconColor: 'text-orange-600',
    icon: Package,
  },
  {
    bg: 'bg-emerald-100/80 hover:bg-emerald-200/90',
    border: 'border-emerald-200/90 hover:border-emerald-400',
    badge: 'bg-emerald-500 text-white',
    iconColor: 'text-emerald-600',
    icon: Sparkles,
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_STORE_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Story scroll container ref
  const storiesScrollRef = useRef<HTMLDivElement>(null);

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

  const scrollStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      const amount = direction === 'left' ? -250 : 250;
      storiesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const getCategoryPhoto = (cat: Category) => {
    const cName = (cat.name || '').toLowerCase();
    const cSlug = (cat.slug || '').toLowerCase();

    const matched = products.find((p) => {
      if (p.category_id && p.category_id === cat.id) return true;
      if (p.category && (p.category.id === cat.id || p.category.slug === cat.slug)) return true;
      const pName = (p.name || '').toLowerCase();
      if (cSlug.includes('k-rtasiye') || cName.includes('kırtasiye') || cName.includes('kirtasiye')) {
        return pName.includes('kırtasiye') || pName.includes('defter') || pName.includes('kalem') || pName.includes('notluk');
      }
      if (cName.includes('taş') || cName.includes('takı')) {
        return pName.includes('taş') || pName.includes('kolye') || pName.includes('bileklik') || pName.includes('ametist') || pName.includes('akik') || pName.includes('kuvars');
      }
      if (cName.includes('hediye')) {
        return pName.includes('hediye') || pName.includes('set');
      }
      if (cName.includes('çanta') || cName.includes('aksesuar')) {
        return pName.includes('çanta') || pName.includes('aksesuar');
      }
      return false;
    });

    const validImages = (matched?.images || []).filter(
      (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
    );
    return validImages.find((img) => img.is_cover)?.image_url || validImages[0]?.image_url || (cat.image_url && cat.image_url !== '/images/logo.webp' ? cat.image_url : null);
  };

  const featuredProducts = products.filter((p) => p.is_featured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 relative bg-dots-pattern">
      
      {/* ============================================================ */}
      {/* 1. TRENDYOL STYLE CIRCULAR STORIES / QUICK ACTION BUTTONS   */}
      {/* ============================================================ */}
      <section className="bg-white/95 backdrop-blur-md border-b border-amber-200/50 pt-4 pb-5 shadow-2xs">
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollStories('left')}
            aria-label="Sola Kaydır"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-orange-600 hover:scale-110 active:scale-95 transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Stories Horizontal Container */}
          <div
            ref={storiesScrollRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
          >
            {STORY_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center gap-2 group/story shrink-0 transition-transform active:scale-95"
                >
                  {/* Circular Ring with Vibrant Gradient */}
                  <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${item.ringGradient} shadow-xs group-hover/story:scale-105 transition-transform duration-300`}>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${item.bgGradient} flex items-center justify-center border-2 border-white shadow-inner`}>
                      <IconComp className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor} group-hover/story:rotate-6 transition-transform`} />
                    </div>
                  </div>

                  {/* Title */}
                  <span className="text-[11px] sm:text-xs font-bold text-stone-800 text-center line-clamp-1 max-w-[80px] group-hover/story:text-orange-600 transition-colors">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollStories('right')}
            aria-label="Sağa Kaydır"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-orange-600 hover:scale-110 active:scale-95 transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRENDYOL STYLE "KATEGORİLERİ KEŞFET" (RENKLİ PASTEL KARTLAR) */}
      {/* ============================================================ */}
      {categories.length > 0 && (
        <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border border-amber-200/60 shadow-lg shadow-orange-950/[0.03] space-y-5 overflow-hidden relative">
            
            {/* Cheerful Rainbow Top Accent Trim */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-purple-400 via-amber-400 to-orange-400" />

            {/* Header Row */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
                    Kategorileri Keşfet
                  </h2>
                  <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                    Eminönü Tahtakale vitrinimizden renkli koleksiyonlar
                  </p>
                </div>
              </div>

              <Link
                href="/kategori/tum-urunler"
                className="text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 group py-1"
              >
                <span>Tüm Kategoriler</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Pastel Square Categories Grid (Trendyol Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat, idx) => {
                const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length];
                const IconComp = theme.icon;
                const photo = getCategoryPhoto(cat);

                return (
                  <Link
                    key={cat.id}
                    href={cat.slug === 'toptan-satis' ? '/toptan-satis' : `/kategori/${cat.slug}`}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    {/* Pastel Rounded Square Container */}
                    <div className={`relative w-full aspect-square rounded-2xl sm:rounded-3xl ${theme.bg} ${theme.border} border p-3 flex items-center justify-center overflow-hidden shadow-2xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}>
                      
                      {/* Top Right Mini Star Badge */}
                      <span className={`absolute top-2 right-2 w-5 h-5 rounded-full ${theme.badge} flex items-center justify-center text-[10px] font-black shadow-xs z-10`}>
                        ★
                      </span>

                      {/* Centered Image or Stylized Icon */}
                      {photo ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={photo}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 backdrop-blur-xs shadow-xs border border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComp className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.iconColor}`} />
                        </div>
                      )}
                    </div>

                    {/* Title & Action Label Below Box */}
                    <div className="text-center mt-2.5 w-full px-1">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-orange-600 group-hover:text-orange-700 block mt-0.5">
                        Keşfet &rsaquo;
                      </span>
                    </div>
                  </Link>
                );
              })}
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
      {/* 5. TAHTAKALE EMİNÖNÜ & DHL GÜVEN ŞERİDİ                       */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-white rounded-3xl border border-orange-200/90 shadow-2xs hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Hızlı Sevkiyat & DHL</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Siparişleriniz güvenli ve korumalı paketleme ile 1-3 iş gününde kargoya verilir.
              </p>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white rounded-3xl border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Mağazadan Elden Teslim</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Tahtakale Eminönü fiziki şubemizden kargo bedelsiz elden teslim alabilirsiniz.
              </p>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-3xl border border-emerald-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Net & Şeffaf Fiyat</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                Yanıltıcı sahte indirimler yok; perakende ve toptanda doğrudan net liste fiyatları.
              </p>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white rounded-3xl border border-blue-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
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
      {/* 6. TAHTAKALE EMİNÖNÜ HERITAGE & WHOLESALE BANNER             */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-orange-950/90 to-stone-950 text-white p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl border border-orange-900/40">
          
          {/* Warm Ambient Glow Effects */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-orange-400" />
              <span>Eminönü Tahtakale Ticaret Geleneği</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
              Toptan ve Perakendede <br />
              <span className="text-orange-400">Şeffaf ve Dürüst Fiyat Politikası</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Tahtakale&apos;nin tarihi ticaret sokaklarında; yapay indirim oyunları yerine doğrudan net ve adil fiyatlandırma sunuyoruz. İster DHL Kargo ile kapınıza gelsin, ister Eminönü şubemizden teslim alın.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/toptan-satis"
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tahtakale Toptan Teklif Al</span>
              </Link>
              <Link
                href="/hakkimizda"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition text-center"
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
