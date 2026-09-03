'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, MapPin, ShieldCheck, Truck, Store, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-10">
      
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto bg-stone-900 rounded-2xl p-2 border border-stone-800 shadow-md">
          <Image src="/images/logo.webp" alt="Otantikos Concept" fill className="object-contain p-1" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Tahtakale Ruhu</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
          Otantikos Concept Hikayesi
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Eminönü'nün tarihi hanlarından dijital dünyaya uzanan şeffaf ve kaliteli ticaret köprüsü.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <p>
          <strong>Otantikos Concept</strong> (Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi), İstanbul&apos;un ticaret kalbi olan Eminönü Süleymaniye / Tahtakale bölgesinde faaliyet göstermektedir. Hediyelik eşyalar, oyuncak, squishy ve trend koleksiyonlarda toptan ve perakende satış sunuyoruz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <h4 className="font-bold text-amber-900 text-sm">Net Fiyat Garantisi</h4>
            <p className="text-xs text-amber-800 mt-1">
              Fiyatları önce şişirip sonra sahte kuponlarla indirim algısı yaratmıyoruz. Doğrudan net atölye ve ithalat fiyatlarını sunuyoruz.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">Doğrudan Sevkiyat & Mağazadan Teslim</h4>
            <p className="text-xs text-stone-600 mt-1">
              Tüm siparişlerinizi aynı gün Eminönü depomuzdan kargoya veriyor veya dileyen müşterilerimize mağazamızdan ücretsiz teslim ediyoruz.
            </p>
          </div>
        </div>

        <p>
          Gerek perakende gerekse toptan alımlarda dürüstlük, müşteri memnuniyeti ve hızlı servis ilkelerimizden asla taviz vermeden büyümeye devam ediyoruz.
        </p>

        {/* Corporate Legal Identifiers for iyzico & Official Compliance */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs space-y-2 text-stone-700">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-200">
            Resmi Şirket & Sicil Bilgileri
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div><strong>Ticari Unvan:</strong> Otantikos Hediyelik Eşya Oyuncak Ticaret Ltd. Şti.</div>
            <div><strong>Vergi Dairesi & VKN:</strong> Hocapaşa V.D. / 6491340351</div>
            <div><strong>MERSİS No:</strong> 0649134035100001</div>
            <div><strong>Ticaret Sicil No:</strong> 1146371</div>
            <div className="sm:col-span-2"><strong>Kayıtlı Adres:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</div>
            <div><strong>Telefon / WhatsApp:</strong> +90 (507) 773 77 77</div>
            <div><strong>E-posta:</strong> aylindurmus54@gmail.com</div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative h-7 w-56 opacity-90">
            <Image
              src="/images/iyzico/logo_band_colored.svg"
              alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
              fill
              className="object-contain object-left"
            />
          </div>

          <Link
            href="/kategori/tum-urunler"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
          >
            <span>Koleksiyonumuzu Keşfedin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
