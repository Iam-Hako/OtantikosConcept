"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, RefreshCw, Headphones, Mail, Share2, Globe, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { siteTexts, isAdmin } = useAuth();

  return (
    <footer className="bg-[#3E2E28] text-[#F8F5F0] pt-16 pb-12 border-t-4 border-[#C86D51]">
      {/* Güven Rozetleri Çubuğu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#5A453C]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <Truck className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">{siteTexts?.footer?.trust1Title || "Özenli Paketleme"}</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">{siteTexts?.footer?.trust1Desc || "Hasarsız & Hızlı Teslimat"}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <ShieldCheck className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">{siteTexts?.footer?.trust2Title || "Güvenli Ödeme"}</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">{siteTexts?.footer?.trust2Desc || "SSL Koruma"}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <RefreshCw className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">{siteTexts?.footer?.trust3Title || "Kolay İade"}</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">{siteTexts?.footer?.trust3Desc || "İade Garantisi"}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <Headphones className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">{siteTexts?.footer?.trust4Title || "Müşteri Desteği"}</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">{siteTexts?.footer?.trust4Desc || "Kesintisiz Hizmet"}</p>
          </div>
        </div>
      </div>

      {/* Ana Footer İçeriği */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Kolon 1: Marka Tanıtımı */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C86D51]">
              <Image src="/otantikos-logo.png" alt="OtantikosConcept" fill className="object-cover" />
            </div>
            <span className="font-serif text-xl font-bold tracking-wide">OtantikosConcept</span>
          </div>
          <p className="text-xs text-[#D8C7B5] leading-relaxed">
            {siteTexts?.footer?.brandDescription || "OtantikosConcept - Trend oyuncak ve bijuteri online satış mağazası."}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A3B32] flex items-center justify-center text-[#D8C7B5] hover:text-[#C86D51] hover:bg-white transition" title="Paylaş">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A3B32] flex items-center justify-center text-[#D8C7B5] hover:text-[#C86D51] hover:bg-white transition" title="Web">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A3B32] flex items-center justify-center text-[#D8C7B5] hover:text-[#C86D51] hover:bg-white transition" title="E-Posta">
              <Mail className="w-4 h-4" />
            </a>
          </div>
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

        {/* Kolon 3: Müşteri Hizmetleri */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">
            {siteTexts?.footer?.customerServiceTitle || "Müşteri Hizmetleri"}
          </h4>
          <ul className="space-y-2.5 text-xs text-[#D8C7B5]">
            <li><Link href="#" className="hover:text-white transition">{siteTexts?.footer?.faqLink || "Sıkça Sorulan Sorular"}</Link></li>
            <li><Link href="#" className="hover:text-white transition">{siteTexts?.footer?.shippingPolicyLink || "Kargo ve Teslimat"}</Link></li>
            <li><Link href="#" className="hover:text-white transition">{siteTexts?.footer?.returnPolicyLink || "İade ve Değişim Koşulları"}</Link></li>
          </ul>
        </div>

        {/* Kolon 4: E-Bülten */}
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
