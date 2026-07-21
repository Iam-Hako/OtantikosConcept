"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { settings, siteTexts, products, isAdmin } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAE0D5] via-[#F0E9E2] to-[#F8F5F0] py-16 md:py-24 border-b border-[#E6DCD3]">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#C86D51] blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full bg-[#3E2E28] blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Sol: Slogan & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-slide-left">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3E2E28] leading-[1.15]">
                {siteTexts?.hero?.title || settings.heroTitle} <br />
                <span className="text-[#C86D51] italic font-normal">{siteTexts?.hero?.highlightTitle || settings.heroHighlightText}</span>
              </h1>

              <p className="text-base text-[#7C6354] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                {siteTexts?.hero?.description || settings.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/urunler"
                  className="w-full sm:w-auto px-8 py-4 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group btn-press animate-pulse-glow"
                >
                  <span>{siteTexts?.hero?.buttonText || "Koleksiyonu Keşfet"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-[#3E2E28] border border-[#D8C7B5] font-semibold rounded-full hover:bg-[#EAE0D5] transition flex items-center justify-center gap-2 btn-press"
                  >
                    <Plus className="w-4 h-4 text-[#C86D51]" />
                    <span>Düzenle & Ürün Ekle</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Sağ: Brand Display */}
            <div className="lg:col-span-5 relative flex justify-center animate-slide-right">
              <div className="relative w-full max-w-[300px] sm:max-w-none sm:w-96 h-80 sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col items-center justify-center bg-gradient-to-br from-[#EAE0D5] to-[#F0E9E2] p-6 text-center card-hover">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#C86D51] shadow-lg mb-4 sm:mb-6 animate-pulse-glow">
                  <Image
                    src="/otantikos-logo.png"
                    alt="OtantikosConcept Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">{settings.siteTitle}</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C86D51] mt-1 font-semibold">{settings.siteSubtitle}</span>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#7C6354]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C86D51] animate-sparkle" />
                  <span>Premium Koleksiyon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORİLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-float-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51] flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Popüler Kategoriler
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28] mt-2">
            {siteTexts?.categoriesSection?.title || "Öne Çıkan Ürün Grupları"}
          </h2>
          <p className="text-sm text-[#7C6354] mt-2">
            {siteTexts?.categoriesSection?.subtitle || "Bijuteri, hediyelik eşya ve trend oyuncak kategorilerimiz."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {settings.categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group bg-white p-6 rounded-2xl border border-[#E6DCD3] hover:shadow-xl transition-all duration-300 flex flex-col justify-between card-hover animate-float-up"
              style={{ animationDelay: `${0.15 + index * 0.1}s`, opacity: 0 }}
            >
              <div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C86D51] mb-4 bg-[#F8F5F0] group-hover:scale-110 transition-transform duration-300">
                  <Image src="/otantikos-logo.png" alt={category.name} fill className="object-cover" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#3E2E28] group-hover:text-[#C86D51] transition">
                  {category.name}
                </h3>
                <p className="text-xs text-[#7C6354] mt-2 leading-relaxed">{category.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F8F5F0] flex items-center justify-between text-xs text-[#C86D51] font-semibold">
                <span>Ürünleri İncele</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ÜRÜNLER */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div className="animate-float-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Mağazamızdan
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#3E2E28]">
                {siteTexts?.productsSection?.title || "Yeni Ürünler"}
              </h2>
            </div>
            <Link href="/urunler" className="text-xs font-bold text-[#C86D51] hover:underline flex items-center gap-1 btn-press">
              Tümünü Gör &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 8).map((product, index) => (
              <div
                key={product.id}
                className="animate-float-up"
                style={{ animationDelay: `${0.1 + index * 0.06}s`, opacity: 0 }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MARKA HİKAYESİ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#EAE0D5]/50 to-[#F0E9E2]/50 border border-[#E6DCD3] rounded-3xl p-8 sm:p-12 text-center space-y-4 card-hover animate-float-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Sparkles className="w-6 h-6 text-[#C86D51] mx-auto animate-sparkle" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2E28]">
            {siteTexts?.brandStory?.title || "OtantikosConcept"}
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6354] max-w-3xl mx-auto leading-relaxed">
            {siteTexts?.brandStory?.content || "OtantikosConcept olarak en şık bijuteri ve hediyelik eşya modellerini sizlerle buluşturuyoruz."}
          </p>
        </div>
      </section>
    </div>
  );
}
