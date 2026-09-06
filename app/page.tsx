'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  FileText,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
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

// 3 Rich, Vibrant Hero Showcase Slides (Trendyol Style)
const HERO_SLIDES = [
  {
    id: 'slide-kirtasiye',
    badge: '✨ 2026 Tasarım Koleksiyonu',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    title: 'İlham Veren Kırtasiye & Masaüstü Tasarımları',
    description: 'Özel tasarım defterler, yaratıcı yazı gereçleri ve masanıza şıklık katan benzersiz masaüstü aksesuarlar.',
    gradient: 'from-slate-950 via-indigo-950 to-blue-950',
    glowColor: 'bg-indigo-500/25',
    accentBorder: 'border-indigo-500/30',
    primaryBtn: { text: 'Kırtasiye Koleksiyonunu İncele', href: '/kategori/k-rtasiye-r-nleri' },
    secondaryBtn: { text: 'Tüm Vitrin', href: '/kategori/tum-urunler' },
    tags: ['📚 Özel Defterler', '✍️ Tasarım Kalemler', '🎁 Masaüstü Aksesuar'],
    icon: Tag,
    illustrationGradient: 'from-blue-500 via-indigo-500 to-cyan-400',
  },
  {
    id: 'slide-taki',
    badge: '💎 Seçkin El İşçiliği & Enerji',
    badgeClass: 'bg-pink-500/20 text-pink-200 border-pink-400/40',
    title: 'Doğal Taşların Enerjisi & Özgün Takı Vitrini',
    description: 'Ametist, Akik, Kuvars ve el işçiliği zarafetini yansıtan özgün kolye, bileklik ve doğal taşlar.',
    gradient: 'from-slate-950 via-purple-950 to-rose-950',
    glowColor: 'bg-purple-500/25',
    accentBorder: 'border-purple-500/30',
    primaryBtn: { text: 'Takı & Taş Vitrinini Gör', href: '/kategori/tum-urunler' },
    secondaryBtn: { text: 'WhatsApp Canlı Danışma', href: 'https://wa.me/905077737777', isExternal: true },
    tags: ['🔮 %100 Doğal Taşlar', '📿 El Yapımı Takı', '✨ Pozitif Enerji'],
    icon: Gem,
    illustrationGradient: 'from-purple-500 via-pink-500 to-rose-400',
  },
  {
    id: 'slide-toptan',
    badge: '📦 Tarihi Tahtakale Ticaret Geleneği',
    badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    title: 'Tahtakale Toptan Alım & Kurumsal Satış Avantajı',
    description: 'İşletmeler, butik mağazalar ve kurumsal hediyelik siparişleriniz için doğrudan Tahtakale net toptan fiyat teklifi.',
    gradient: 'from-stone-950 via-amber-950 to-orange-950',
    glowColor: 'bg-amber-500/25',
    accentBorder: 'border-amber-500/30',
    primaryBtn: { text: 'Tahtakale Toptan Teklif Al', href: '/toptan-satis' },
    secondaryBtn: { text: 'Eminönü Şubemiz & Konum', href: '/iletisim' },
    tags: ['🏢 Kurumsal Fatura', '📦 Güvenli Toplu Koli', '⚡ Hızlı Sevkiyat'],
    icon: Package,
    illustrationGradient: 'from-amber-500 via-orange-500 to-red-400',
  },
];

// 3-Card Vibrant Campaign Tiles (Trendyol Style)
const PROMO_CARDS = [
  {
    id: 'promo-kirtasiye',
    title: 'Kırtasiye & Defter Dünyası',
    subtitle: 'Yaratıcı masaüstü gereçleri ve tasarım serisi',
    tag: 'Popüler Kategori',
    tagBg: 'bg-blue-500/30 text-blue-200 border border-blue-400/30',
    href: '/kategori/k-rtasiye-r-nleri',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-700',
    icon: Tag,
  },
  {
    id: 'promo-dogal-tas',
    title: 'Doğal Taş & Zarafet Takıları',
    subtitle: 'Doğanın eşsiz enerjisi el işçiliğiyle buluştu',
    tag: 'Özel Vitrin',
    tagBg: 'bg-purple-500/30 text-purple-200 border border-purple-400/30',
    href: '/kategori/tum-urunler',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    icon: Gem,
  },
  {
    id: 'promo-toptan',
    title: 'Tahtakale Toptan Avantajı',
    subtitle: 'Toplu alımlar ve kurumsal siparişler için net fiyat',
    tag: 'Toptan & Kurumsal',
    tagBg: 'bg-amber-500/30 text-amber-200 border border-amber-400/30',
    href: '/toptan-satis',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    icon: Package,
  },
];

// Color palette styles for category discovery cards
const CATEGORY_PALETTES = [
  {
    bg: 'from-blue-50 via-indigo-50/60 to-cyan-50/40',
    border: 'hover:border-blue-300 hover:shadow-blue-500/10',
    badge: 'bg-blue-100/90 text-blue-800 border-blue-200',
    linkHover: 'group-hover:text-blue-600',
    arrowColor: 'text-blue-500',
  },
  {
    bg: 'from-purple-50 via-pink-50/60 to-rose-50/40',
    border: 'hover:border-purple-300 hover:shadow-purple-500/10',
    badge: 'bg-purple-100/90 text-purple-800 border-purple-200',
    linkHover: 'group-hover:text-purple-600',
    arrowColor: 'text-purple-500',
  },
  {
    bg: 'from-amber-50 via-orange-50/60 to-yellow-50/40',
    border: 'hover:border-amber-300 hover:shadow-amber-500/10',
    badge: 'bg-amber-100/90 text-amber-900 border-amber-200',
    linkHover: 'group-hover:text-amber-700',
    arrowColor: 'text-amber-600',
  },
  {
    bg: 'from-emerald-50 via-teal-50/60 to-green-50/40',
    border: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
    linkHover: 'group-hover:text-emerald-600',
    arrowColor: 'text-emerald-500',
  },
  {
    bg: 'from-rose-50 via-red-50/60 to-pink-50/40',
    border: 'hover:border-rose-300 hover:shadow-rose-500/10',
    badge: 'bg-rose-100/90 text-rose-800 border-rose-200',
    linkHover: 'group-hover:text-rose-600',
    arrowColor: 'text-rose-500',
  },
  {
    bg: 'from-sky-50 via-cyan-50/60 to-blue-50/40',
    border: 'hover:border-sky-300 hover:shadow-sky-500/10',
    badge: 'bg-sky-100/90 text-sky-800 border-sky-200',
    linkHover: 'group-hover:text-sky-600',
    arrowColor: 'text-sky-500',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Interactive Product Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'kirtasiye' | 'taki' | 'wholesale'>('all');

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

  // Auto-advance hero carousel every 5.5 seconds (paused on hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      const amount = direction === 'left' ? -250 : 250;
      storiesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Product tab counts
  const featuredCount = products.filter((p) => p.is_featured).length;
  const wholesaleCount = products.filter((p) => Boolean(p.wholesale_price && p.wholesale_price > 0)).length;
  const kirtasiyeCount = products.filter((p) => {
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    return text.includes('kırtasiye') || text.includes('kirtasiye') || text.includes('defter') || text.includes('kalem') || text.includes('notluk');
  }).length;
  const takiCount = products.filter((p) => {
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    return text.includes('taş') || text.includes('tas') || text.includes('kolye') || text.includes('bileklik') || text.includes('ametist') || text.includes('akik') || text.includes('kuvars');
  }).length;

  // Filtered products based on active tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'featured') return p.is_featured;
    if (activeTab === 'kirtasiye') {
      const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
      return text.includes('kırtasiye') || text.includes('kirtasiye') || text.includes('defter') || text.includes('kalem') || text.includes('notluk');
    }
    if (activeTab === 'taki') {
      const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
      return text.includes('taş') || text.includes('tas') || text.includes('kolye') || text.includes('bileklik') || text.includes('ametist') || text.includes('akik') || text.includes('kuvars');
    }
    if (activeTab === 'wholesale') return Boolean(p.wholesale_price && p.wholesale_price > 0);
    return true; // 'all'
  });

  const displayProducts = filteredProducts.length > 0 
    ? filteredProducts 
    : (products.filter(p => p.is_featured).length > 0 ? products.filter(p => p.is_featured) : products);

  const activeSlideData = HERO_SLIDES[currentSlide];
  const ActiveSlideIcon = activeSlideData.icon;

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 bg-stone-50/60">
      
      {/* ============================================================ */}
      {/* 1. CANLI MAĞAZA & SEVKİYAT BİLGİ ŞERİDİ (LIVE STATUS TICKER) */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 text-white py-2.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-extrabold uppercase tracking-wide text-[10px] sm:text-xs">
              Eminönü Şube Canlı Durum:
            </span>
            <span className="text-stone-200 text-[11px] sm:text-xs">
              Tahtakale Mağazamız Açık (10:00 - 17:00) • Elden Teslim Alabilirsiniz
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-stone-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Truck className="w-3.5 h-3.5" />
              1-3 İş Gününde DHL ile Hızlı Sevkiyat
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1.5 text-orange-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Şeffaf Fiyat & Güvenli Ödeme
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TRENDYOL STYLE CIRCULAR STORIES / QUICK ACTION BUBBLES    */}
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
                  <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${item.ringGradient} shadow-xs group-hover/story:scale-105 transition-transform duration-300`}>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${item.bgGradient} flex items-center justify-center border-2 border-white shadow-inner`}>
                      <IconComp className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor} group-hover/story:rotate-6 transition-transform`} />
                    </div>
                  </div>

                  {/* Title */}
                  <span className="text-[11px] sm:text-xs font-bold text-stone-800 text-center line-clamp-1 max-w-[82px] group-hover/story:text-orange-600 transition-colors">
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
      {/* 3. DYNAMIC HERO VITRİN CAROUSEL (TRENDYOL STYLE)             */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 transition-all duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Slide Card */}
          <div className={`relative bg-gradient-to-r ${activeSlideData.gradient} text-white p-6 sm:p-10 lg:p-14 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between overflow-hidden`}>
            
            {/* Ambient Background Glow Effect */}
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full ${activeSlideData.glowColor} blur-3xl pointer-events-none -mr-20 -mt-20`} />
            <div className={`absolute bottom-0 left-1/3 w-80 h-80 rounded-full ${activeSlideData.glowColor} blur-3xl pointer-events-none -mb-20`} />

            {/* Slide Content */}
            <div className="relative z-10 max-w-2xl space-y-4">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${activeSlideData.badgeClass}`}>
                  {activeSlideData.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight drop-shadow-sm">
                {activeSlideData.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm lg:text-base text-stone-200 font-normal leading-relaxed max-w-xl">
                {activeSlideData.description}
              </p>

              {/* Feature Pill Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeSlideData.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-semibold text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={activeSlideData.primaryBtn.href}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-98 transition flex items-center gap-2 group cursor-pointer"
                >
                  <span>{activeSlideData.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {activeSlideData.secondaryBtn.isExternal ? (
                  <a
                    href={activeSlideData.secondaryBtn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{activeSlideData.secondaryBtn.text}</span>
                  </a>
                ) : (
                  <Link
                    href={activeSlideData.secondaryBtn.href}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition flex items-center gap-1.5"
                  >
                    <span>{activeSlideData.secondaryBtn.text}</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Right Side Visual Graphic Element (Desktop only) */}
            <div className="hidden lg:flex absolute right-12 bottom-8 top-8 items-center justify-center z-10 pointer-events-none">
              <div className={`w-64 h-64 rounded-3xl bg-gradient-to-tr ${activeSlideData.illustrationGradient} p-1 shadow-2xl rotate-3 opacity-90 transition-transform duration-700 group-hover:rotate-6`}>
                <div className="w-full h-full rounded-[22px] bg-stone-950/80 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                    <ActiveSlideIcon className="w-8 h-8 text-amber-300" />
                  </div>
                  <div className="text-sm font-black text-white tracking-wide">
                    Otantikos Concept
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">
                    Eminönü Tahtakale Doğrudan Sevkiyat
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
              aria-label="Önceki Slayt"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Sonraki Slayt"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Indicators (Dots with active pill expansion) */}
            <div className="relative z-10 pt-6 flex items-center justify-center gap-2">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slayt ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === index 
                      ? 'w-8 bg-orange-500 shadow-sm' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. 3-CARD VIBRANT CAMPAIGN TILES (TRENDYOL STYLE)             */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROMO_CARDS.map((card) => {
            const IconComp = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.gradient} text-white p-5 sm:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]`}
              >
                {/* Decorative background shape */}
                <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md ${card.tagBg}`}>
                      {card.tag}
                    </span>
                    <IconComp className="w-5 h-5 text-white/80 group-hover:rotate-12 transition-transform" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white/85 mt-1 line-clamp-2 leading-relaxed font-normal">
                    {card.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white/90 group-hover:text-white">
                  <span>Hemen İncele</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TRENDYOL STYLE "POPÜLER ÜRÜNLER" & INTERACTIVE TABS       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Vitrin & Popüler Modeller</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                    {displayProducts.length} Ürün
                  </span>
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Tahtakale Eminönü vitrinimizden özenle seçilmiş modeller
                </p>
              </div>
            </div>

            <Link
              href="/kategori/tum-urunler"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 group py-1"
            >
              <span>Kataloğun Tümünü Gör</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Filter Tabs (Lively & Dynamic) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tümü</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-700'}`}>
                {products.length}
              </span>
            </button>

            {featuredCount > 0 && (
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'featured'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                <span>Öne Çıkanlar</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'featured' ? 'bg-orange-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {featuredCount}
                </span>
              </button>
            )}

            {kirtasiyeCount > 0 && (
              <button
                onClick={() => setActiveTab('kirtasiye')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'kirtasiye'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-cyan-300" />
                <span>Kırtasiye & Defter</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'kirtasiye' ? 'bg-blue-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {kirtasiyeCount}
                </span>
              </button>
            )}

            {takiCount > 0 && (
              <button
                onClick={() => setActiveTab('taki')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'taki'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <Gem className="w-3.5 h-3.5 text-pink-300" />
                <span>Doğal Taş & Takı</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'taki' ? 'bg-purple-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {takiCount}
                </span>
              </button>
            )}

            {wholesaleCount > 0 && (
              <button
                onClick={() => setActiveTab('wholesale')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'wholesale'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-300" />
                <span>Toptan Avantajlı</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'wholesale' ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {wholesaleCount}
                </span>
              </button>
            )}
          </div>

          {/* Products Grid */}
          {displayProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">Katalog Yükleniyor</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ürünler hazırlanıyor...
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
      {/* 6. KATEGORİLERİ KEŞFET (CANLI & RENKLİ KARTLAR)              */}
      {/* ============================================================ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                  Kategorileri Keşfet
                </h2>
                <p className="text-[11px] text-stone-500 font-medium">
                  Tahtakale Eminönü vitrinimizden seçilmiş koleksiyonlar
                </p>
              </div>
              <Link
                href="/kategori/tum-urunler"
                className="text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
              >
                <span>Tüm Kategoriler</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat, idx) => {
                const palette = CATEGORY_PALETTES[idx % CATEGORY_PALETTES.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 bg-gradient-to-br ${palette.bg} ${palette.border} p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[125px]`}
                  >
                    <div>
                      <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full inline-block mb-2 border ${palette.badge}`}>
                        Kategori
                      </span>
                      <h3 className={`text-sm font-bold text-stone-900 ${palette.linkHover} transition-colors line-clamp-1`}>
                        {cat.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
                      <span>Ürünleri Gör</span>
                      <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${palette.arrowColor}`} />
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 7. CANLI SEVKİYAT VE SİPARİŞ SÜRECİ (4 ADIMDA GÜVENCE)        */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-base sm:text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Otantikos Sipariş & Teslimat Güvencesi</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Eminönü Tahtakale şubemizden kapınıza kadar şeffaf ve güvenli süreç
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full w-fit">
              1-3 İş Gününde Kargo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3 hover:bg-white hover:border-orange-300 transition shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-black text-sm">
                1
              </div>
              <div>
                <h4 className="text-xs font-black text-stone-900">Anında Hazırlık</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  Siparişiniz sistemimize düştüğü anda Eminönü depomuzda raftan toplanır.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3 hover:bg-white hover:border-orange-300 transition shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black text-sm">
                2
              </div>
              <div>
                <h4 className="text-xs font-black text-stone-900">Korumalı Paket</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  Kırılma ve ezilmelere karşı hava yastıklı özel ambalajla paketlenir.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3 hover:bg-white hover:border-orange-300 transition shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm">
                3
              </div>
              <div>
                <h4 className="text-xs font-black text-stone-900">DHL Kargo Takip</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  1-3 iş gününde kargo takip kodunuz SMS ve e-posta ile cebinize gelir.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3 hover:bg-white hover:border-orange-300 transition shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black text-sm">
                4
              </div>
              <div>
                <h4 className="text-xs font-black text-stone-900">Kolay İade Güvencesi</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  Memnun kalmadığınızda profilinizden tek tıkla iade ve değişim imkanı.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. TAHTAKALE EMİNÖNÜ & DHL GÜVEN ŞERİDİ                       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Hızlı Sevkiyat & DHL</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Siparişleriniz güvenli ve korumalı paketleme ile 1-3 iş gününde kargoya verilir.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Mağazadan Elden Teslim</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Tahtakale Eminönü fiziki şubemizden kargo bedelsiz elden teslim alabilirsiniz.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-start gap-3.5 hover:border-orange-400 transition">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">Net & Şeffaf Fiyat</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Yanıltıcı sahte indirimler yok; perakende ve toptanda doğrudan net liste fiyatları.
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
                Toptan alımlar ve özel siparişleriniz için WhatsApp hattımızdan doğrudan iletişim.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. TAHTAKALE EMİNÖNÜ HERITAGE & WHOLESALE BANNER             */}
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
