"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check } from "lucide-react";
import { Product } from "@/data/mockData";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E6DCD3] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Ürün Görseli & Etiketler */}
        <Link href={`/urun/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F8F5F0]">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* İndirim / Öne Çıkan Etiketi */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.compareAtPrice && (
              <span className="bg-[#C86D51] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                %{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)} İndirim
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#3E2E28] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                Çok Satan
              </span>
            )}
          </div>

          {/* Favori Butonu */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#7C6354] hover:text-[#C86D51] hover:bg-white transition shadow-sm z-10"
            aria-label="Favorilere ekle"
          >
            <Heart className="w-4 h-4" />
          </button>
        </Link>

        {/* Ürün Detayları */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-[#7C6354] mb-1.5">
            <span className="uppercase font-semibold tracking-wider text-[10px] text-[#C86D51]">{product.category}</span>
            <div className="flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating} ({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/urun/${product.slug}`}>
            <h3 className="font-serif text-base font-bold text-[#3E2E28] group-hover:text-[#C86D51] transition line-clamp-2 mb-2">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-[#7C6354] line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Fiyat & Sepet Aksiyonu */}
      <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-[#F8F5F0] pt-4">
        <div>
          {product.compareAtPrice && (
            <span className="text-xs text-[#7C6354] line-through block -mb-1">
              {product.compareAtPrice.toFixed(2)} TL
            </span>
          )}
          <span className="text-lg font-bold text-[#3E2E28]">
            {product.price.toFixed(2)} <span className="text-xs font-normal">TL</span>
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-[#3E2E28] text-white hover:bg-[#C86D51]"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Eklendi
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Sepete Ekle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
