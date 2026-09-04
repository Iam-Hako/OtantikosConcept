'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SlidersHorizontal, 
  Heart, 
  ShoppingBag, 
  Star, 
  Check, 
  Sparkles, 
  Search,
  X
} from 'lucide-react';
import { Product, Category } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { formatPrice } from '@/lib/utils/format';

function CategoryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const urlSearch = searchParams?.get('ara') || '';

  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const maxAvailablePrice = useMemo(() => {
    if (allProducts.length === 0) return 5000;
    return Math.max(...allProducts.map((p) => Number(p.price) || 0), 1000);
  }, [allProducts]);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          DataService.getPublicProducts(),
          DataService.getCategories(),
        ]);
        setAllProducts(prodList);
        setCategories(catList);

        if (prodList.length > 0) {
          const highestPrice = Math.max(...prodList.map((p) => Number(p.price) || 0), 1000);
          setMaxPrice(highestPrice);
        }

        if (slug && slug !== 'tum-urunler') {
          const found = catList.find((c) => c.slug === slug || normalizeTurkish(c.name) === normalizeTurkish(slug));
          setCurrentCategory(found || null);
        } else {
          setCurrentCategory(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Category filter
    if (slug && slug !== 'tum-urunler') {
      list = list.filter((p) => 
        p.category?.slug === slug || 
        p.category_id === currentCategory?.id ||
        (p.category?.name && currentCategory?.name && normalizeTurkish(p.category.name) === normalizeTurkish(currentCategory.name))
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = normalizeTurkish(searchQuery);
      list = list.filter((p) => 
        normalizeTurkish(p.name).includes(q) || 
        normalizeTurkish(p.sku || '').includes(q) ||
        (p.category?.name && normalizeTurkish(p.category.name).includes(q))
      );
    }

    // In-stock filter
    if (onlyInStock) {
      list = list.filter((p) => p.stock > 0);
    }

    // Price filter
    list = list.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [allProducts, slug, currentCategory, searchQuery, onlyInStock, maxPrice, sortBy]);

  const pageTitle = currentCategory ? currentCategory.name : (searchQuery ? `"${searchQuery}" Arama Sonuçları` : 'Tüm Tahtakale Koleksiyonu');
  const pageDesc = currentCategory ? currentCategory.description : 'Eminönü Tahtakale atölyelerinden ve doğrudan ithalatçılardan en özel parçalar.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. BREADCRUMBS & TITLE */}
      <div className="border-b border-stone-200 pb-6">
        <nav className="text-xs text-stone-500 flex items-center gap-1.5 mb-2">
          <Link href="/" className="hover:text-amber-700">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/kategori/tum-urunler" className="hover:text-amber-700">Kategoriler</Link>
          {currentCategory && (
            <>
              <span>/</span>
              <span className="text-stone-900 font-semibold">{currentCategory.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              {pageDesc}
            </p>
          </div>
          <div className="text-xs text-stone-500 font-semibold">
            Toplam <strong className="text-stone-900">{filteredProducts.length}</strong> ürün listeleniyor
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: FILTERS SIDEBAR + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between gap-2">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtreleri Göster</span>
          </button>
        </div>

        {/* Filters Sidebar */}
        <aside className={`lg:block ${isMobileFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} space-y-6 lg:bg-white lg:p-6 lg:rounded-2xl lg:border lg:border-stone-200`}>
          
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 lg:hidden">
              <h3 className="font-bold text-sm text-stone-900">Filtreleme Seçenekleri</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 border-l-2 border-amber-600 pl-2">
              Kategoriler
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/kategori/tum-urunler"
                  className={`block py-1 px-2 rounded-lg transition ${
                    !currentCategory ? 'bg-amber-100/80 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Tüm Ürünler ({allProducts.length})
                </Link>
              </li>
              {categories.map((c) => {
                const count = allProducts.filter((p) => p.category?.slug === c.slug || p.category_id === c.id).length;
                const active = currentCategory?.slug === c.slug;

                return (
                  <li key={c.id}>
                    <Link
                      href={`/kategori/${c.slug}`}
                      className={`flex items-center justify-between py-1 px-2 rounded-lg transition ${
                        active ? 'bg-amber-100/80 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-stone-400">({count})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Search Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 border-l-2 border-amber-600 pl-2">
              Koleksiyonda Ara
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Koleksiyonda ara..."
                className="w-full text-xs py-2 pl-8 pr-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-l-2 border-amber-600 pl-2">
                Maksimum Fiyat
              </h3>
              <span className="text-xs font-bold text-amber-700">
                {formatPrice(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxAvailablePrice}
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₺0</span>
              <span>{formatPrice(maxAvailablePrice)}</span>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-stone-800">
                Yalnızca Stokta Olanlar
              </span>
            </label>
          </div>

          {isMobileFilterOpen && (
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-amber-600 text-white font-bold text-xs rounded-xl mt-4"
            >
              Filtreleri Uygula ({filteredProducts.length} Ürün)
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting Header */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600">
              Sıralama ve görünüm seçenekleri:
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-400 shrink-0">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="featured">Öne Çıkanlar</option>
                <option value="newest">En Yeni Eklenenler</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="rating">En Yüksek Puanlılar</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-900">Aradığınız kriterlere uygun ürün bulunamadı</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Filtreleri sıfırlayarak veya farklı bir anahtar kelime aratarak tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOnlyInStock(false);
                  setMaxPrice(1500);
                }}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} />
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Koleksiyon yükleniyor...</div>}>
      <CategoryContent />
    </Suspense>
  );
}


