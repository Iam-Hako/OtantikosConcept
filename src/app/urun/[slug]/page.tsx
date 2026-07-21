"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  Heart,
  Share2,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug) || INITIAL_PRODUCTS[0];

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options.length > 0) initial[v.name] = v.options[0];
    });
    return initial;
  });
  const [added, setAdded] = useState(false);

  const handleAddToCart = (buyNow = false) => {
    const variantStr = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" / ");

    addToCart(product, quantity, variantStr || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    if (buyNow) {
      window.location.href = "/sepet";
    }
  };

  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Ekmek Kırıntısı (Breadcrumb) */}
      <nav className="flex items-center gap-2 text-xs text-[#7C6354]">
        <Link href="/" className="hover:text-[#C86D51]">Ana Sayfa</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/urunler" className="hover:text-[#C86D51]">Ürünler</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/kategori/${product.categorySlug}`} className="hover:text-[#C86D51]">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#3E2E28] font-semibold line-clamp-1">{product.title}</span>
      </nav>

      {/* Ürün Detay Ana Izgarası */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* SOL: GÖRSEL GALERİSİ */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#E6DCD3] shadow-md">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              fill
              className="object-cover transition-all duration-300"
              priority
            />
            {product.compareAtPrice && (
              <span className="absolute top-4 left-4 bg-[#C86D51] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                İndirim
              </span>
            )}
          </div>

          {/* Küçük Resimler (Thumbnails) */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? "border-[#C86D51] scale-95" : "border-[#E6DCD3] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Görsel ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: ÜRÜN BİLGİLERİ VE SEÇENEKLER */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51]">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28] mt-1 leading-tight">
              {product.title}
            </h1>

            {/* Değerlendirme & Yorumlar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#3E2E28]">{product.rating}</span>
              <span className="text-xs text-[#7C6354]">({product.reviewCount} Müşteri Değerlendirmesi)</span>
            </div>
          </div>

          {/* Fiyat Bilgisi */}
          <div className="p-4 bg-white rounded-2xl border border-[#E6DCD3] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#7C6354] block">Fiyat (KDV Dahil)</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#3E2E28]">
                  {product.price.toFixed(2)} <span className="text-base font-normal">TL</span>
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-[#7C6354] line-through">
                    {product.compareAtPrice.toFixed(2)} TL
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                ✓ Stokta Var ({product.stock} Adet)
              </span>
            </div>
          </div>

          <p className="text-sm text-[#7C6354] leading-relaxed">
            {product.description}
          </p>

          {/* Varyasyon Seçimleri */}
          {product.variants && product.variants.map((v) => (
            <div key={v.name} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2E28]">
                {v.name}: <span className="text-[#C86D51]">{selectedVariants[v.name]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariants({ ...selectedVariants, [v.name]: opt })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                      selectedVariants[v.name] === opt
                        ? "bg-[#3E2E28] text-white border-[#3E2E28]"
                        : "bg-white text-[#3E2E28] border-[#D8C7B5] hover:border-[#C86D51]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Adet Değiştirme ve Butonlar */}
          <div className="space-y-4 pt-4 border-t border-[#E6DCD3]">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#D8C7B5] rounded-full bg-white px-3 py-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-[#3E2E28] hover:text-[#C86D51]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#3E2E28]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-[#3E2E28] hover:text-[#C86D51]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleAddToCart(false)}
                className={`flex-1 py-4 rounded-full font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-[#C86D51] text-white hover:bg-[#B05B41]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Sepete Eklendi
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Sepete Ekle
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => handleAddToCart(true)}
              className="w-full py-4 bg-[#3E2E28] text-white font-semibold text-sm rounded-full hover:bg-black transition shadow-md"
            >
              Hemen Satın Al (Hızlı Ödeme)
            </button>
          </div>

          {/* Özellik Listesi & Hizmet Rozetleri */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E6DCD3] text-center text-xs text-[#7C6354]">
            <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#E6DCD3]">
              <Truck className="w-5 h-5 text-[#C86D51] mb-1" />
              <span>Hızlı Kargo</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#E6DCD3]">
              <ShieldCheck className="w-5 h-5 text-[#C86D51] mb-1" />
              <span>Zanaat Garantisi</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#E6DCD3]">
              <RefreshCw className="w-5 h-5 text-[#C86D51] mb-1" />
              <span>14 Gün İade</span>
            </div>
          </div>

          {/* Ürün Detay Maddeleri */}
          {product.details && (
            <div className="bg-white p-5 rounded-2xl border border-[#E6DCD3] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E2E28]">Ürün Özellikleri</h4>
              <ul className="list-disc list-inside text-xs text-[#7C6354] space-y-1">
                {product.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* BENZER ÜRÜNLER SECTION */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#E6DCD3]">
          <h3 className="font-serif text-2xl font-bold text-[#3E2E28] mb-8">Bunları Da Sevebilirsiniz</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
