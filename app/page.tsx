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
    href: '/kategori/kirtasiye-urunleri',
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      {/* 2. VIBRANT TAHTAKALE EMİNÖNÜ VITRINE HERO BANNER             */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xl p-6 sm:p-10 lg:p-12 border border-orange-500/40">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-200 text-xs font-black border border-white/25 shadow-xs">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Eminönü Tahtakale Doğrudan Satış & Toptan Merkezi</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                Otantikos Concept&apos;e <br />
                <span className="text-yellow-300">Hoş Geldiniz</span>
              </h1>

              <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Hediyelik eşyalar, kırtasiye ürünleri, doğal taşlar ve konsept tasarımlar. Şeffaf net liste fiyatları ve Tahtakale şubemizden doğrudan sevkiyat.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/kategori/tum-urunler"
                  className="px-6 py-3.5 bg-white hover:bg-yellow-50 text-orange-700 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Koleksiyonu İncele</span>
                </Link>

                <Link
                  href="/toptan-satis"
                  className="px-6 py-3.5 bg-orange-800/80 hover:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 backdrop-blur-xs transition"
                >
                  Tahtakale Toptan Talep
                </Link>
              </div>
            </div>

            {/* Right Value Box */}
            <div className="w-full lg:w-80 bg-stone-950/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl space-y-4 shrink-0">
              <div className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Otantikos Güvencesi</span>
              </div>

              <div className="space-y-3 text-xs text-stone-200">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">DHL Kargo Gönderimi</span>
                    <span className="text-[11px] text-stone-300">Özel korumalı paketleme ile 1-3 iş gününde sevkiyat.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Store className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Tahtakale Elden Teslim</span>
                    <span className="text-[11px] text-stone-300">Süleymaniye Eminönü mağazamızdan ücretsiz teslimat.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Net & Şeffaf Fiyat</span>
                    <span className="text-[11px] text-stone-300">Şişirilmiş sahte indirimler yok; doğrudan gerçek liste fiyatları.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. TRENDYOL STYLE "POPÜLER ÜRÜNLER" VİTRİNİ                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
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
      {/* 4. KATEGORİLERİ KEŞFET (CANLI & RENKLİ KARTLAR)              */}
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
                  Tahtakale Eminönü koleksiyonları
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
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/80 bg-gradient-to-br from-stone-50 to-orange-50/40 hover:bg-white hover:border-orange-300 p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[120px]"
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full inline-block mb-2">
                      Kategori
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-stone-600 group-hover:text-orange-600 transition-colors">
                    <span>Ürünleri Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-orange-500" />
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. TAHTAKALE EMİNÖNÜ & DHL GÜVEN ŞERİDİ                       */}
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
      {/* 6. TAHTAKALE EMİNÖNÜ HERITAGE & WHOLESALE BANNER             */}
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
