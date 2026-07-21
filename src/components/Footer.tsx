"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, RefreshCw, Headphones, Mail, Share2, Globe, Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#3E2E28] text-[#F8F5F0] pt-16 pb-12 border-t-4 border-[#C86D51]">
      {/* Güven Rozetleri Çubuğu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#5A453C]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <Truck className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">Özenli Paketleme</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">Hasarsız & Hızlı Teslimat</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <ShieldCheck className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">Güvenli Ödeme</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">256-Bit SSL Şifreleme</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <RefreshCw className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">Kolay İade</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">14 Gün İade Garantisi</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#4A3B32]/40">
            <Headphones className="w-8 h-8 text-[#C86D51] mb-2" />
            <h4 className="text-sm font-semibold">7/24 Destek</h4>
            <p className="text-xs text-[#D8C7B5] mt-1">Samimi Müşteri Hizmetleri</p>
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
            Anadolu'nun zengin el sanatlarını ve usta zanaatkarların doğal dokunuşlarını modern yaşam alanlarınıza taşıyoruz.
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
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">Hızlı Menü</h4>
          <ul className="space-y-2.5 text-xs text-[#D8C7B5]">
            <li><Link href="/" className="hover:text-white transition">Ana Sayfa</Link></li>
            <li><Link href="/urunler" className="hover:text-white transition">Tüm Ürünler</Link></li>
            <li><Link href="/admin" className="hover:text-white transition font-medium">Yönetici Paneli / Ürün Ekle</Link></li>
          </ul>
        </div>

        {/* Kolon 3: Müşteri Hizmetleri */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">Müşteri Hizmetleri</h4>
          <ul className="space-y-2.5 text-xs text-[#D8C7B5]">
            <li><Link href="#" className="hover:text-white transition">Sıkça Sorulan Sorular</Link></li>
            <li><Link href="#" className="hover:text-white transition">Kargo ve Teslimat</Link></li>
            <li><Link href="#" className="hover:text-white transition">İade ve Değişim Koşulları</Link></li>
          </ul>
        </div>

        {/* Kolon 4: E-Bülten */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#C86D51] mb-4">E-Bülten</h4>
          <p className="text-xs text-[#D8C7B5] mb-3">Yeni ürünlerimiz ve haberler için bültenimize katılın.</p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="E-posta adresiniz..."
              className="w-full bg-[#4A3B32] border border-[#5A453C] rounded-lg py-2 px-3 text-xs text-white placeholder-[#D8C7B5] focus:outline-none focus:border-[#C86D51]"
            />
            <button type="submit" className="w-full bg-[#C86D51] hover:bg-[#B05B41] text-white text-xs font-semibold py-2 rounded-lg transition">
              Abone Ol
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#5A453C] flex flex-col md:flex-row justify-between items-center text-xs text-[#D8C7B5] gap-4">
        <p>© {new Date().getFullYear()} OtantikosConcept. Tüm hakları saklıdır.</p>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase bg-[#4A3B32] px-3 py-1.5 rounded-md text-[#D8C7B5]">
          <span>💳 Visa / Mastercard / Troy / Iyzico / Stripe Uyumlu</span>
        </div>
      </div>
    </footer>
  );
}
