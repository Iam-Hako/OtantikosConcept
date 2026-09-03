'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  ChevronRight, 
  Flame,
  Truck,
  Store,
  ShieldCheck,
  MessageCircle,
  Gem,
  Award
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const featuredProducts = products.filter((p) => p.is_featured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION (LUMINOUS, CHIC, BOUTIQUE ATMOSPHERE) */}
      <section className="relative bg-gradient-to-b from-[#faf6f0] via-[#f7f2ea] to-stone-50 border-b border-stone-200/60 overflow-hidden">
        {/* Subtle Ambient Glow Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-stone-200/35 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-amber-900/10 shadow-2xs text-xs font-bold text-amber-900 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>Eminönü Tahtakale • Doğrudan Satış & Toptan Merkezi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.15] text-stone-900">
              Otantikos Concept&apos;e Hoş Geldiniz
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Hediyelik Eşyalar toptan ve perakende satış
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href="/kategori/tum-urunler"
                className="w-full sm:w-auto px-8 py-4 bg-stone-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/toptan-satis"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 font-bold text-xs sm:text-sm rounded-2xl shadow-2xs transition-all text-center"
              >
                Tahtakale Toptan Talebi
              </Link>
            </div>

            {/* True Core Value Pillars (No Fake Claims) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-stone-200/70 text-center lg:text-left">
              <div>
                <div className="text-base sm:text-xl font-black text-stone-900">Özgün Konsept</div>
                <div className="text-[11px] text-stone-500 font-medium mt-0.5">Hediyelik & Trend Ürünler</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-black text-stone-900">DHL Kargo</div>
                <div className="text-[11px] text-stone-500 font-medium mt-0.5">Sigortalı Hızlı Sevkiyat</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-black text-stone-900">%100 Net</div>
                <div className="text-[11px] text-stone-500 font-medium mt-0.5">Şeffaf Liste Fiyatı</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 aspect-4/3 sm:aspect-5/4 group">
              <Image
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80"
                alt="Otantikos Özel Koleksiyon"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">Tahtakale Vitrini</span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
                  Özgün Tasarım & Yüksek Zanaat
                </h3>
                <p className="text-xs text-stone-200 mt-1">
                  Süleymaniye Uzunçarşı Caddesi mağazamızdan tüm Türkiye&apos;ye doğrudan teslimat.
                </p>
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                  <Link
                    href="/kategori/tum-urunler"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition"
                  >
                    <span>Tüm Ürünleri İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] text-stone-300 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    Eminönü / İstanbul
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP (TRUST & SERVICE EXCELLENCE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4 hover:border-amber-600/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Hızlı Sevkiyat & DHL</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Siparişleriniz güvenli ve korumalı paketleme ile 1-3 iş gününde kargoya verilir.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4 hover:border-amber-600/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Mağazadan Elden Teslim</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Tahtakale Eminönü fiziki şubemizden kargo bedelsiz elden teslim alabilirsiniz.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4 hover:border-amber-600/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Net & Şeffaf Fiyat</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Yanıltıcı sahte indirimler yok; perakende ve toptanda doğrudan net liste fiyatları.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4 hover:border-amber-600/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">WhatsApp Canlı Destek</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Toptan alımlar ve özel siparişleriniz için WhatsApp hattımızdan doğrudan iletişim.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES SHOWCASE (CHIC & REFINED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Koleksiyonlar</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Özgün Konsept Kategorileri
            </h2>
          </div>
          <Link
            href="/kategori/tum-urunler"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
          >
            <span>Tüm Kategorileri İncele</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
            <p className="text-xs text-stone-500 font-medium">Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden border border-stone-200/80 bg-gradient-to-br from-white via-stone-50 to-[#faf5ee] p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100/70 border border-amber-200/60 px-2.5 py-1 rounded-full inline-block mb-3">
                    Kategori
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1.5">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-stone-700 group-hover:text-amber-800 transition-colors">
                  <span>Ürünleri Gör</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. FEATURED PRODUCTS (HAFTANIN ÖNE ÇIKANLARI) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
              <Flame className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Haftanın Vitrini</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-0.5">
                Öne Çıkan Tahtakale Ürünleri
              </h2>
            </div>
          </div>
          <Link
            href="/kategori/tum-urunler"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 group"
          >
            <span>Kataloğun Tamamı</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
            <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">Henüz ürün eklenmedi</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Katalogda yeni ürünler yayına alındığında burada otomatik olarak listelenecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </section>

      {/* 5. TAHTAKALE EMİNÖNÜ HERITAGE & TRANSPARENCY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-stone-800">
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Eminönü Tahtakale Ticaret Geleneği</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
              Toptan ve Perakendede <br />
              <span className="text-amber-400">Şeffaf ve Dürüst Fiyat Politikası</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Yıllardır Tahtakale&apos;nin tarihi ticaret sokaklarında şekillenen iş ahlakımızla; yapay indirim oyunları veya şişirilip indirilen fiyatlar yerine doğrudan net ve adil fiyatlandırma sunuyoruz. İster DHL Kargo ile kapınıza gelsin, ister Eminönü şubemizden elden teslim alın.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/toptan-satis"
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
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
