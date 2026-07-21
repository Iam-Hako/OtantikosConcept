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
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAE0D5] to-[#F8F5F0] py-16 md:py-24 border-b border-[#E6DCD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Sol Taraf: Marka Sloganı & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

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
                  className="w-full sm:w-auto px-8 py-4 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <span>{siteTexts?.hero?.buttonText || "Koleksiyonu Keşfet"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-[#3E2E28] border border-[#D8C7B5] font-semibold rounded-full hover:bg-[#EAE0D5] transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#C86D51]" />
                    <span>Tüm Metinleri Düzenle & Ürün Ekle</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Sağ Taraf: Brand Display */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-80 h-96 sm:w-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col items-center justify-center bg-[#EAE0D5] p-8 text-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[#C86D51] shadow-lg mb-6">
                  <Image
                    src="/otantikos-logo.png"
                    alt="OtantikosConcept Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">{settings.siteTitle}</h3>
                <span className="text-xs uppercase tracking-widest text-[#7C6354] mt-1 font-semibold">{settings.siteSubtitle}</span>
                <p className="text-xs text-[#7C6354] mt-4 max-w-xs">{siteTexts?.hero?.description || "NeeDoh Squishy Çin Mantısı, stres oyuncakları ve trend bijuteri takı tasarımları."}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* KATEGORİLER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51]">Popüler Kategoriler</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28] mt-1">
            {siteTexts?.categoriesSection?.title || "Öne Çıkan Ürün Grupları"}
          </h2>
          <p className="text-sm text-[#7C6354] mt-2">
            {siteTexts?.categoriesSection?.subtitle || "NeeDoh Squishy Çin Mantısı ve göz alıcı bijuteri takılarımız."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {settings.categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group bg-white p-6 rounded-2xl border border-[#E6DCD3] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C86D51] mb-4 bg-[#F8F5F0]">
                  <Image src="/otantikos-logo.png" alt={category.name} fill className="object-cover" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#3E2E28] group-hover:text-[#C86D51] transition">
                  {category.name}
                </h3>
                <p className="text-xs text-[#7C6354] mt-2 leading-relaxed">{category.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F8F5F0] flex items-center justify-between text-xs text-[#C86D51] font-semibold">
                <span>Ürünleri İncele</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DİNAMİK EKLENEN ÜRÜNLER SECTION */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51]">Mağazamıza Eklenenler</span>
              <h2 className="font-serif text-3xl font-bold text-[#3E2E28]">
                {siteTexts?.productsSection?.title || "Yeni Ürünler"}
              </h2>
            </div>
            <Link href="/urunler" className="text-xs font-bold text-[#C86D51] hover:underline flex items-center gap-1">
              Tümünü Gör &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* MARKA HİKAYESİ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAE0D5]/50 border border-[#E6DCD3] rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2E28]">
            {siteTexts?.brandStory?.title || "OtantikosConcept Hikayesi"}
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6354] max-w-3xl mx-auto leading-relaxed">
            {siteTexts?.brandStory?.content || "OtantikosConcept olarak hem eğlenceli hem estetik ürünleri sizlerle buluşturuyoruz."}
          </p>
        </div>
      </section>

    </div>
  );
}
