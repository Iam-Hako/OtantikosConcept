'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, MapPin, ShieldCheck, Truck, Store, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
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

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <p>
          <strong>Otantikos Concept</strong>, İstanbul'un ticaret kalbi olan Eminönü Tahtakale Marpuççular Caddesi'nde doğdu. Yılların zanaat mirasını, el işçiliği mozaik cam lambaları, 316L medikal çelik takıları ve dünyadaki en son trend mekanik oyuncakları tek bir çatı altında topluyoruz.
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
          Gerek perakende gerekse toptan B2B alımlarda dürüstlük, müşteri memnuniyeti ve hızlı servis ilkelerimizden asla taviz vermeden büyümeye devam ediyoruz.
        </p>

        <div className="pt-4 border-t border-stone-200 flex justify-center">
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
