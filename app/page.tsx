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
  Flame,
  Truck,
  Store,
  ShieldCheck,
  MessageCircle,
  Gem,
  Award,
  Clock,
  Percent,
  Gift,
  Tag,
  Package,
  Zap,
  Star,
  CheckCircle
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';

// 10 Trendyol Style Circular Stories / Quick Feature Badges
const STORY_ITEMS = [
  {
    id: 'story-kesfet',
    title: 'Ürünleri Keşfet',
    icon: Sparkles,
    badge: 'Tümü',
    href: '/kategori/tum-urunler',
    ringGradient: 'from-rose-500 via-orange-500 to-amber-500',
    bgGradient: 'from-rose-50 to-orange-50',
    textColor: 'text-rose-700',
    iconColor: 'text-rose-600',
  },
  {
    id: 'story-fiyat-dusenler',
    title: 'Fiyatı Düşenler',
    icon: Percent,
    badge: 'İndirim',
    href: '/kategori/tum-urunler?filter=indirimli',
    ringGradient: 'from-purple-500 via-pink-500 to-rose-500',
    bgGradient: 'from-purple-50 to-pink-50',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600',
  },
  {
    id: 'story-gunun-firsati',
    title: 'Günün Fırsatları',
    icon: Flame,
    badge: 'Flaş',
    href: '#gunun-firsatlari',
    ringGradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-50 to-amber-50',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  {
    id: 'story-dogal-tas',
    title: 'Doğal Taş & Takı',
    icon: Gem,
    badge: 'Trend',
    href: '/kategori/tum-urunler?filter=dogal-tas',
    ringGradient: 'from-violet-500 via-purple-500 to-indigo-500',
    bgGradient: 'from-violet-50 to-indigo-50',
    textColor: 'text-violet-700',
    iconColor: 'text-violet-600',
  },
  {
    id: 'story-kirtasiye',
    title: 'Kırtasiye Dünyası',
    icon: Tag,
    badge: 'Popüler',
    href: '/kategori/kirtasiye-urunleri',
    ringGradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    id: 'story-hediyelik',
    title: 'Hediyelik Konsept',
    icon: Gift,
    badge: 'Özel',
    href: '/kategori/tum-urunler?filter=hediyelik',
    ringGradient: 'from-pink-500 via-rose-500 to-red-500',
    bgGradient: 'from-pink-50 to-rose-50',
    textColor: 'text-pink-700',
    iconColor: 'text-pink-600',
  },
  {
    id: 'story-toptan',
    title: 'Tahtakale Toptan',
    icon: Package,
    badge: 'Avantaj',
    href: '/toptan-satis',
    ringGradient: 'from-emerald-500 via-teal-500 to-green-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'story-iyi-fiyat',
    title: 'İyi Fiyatlı Ürünler',
    icon: Zap,
    badge: 'Süper',
    href: '/kategori/tum-urunler?filter=iyi-fiyat',
    ringGradient: 'from-amber-500 via-yellow-500 to-orange-500',
    bgGradient: 'from-amber-50 to-yellow-50',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
  },
  {
    id: 'story-kargo-bedava',
    title: 'Kargo Bedava',
    icon: Truck,
    badge: 'DHL',
    href: '/kategori/tum-urunler?filter=kargo-bedava',
    ringGradient: 'from-teal-500 via-emerald-500 to-green-500',
    bgGradient: 'from-teal-50 to-emerald-50',
    textColor: 'text-teal-800',
    iconColor: 'text-teal-600',
  },
  {
    id: 'story-kupon',
    title: 'İndirim Kuponu',
    icon: Award,
    badge: '50 TL',
    href: '#kupon-al',
    ringGradient: 'from-rose-500 via-red-500 to-amber-500',
    bgGradient: 'from-rose-50 to-red-50',
    textColor: 'text-rose-800',
    iconColor: 'text-rose-600',
  },
];

// Trendyol Style 4 Soft Gradient Discount Cards
const DISCOUNT_TIERS = [
  {
    id: 'tier-5',
    label: '%5',
    subLabel: 've üzeri indirim',
    tag: 'Fırsat Başlangıcı',
    bgClass: 'bg-gradient-to-br from-amber-100/90 via-orange-100/70 to-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200/80',
    btnClass: 'bg-orange-600 hover:bg-orange-700 text-white',
    href: '/kategori/tum-urunler?discount=5',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tier-10',
    label: '%10',
    subLabel: 've üzeri indirim',
    tag: 'Çok Satan Seçimler',
    bgClass: 'bg-gradient-to-br from-emerald-100/90 via-teal-100/70 to-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200/80',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    href: '/kategori/tum-urunler?discount=10',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tier-30',
    label: '%30',
    subLabel: 've üzeri indirim',
    tag: 'Süper İndirimler',
    bgClass: 'bg-gradient-to-br from-blue-100/90 via-indigo-100/70 to-sky-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-200/80',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    href: '/kategori/tum-urunler?discount=30',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tier-50',
    label: '%50',
    subLabel: 've üzeri indirim',
    tag: 'Büyük Sezon Sonu',
    bgClass: 'bg-gradient-to-br from-rose-100/90 via-pink-100/70 to-rose-50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-200/80',
    btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    href: '/kategori/tum-urunler?discount=50',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
  },
];

// Trendyol Style Square Category Discount Grid
const FEATURED_CATEGORY_TILES = [
  {
    name: 'Doğal Taş & Takı',
    desc: 'Ametist, Akik & Özel Kolyeler',
    bgGradient: 'from-purple-100 to-violet-50',
    accentColor: 'text-purple-700',
    href: '/kategori/tum-urunler?filter=dogal-tas',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80',
    discountBadge: '%25',
  },
  {
    name: 'Kırtasiye & Kalemlik',
    desc: 'Marifet Kalemlik & Defterler',
    bgGradient: 'from-amber-100 to-orange-50',
    accentColor: 'text-amber-800',
    href: '/kategori/kirtasiye-urunleri',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80',
    discountBadge: '%20',
  },
  {
    name: 'Hediyelik & Konsept',
    desc: 'Kişiye Özel Konsept Paketler',
    bgGradient: 'from-pink-100 to-rose-50',
    accentColor: 'text-rose-700',
    href: '/kategori/tum-urunler?filter=hediyelik',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
    discountBadge: '%30',
  },
  {
    name: 'Tütsü & Buhurdanlık',
    desc: 'Geri Akışlı Seramik Tütsülükler',
    bgGradient: 'from-emerald-100 to-teal-50',
    accentColor: 'text-emerald-800',
    href: '/kategori/tum-urunler?filter=tutsu',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80',
    discountBadge: '%15',
  },
  {
    name: 'Retro Çanta & Cüzdan',
    desc: 'Tahtakale Vintage Aksesuar',
    bgGradient: 'from-blue-100 to-sky-50',
    accentColor: 'text-blue-800',
    href: '/kategori/tum-urunler?filter=canta',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80',
    discountBadge: '%35',
  },
  {
    name: 'Tahtakale Toptan',
    desc: 'Koli Bazlı Özel Toptan Fiyat',
    bgGradient: 'from-stone-200 to-amber-100',
    accentColor: 'text-stone-900',
    href: '/toptan-satis',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    discountBadge: 'TOPTAN',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Flash Deals Countdown Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 45 });

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

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      const amount = direction === 'left' ? -250 : 250;
      storiesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const featuredProducts = products.filter((p) => p.is_featured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 bg-stone-50/50">
      
      {/* ============================================================ */}
      {/* 1. TRENDYOL STYLE CIRCULAR STORIES / QUICK ACTION BUTTONS   */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-stone-200/70 pt-4 pb-5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
          
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
                  <div className={`relative p-[2.5px] rounded-full bg-gradient-to-tr ${item.ringGradient} shadow-xs group-hover/story:scale-105 transition-transform duration-300`}>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${item.bgGradient} flex items-center justify-center border-2 border-white shadow-inner`}>
                      <IconComp className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor} group-hover/story:rotate-6 transition-transform`} />
                    </div>

                    {/* Floating Mini Badge */}
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-tight shadow-xs border border-white">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <span className="text-[11px] sm:text-xs font-bold text-stone-800 text-center line-clamp-1 max-w-[76px] group-hover/story:text-orange-600 transition-colors">
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
      {/* 2. DYNAMIC FLASH DEALS & LIVE COUNTDOWN TIMER HERO           */}
      {/* ============================================================ */}
      <section id="gunun-firsatlari" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xl p-6 sm:p-8 lg:p-10 border border-orange-500/40">
          {/* Subtle Glow & Background Accents */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-200 text-xs font-black border border-white/25 shadow-xs">
                <Flame className="w-4 h-4 text-yellow-300 animate-pulse fill-yellow-300" />
                <span>FLAŞ İNDİRİM GÜNLERİ BAŞLADI</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                Tahtakale&apos;den En Çok Satanlar <br className="hidden sm:inline" />
                <span className="text-yellow-300">Özel Kampanya Fiyatıyla!</span>
              </h2>

              <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto lg:mx-0 font-medium">
                Doğal taşlar, marifet kalemlikler, tütsülük ve hediyelik ürünlerde doğrudan Eminönü toptan fiyat avantajı. 1500 TL üzeri DHL Kargo ücretsiz!
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/kategori/tum-urunler"
                  className="px-6 py-3 bg-white hover:bg-yellow-50 text-orange-700 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Fırsatları Yakala</span>
                </Link>

                <Link
                  href="/toptan-satis"
                  className="px-6 py-3 bg-orange-800/80 hover:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 backdrop-blur-xs transition"
                >
                  Tahtakale Toptan Talep
                </Link>
              </div>
            </div>

            {/* Right: Live Countdown Timer Box */}
            <div className="w-full lg:w-auto bg-stone-950/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl text-center shrink-0">
              <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-orange-300 uppercase tracking-widest mb-3">
                <Clock className="w-4 h-4 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Günün Fırsatı Kalan Süre</span>
              </div>

              {/* Digits Block */}
              <div className="flex items-center justify-center gap-2 text-white">
                <div className="flex flex-col items-center">
                  <span className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-inner">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold uppercase mt-1">Saat</span>
                </div>

                <span className="text-2xl font-black text-orange-400 -mt-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-inner">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold uppercase mt-1">Dakika</span>
                </div>

                <span className="text-2xl font-black text-orange-400 -mt-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-orange-600 border border-orange-400 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-inner text-yellow-200">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-orange-200 font-bold uppercase mt-1">Saniye</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/15 text-[11px] text-orange-200 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sipariş anında stok güvencesi</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. TRENDYOL STYLE "POPÜLER ÜRÜNLER" CAROUSEL / GRID           */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                  Popüler Ürünler
                </h2>
                <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                  En çok incelenen ve sepete eklenen trend modeller
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
          {displayProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">Ürünler Yükleniyor</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tahtakale kataloğundaki en yeni ürünler listeleniyor...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayProducts.slice(0, 8).map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. İNDİRİM ORANLARINA GÖRE AVANTAJLARI KEŞFET (%5, %10, %30..) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                İndirim Oranlarına Göre Avantajları Keşfet
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Bütçenize en uygun indirim kategorisini seçin, tasarruf edin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {DISCOUNT_TIERS.map((tier) => (
              <Link
                key={tier.id}
                href={tier.href}
                className={`group relative rounded-3xl overflow-hidden p-4 sm:p-6 border ${tier.borderClass} ${tier.bgClass} shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] sm:min-h-[190px]`}
              >
                {/* Visual Thumbnail */}
                <div className="absolute right-2 bottom-2 w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 shadow-sm border border-white/60">
                  <Image
                    src={tier.image}
                    alt={tier.subLabel}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-stone-700 border border-white shadow-2xs">
                    {tier.tag}
                  </span>

                  <div className="mt-2">
                    <span className={`text-3xl sm:text-5xl font-black tracking-tight ${tier.textClass} leading-none block`}>
                      {tier.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 mt-1 block">
                      {tier.subLabel}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 mt-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-xs ${tier.btnClass} transition-transform group-hover:scale-105`}>
                    <span>Keşfet</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. KATEGORİLERDEKİ İNDİRİMLERİ KEŞFET (KARE PASTEL VİTRİN)   */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                Kategorilerdeki İndirimleri Keşfet
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Trend koleksiyonlar ve Tahtakale Eminönü özel fiyatları
              </p>
            </div>
            <Link
              href="/kategori/tum-urunler"
              className="text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>Katalog</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEATURED_CATEGORY_TILES.map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/80 bg-stone-50 hover:bg-white hover:border-orange-300 p-3 flex flex-col items-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Red Discount Badge at Top Right */}
                <span className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] sm:text-[9px] font-black shadow-xs tracking-tight">
                  {cat.discountBadge}
                </span>

                {/* Circular / Square Visual */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white shadow-2xs border border-stone-200/70 my-2 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <h3 className="text-xs font-black text-stone-900 group-hover:text-orange-600 transition-colors mt-1 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. KUPON & İNDİRİM BANDI ("OTANTIKOS50")                       */}
      {/* ============================================================ */}
      <section id="kupon-al" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <Gift className="w-7 h-7 text-yellow-200" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-yellow-200 bg-black/20 px-2 py-0.5 rounded-full">
                İlk Siparişe Özel
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                50 TL Anında Sepet İndirimi
              </h3>
              <p className="text-xs text-orange-100 mt-0.5">
                Ödeme aşamasında kupon alanına <span className="font-mono font-black text-white bg-black/25 px-1.5 py-0.5 rounded">OTANTIKOS50</span> kodunu girin!
              </p>
            </div>
          </div>

          <Link
            href="/kategori/tum-urunler"
            className="px-6 py-3 bg-white hover:bg-yellow-50 text-orange-700 font-black text-xs sm:text-sm rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            Alışverişe Başla
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. TAHTAKALE EMİNÖNÜ & DHL GÜVEN ŞERİDİ                       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">DHL Kargo Güvencesi</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                1500 TL üzeri ücretsiz kargo, sigortalı ve korumalı ambalaj.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Tahtakale Mağaza Teslim</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Eminönü şubemizden siparişinizi kargo bedelsiz elden teslim alın.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">iyzico 3D Güvenli Ödeme</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                256-Bit SSL şifreleme ve BDDK lisanslı korumalı Sanal POS.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">WhatsApp Canlı Destek</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Toptan talepler ve anlık sorularınız için birebir müşteri hattı.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. TAHTAKALE EMİNÖNÜ HERITAGE & WHOLESALE BANNER             */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl border border-stone-800">
          
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
