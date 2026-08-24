'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShoppingBag, 
  Star, 
  ChevronRight, 
  Flame
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { formatPrice } from '@/lib/utils/format';

export default function HomePage() {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          DataService.getProducts(),
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
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 lg:py-24 min-h-[calc(100dvh-5rem)] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12">
          {/* Left Hero Text */}
          <div className="flex-1 space-y-5 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.2] text-white">
              Otantikos Concept&apos;e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Hoş Geldiniz.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Hediyelik Eşyalar toptan ve perakende satış
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link
                href="/kategori/tum-urunler"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl hover:shadow-amber-600/30 transition flex items-center justify-center gap-2 group"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/toptan-satis"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition text-center"
              >
                Tahtakale Toptan Satış
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-white/10 text-center lg:text-left">
              <div>
                <div className="text-base sm:text-2xl font-black text-amber-400">Çin Mantısı</div>
                <div className="text-[10px] sm:text-xs text-stone-300 leading-tight">Squishy & Trend Ürünler</div>
              </div>
              <div>
                <div className="text-base sm:text-2xl font-black text-amber-400">Aynı Gün</div>
                <div className="text-[10px] sm:text-xs text-stone-300 leading-tight">Tahtakale Sevkiyatı</div>
              </div>
              <div>
                <div className="text-base sm:text-2xl font-black text-amber-400">%100 Net</div>
                <div className="text-[10px] sm:text-xs text-stone-300 leading-tight">Şeffaf Fiyat Politikası</div>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 aspect-4/3 sm:aspect-16/10">
              <Image
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80"
                alt="Otantikos Özel Koleksiyon"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Özel Seri</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Tahtakale Özgün Koleksiyonu
                </h3>
                <p className="text-xs text-stone-300 mt-1">Yüksek zanaat ve kaliteli malzeme garantisi.</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                  <Link
                    href="/kategori/tum-urunler"
                    className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition"
                  >
                    Koleksiyonu Gör ➔
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Koleksiyonlar</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Tahtakale Konsept Kategorileri
            </h2>
          </div>
          <Link
            href="/kategori/tum-urunler"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
          >
            <span>Tüm Kategorileri Gör</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500 font-medium">Henüz kategori bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 transition duration-300 flex flex-col justify-between p-6 min-h-[160px] text-white"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md inline-block mb-3">
                    Kategori
                  </span>
                  <h3 className="font-bold text-lg group-hover:text-amber-300 transition">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-stone-300 line-clamp-2 mt-1.5 opacity-90">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Ürünleri Keşfet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS (Vitrin Ürünleri) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Haftanın Vitrini</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-0.5">
                Öne Çıkan Tahtakale Ürünleri
              </h2>
            </div>
          </div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 space-y-2">
            <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">Henüz ürün eklenmedi</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Veritabanına ürün eklendiğinde burada listelenecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 3} />
            ))}
          </div>
        )}
      </section>

      {/* 4. TAHTAKALE EMİNÖNÜ HERITAGE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Eminönü Tahtakale Geleneği
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
              Toptan Fiyatına Perakende Kalite ve Şeffaf Ticaret
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Yıllardır Tahtakale'nin tarihi ticaret sokaklarında şekillenen iş ahlakımızla; yapay indirim kuponları, şişirilip indirilen fiyatlar yerine dürüst ve doğrudan net fiyatlandırma sunuyoruz. İster kargo ile kapınıza gelsin, ister Eminönü mağazamızdan ücretsiz teslim alın.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/toptan-satis"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tahtakale Toptan Teklif İste</span>
              </Link>
              <Link
                href="/hakkimizda"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition"
              >
                Hikayemizi Okuyun
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
