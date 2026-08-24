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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Hero Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Eminönü Tahtakale Doğrudan İthalat & Üretim</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.15] text-white">
              Otantik Zanaat, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Modern Tasarımla
              </span> <br />
              Buluştu.
            </h1>

            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Hediyelik Eşyalar toptan ve perakende satış
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/kategori/tum-urunler"
                className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-amber-600/30 transition flex items-center justify-center gap-2 group"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/toptan-satis"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl backdrop-blur-xs transition text-center"
              >
                Tahtakale Toptan & B2B
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">316L</div>
                <div className="text-[11px] text-stone-400">Kararmaz Medikal Çelik</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">Aynı Gün</div>
                <div className="text-[11px] text-stone-400">Tahtakale Sevkiyatı</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">%100 Net</div>
                <div className="text-[11px] text-stone-400">Şeffaf Fiyat Politikası</div>
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
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 bg-white transition duration-300 flex flex-col h-72"
              >
                <div className="relative flex-1 overflow-hidden bg-stone-100">
                  {cat.image_url && (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-bold text-base group-hover:text-amber-300 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1 mt-1 opacity-90">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-amber-400 gap-1">
                    <span>Ürünleri Keşfet</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
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
            {displayProducts.map((product) => {
              const cover = product.images?.[0]?.image_url || '/images/logo.webp';
              const fav = isFavorite(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square bg-stone-100 overflow-hidden">
                    <Link href={`/urun/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={cover}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    </Link>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.is_new && (
                        <span className="bg-stone-900 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                          Yeni
                        </span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Son {product.stock} Adet!
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 hover:text-rose-600 flex items-center justify-center shadow-md transition"
                      aria-label="Favoriye Ekle"
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Product Information */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {product.category && (
                        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 mt-1 line-clamp-2 hover:text-amber-700 transition">
                        <Link href={`/urun/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h3>

                      {/* Ratings */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-500">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold ml-1 text-stone-800">{product.rating || 5.0}</span>
                        </div>
                        <span>•</span>
                        <span>({product.review_count || 0} Değerlendirme)</span>
                      </div>

                      {/* Variant indicator if any */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex items-center gap-1 mt-3">
                          <span className="text-[11px] text-stone-400">Varyantlar:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.variants.slice(0, 3).map((v) => (
                              <span key={v.id || v.value} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                                {v.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-stone-400">Net Fiyat:</div>
                        <div className="text-lg font-black text-amber-700">
                          {formatPrice(product.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => addItem(product, product.variants?.[0] || null)}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sepete Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                <span>Tahtakale Toptan & B2B Teklif İste</span>
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
