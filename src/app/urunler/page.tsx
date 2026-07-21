"use client";

import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
  const { products, isAdmin, siteTexts } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.categorySlug !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Sayfa Başlığı */}
      <div className="mb-8 text-center md:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28]">
            {siteTexts?.catalogPage?.title || "Tüm Ürünlerimiz"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6354] mt-1">
            {siteTexts?.catalogPage?.subtitle || "Trend oyuncak, NeeDoh Squishy ve bijuteri tasarımlarımızı keşfedin."} ({filteredProducts.length} {siteTexts?.catalogPage?.foundCountSuffix || "ürün listelendi"}).
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {siteTexts?.productsSection?.emptyCatalogAdminAction || "+ Ürün Ekle"}
          </Link>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#F8F5F0] text-[#C86D51] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3E2E28]">
            {siteTexts?.productsSection?.emptyCatalogTitle || "Yakında Yeni Ürünlerimizle Buradayız!"}
          </h3>
          <p className="text-xs sm:text-sm text-[#7C6354] leading-relaxed">
            {siteTexts?.productsSection?.emptyCatalogDesc || "Koleksiyonumuz hazırlanıyor, çok yakında harika ürünlerimizle hizmetinizde olacağız."}
          </p>
          {isAdmin ? (
            <Link
              href="/admin"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition inline-flex items-center gap-2 shadow-md mt-2"
            >
              <Plus className="w-4 h-4" /> {siteTexts?.productsSection?.emptyCatalogAdminAction || "Yönetici Panelinden Ürün Ekle"}
            </Link>
          ) : (
            <Link
              href="/"
              className="px-6 py-3 bg-[#3E2E28] text-white text-xs font-semibold rounded-full hover:bg-[#C86D51] transition inline-block shadow-md mt-2"
            >
              Ana Sayfaya Dön
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
