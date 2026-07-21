"use client";

import React, { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/mockData";
import { Filter, SlidersHorizontal, Plus } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const [products] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Sayfa Başlığı */}
      <div className="mb-8 text-center md:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28]">
            Ürün Kataloğu
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6354] mt-1">
            Mağazanızda listelenen ürünler aşağıda görüntülenir.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Ürün Ekle
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] p-12 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#F8F5F0] text-[#C86D51] rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#3E2E28]">Henüz Ürün Eklenmedi</h3>
          <p className="text-xs text-[#7C6354]">
            Mağazanıza ilk ürününüzü eklemek için Yönetici Paneli'ni (`/admin`) kullanabilirsiniz. Eklediğiniz tüm ürünler anında burada ve ana sayfada listelenecektir.
          </p>
          <Link
            href="/admin"
            className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition inline-block"
          >
            Yönetici Paneline Git ve Ürün Ekle
          </Link>
        </div>
      )}
    </div>
  );
}
