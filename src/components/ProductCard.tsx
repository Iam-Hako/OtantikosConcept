"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check } from "lucide-react";
import { Product } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { siteTexts } = useAuth();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E6DCD3] transition-all duration-300 flex flex-col justify-between card-hover">
      <div>
        {/* Ürün Görseli & Etiketler */}
        <Link href={`/urun/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F8F5F0]">
          <Image
            src={(product.images && product.images[0]) || product.image || "/otantikos-logo.png"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {product.images && product.images.length > 1 && (
            <Image
              src={product.images[1]}
              alt={`${product.title} ikincil görsel`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* İndirim / Öne Çıkan Etiketi */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.compareAtPrice && (
              <span className="bg-[#C86D51] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                %{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)} İndirim
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#3E2E28] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                {siteTexts?.productCard?.newBadge || "Çok Satan"}
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
        <div className="p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#7C6354] mb-1.5">
            <span className="uppercase font-semibold tracking-wider text-[9px] sm:text-[10px] text-[#C86D51] truncate max-w-[90px]">{product.category}</span>
            <div className="flex items-center gap-1 font-medium text-[10px] sm:text-xs">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <Link href={`/urun/${product.slug}`}>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#3E2E28] group-hover:text-[#C86D51] transition line-clamp-2 mb-1.5 leading-snug">
              {product.title}
            </h3>
          </Link>

          <p className="text-[11px] sm:text-xs text-[#7C6354] line-clamp-2 mb-3 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        </div>
      </div>

      {/* Fiyat & Sepet Aksiyonu */}
      <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-3 flex items-center justify-between border-t border-[#F8F5F0]">
        <div>
          {product.compareAtPrice && (
            <span className="text-[10px] sm:text-xs text-[#7C6354] line-through block -mb-0.5">
              {product.compareAtPrice.toFixed(2)} TL
            </span>
          )}
          <span className="text-sm sm:text-lg font-bold text-[#3E2E28]">
            {product.price.toFixed(2)} <span className="text-[10px] sm:text-xs font-normal">TL</span>
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 shadow-sm ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-[#3E2E28] text-white hover:bg-[#C86D51]"
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{siteTexts?.productCard?.inCart || "Eklendi"}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{siteTexts?.productCard?.addToCart || "Ekle"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
