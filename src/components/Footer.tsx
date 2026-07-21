"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { siteTexts, isAdmin } = useAuth();

  return (
    <footer className="bg-[#3E2E28] text-[#F8F5F0] pt-12 pb-12 border-t-4 border-[#C86D51]">
      {/* Ana Footer İçeriği */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolon 1: Marka Tanıtımı */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C86D51]">
              <Image src="/otantikos-logo.png" alt="OtantikosConcept" fill className="object-cover" />
            </div>
            <span className="font-serif text-xl font-bold tracking-wide">OtantikosConcept</span>
          </div>
          <p className="text-xs text-[#D8C7B5] leading-relaxed">
            {siteTexts?.footer?.brandDescription || "OtantikosConcept - Bijuteri, Hediyelik Eşya ve Trend Oyuncak Mağazası."}
          </p>
        </div>

        {/* Kolon 2: Hızlı Bağlantılar */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">
            {siteTexts?.footer?.quickLinksTitle || "Hızlı Menü"}
          </h4>
          <ul className="space-y-2.5 text-xs text-[#D8C7B5]">
            <li><Link href="/" className="hover:text-white transition">{siteTexts?.header?.navHome || "Ana Sayfa"}</Link></li>
            <li><Link href="/urunler" className="hover:text-white transition">{siteTexts?.header?.navAllProducts || "Tüm Ürünler"}</Link></li>
            {isAdmin && (
              <li><Link href="/admin" className="hover:text-white transition font-medium text-[#C86D51]">{siteTexts?.header?.adminButton || "Yönetici Paneli"}</Link></li>
            )}
          </ul>
        </div>

        {/* Kolon 3: E-Bülten */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">
            {siteTexts?.footer?.newsletterTitle || "E-Bülten"}
          </h4>
          <p className="text-xs text-[#D8C7B5] mb-3">
            {siteTexts?.footer?.newsletterDesc || "Yeni ürünlerimiz ve haberler için bültenimize katılın."}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder={siteTexts?.footer?.newsletterPlaceholder || "E-posta adresiniz..."}
              className="w-full bg-[#4A3B32] border border-[#5A453C] rounded-lg py-2 px-3 text-xs text-white placeholder-[#D8C7B5] focus:outline-none focus:border-[#C86D51]"
            />
            <button type="submit" className="w-full bg-[#C86D51] hover:bg-[#B05B41] text-white text-xs font-semibold py-2 rounded-lg transition">
              {siteTexts?.footer?.newsletterButton || "Abone Ol"}
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#5A453C] flex flex-col md:flex-row justify-between items-center text-xs text-[#D8C7B5] gap-4">
        <p>{siteTexts?.footer?.copyrightText || `© ${new Date().getFullYear()} OtantikosConcept. Tüm hakları saklıdır.`}</p>
        {siteTexts?.footer?.paymentMethodsBadge ? (
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase bg-[#4A3B32] px-3 py-1.5 rounded-md text-[#D8C7B5]">
            <span>{siteTexts.footer.paymentMethodsBadge}</span>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
