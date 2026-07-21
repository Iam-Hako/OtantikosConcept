"use client";

import React, { useState, useMemo, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_MAP: Record<string, string> = {
  "bijuteri-taki": "bijuteri-taki",
  "hediyelik-esya": "hediyelik-esya",
  "trend-oyuncak-squishy": "trend-oyuncak-squishy",
  "squishy": "trend-oyuncak-squishy",
};

const CATEGORY_LABELS: Record<string, string> = {
  "bijuteri-taki": "Bijuteri & Takı",
  "hediyelik-esya": "Hediyelik Eşya & Aksesuar",
  "trend-oyuncak-squishy": "Trend Oyuncak & Squishy",
};

function ProductsPageInner() {
  const { products, isAdmin, siteTexts, settings } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";

  // Kategori slug'ını URL'den belirle
  const categorySlugFromUrl = useMemo(() => {
    const match = pathname?.match(/\/kategori\/(.+)/);
    if (match) {
      const rawSlug = match[1];
      return CATEGORY_MAP[rawSlug] || rawSlug;
    }
    return null;
  }, [pathname]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Aktif kategori: URL'den gelen veya manual seçim
  const activeCategory = categorySlugFromUrl || (selectedCategory !== "all" ? selectedCategory : null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Kategori filtresi
      if (activeCategory && p.categorySlug !== activeCategory) return false;
      // Arama filtresi
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const pageTitle = categorySlugFromUrl
    ? CATEGORY_LABELS[categorySlugFromUrl] || "Ürünler"
    : searchQuery
      ? `"${searchQuery}" arama sonuçları`
      : (siteTexts?.catalogPage?.title || "Tüm Ürünlerimiz");

  const allCategories = settings.categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-page-in">
      
      {/* Sayfa Başlığı */}
      <div className="mb-8 text-center md:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28]">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6354] mt-1.5">
            {filteredProducts.length} {siteTexts?.catalogPage?.foundCountSuffix || "ürün listelendi"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Kategori Butonları */}
          {!categorySlugFromUrl && (
            <>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 btn-press ${
                  selectedCategory === "all" ? "bg-[#3E2E28] text-white shadow-sm" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
                }`}
              >
                Tümü
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 btn-press ${
                    selectedCategory === cat.slug ? "bg-[#3E2E28] text-white shadow-sm" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition flex items-center gap-2 btn-press shadow-md"
            >
              <Plus className="w-4 h-4" /> Ürün Ekle
            </Link>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-float-up"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm animate-scale-in">
          <div className="w-16 h-16 bg-[#F8F5F0] text-[#C86D51] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3E2E28]">
            {siteTexts?.productsSection?.emptyCatalogTitle || "Yakında Yeni Ürünlerimizle Buradayız!"}
          </h3>
          <p className="text-xs sm:text-sm text-[#7C6354] leading-relaxed">
            {siteTexts?.productsSection?.emptyCatalogDesc || "Koleksiyonumuz hazırlanıyor."}
          </p>
          {categorySlugFromUrl && (
            <Link
              href="/urunler"
              className="px-6 py-3 bg-[#3E2E28] text-white text-xs font-semibold rounded-full hover:bg-[#C86D51] transition inline-block shadow-md mt-2 btn-press"
            >
              Tüm Ürünlere Dön
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition inline-flex items-center gap-2 shadow-md mt-2 btn-press"
            >
              <Plus className="w-4 h-4" /> Ürün Ekle
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-shimmer h-8 w-48 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-shimmer aspect-square rounded-2xl"></div>
          ))}
        </div>
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}
