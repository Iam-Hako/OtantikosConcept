"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass, HeartHandshake, Plus } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { INITIAL_CATEGORIES } from "@/data/mockData";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAE0D5] to-[#F8F5F0] py-16 md:py-24 border-b border-[#E6DCD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Sol Taraf: Marka Sloganı & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C86D51]/10 border border-[#C86D51]/30 text-[#C86D51] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Anadolu'nun Doğal Mirası & Usta Zanaatı</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3E2E28] leading-[1.15]">
                Yaşam Alanlarınıza <br />
                <span className="text-[#C86D51] italic font-normal">Otantik</span> Bir Ruh Katın.
              </h1>

              <p className="text-base text-[#7C6354] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Geleneksel tezgahlardan, usta ellerde şekillenen seramiklere... OtantikosConcept ile eviniz için %100 doğal ve özgün ürünleri mağazanıza eklemeye başlayın.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-4 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ürün Ekle (Admin Paneli)</span>
                </Link>
                <Link
                  href="/urunler"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#3E2E28] border border-[#D8C7B5] font-semibold rounded-full hover:bg-[#EAE0D5] transition flex items-center justify-center"
                >
                  Kataloğu İncele
                </Link>
              </div>

            </div>

            {/* Sağ Taraf: Brand Logo Display */}
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
                <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">OtantikosConcept</h3>
                <span className="text-xs uppercase tracking-widest text-[#7C6354] mt-1 font-semibold">Specialist Local Products</span>
                <p className="text-xs text-[#7C6354] mt-4 max-w-xs">Doğal çömlek seramikler, dokuma kumaşlar ve özgün yaşam koleksiyonları.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* KATEGORİLER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51]">Doğal & Özgün</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28] mt-1">Kategorilerimiz</h2>
          <p className="text-sm text-[#7C6354] mt-2">Yönetici paneli üzerinden ürün ekleyebileceğiniz ana kategoriler.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_CATEGORIES.map((category) => (
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
                <span>Ürün Ekle</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MAĞAZA DURUMU BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E6DCD3] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#EAE0D5] text-[#C86D51] rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2E28]">
            Mağazanız Satışa Hazır!
          </h2>
          <p className="text-sm text-[#7C6354] max-w-xl mx-auto">
            Ürün kataloğu tamamen boş durumdadır. Yönetici panelinden (`/admin`) kendi gerçek ürün görsellerinizi, açıklamalarınızı, fiyat ve stok bilgilerinizi dilediğiniz gibi ekleyebilirsiniz.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md"
            >
              Yönetici Paneline Git ve Ürün Ekle
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
