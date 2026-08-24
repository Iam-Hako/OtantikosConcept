'use client';

import React from 'react';
import { RotateCcw, Truck, ShieldCheck, Store } from 'lucide-react';

export default function ReturnsAndDeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-amber-700" />
          <span>İade ve Teslimat Koşulları</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Eminönü Tahtakale Sevkiyatı ve Kolay RMA Masası Süreçleri</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-700" />
            <span>Teslimat Süreci ve Kargo Seçenekleri</span>
          </h3>
          <p className="mt-2">
            Otantikos Concept'ten verilen tüm siparişler, Eminönü Tahtakale depomuzdan hafta içi saat 16:00'ya kadar aynı gün özenle paketlenerek anlaşmalı kargo firmasına teslim edilir. Şeffaf ve sabit kargo tarifemiz ile tüm Türkiye'ye sigortalı gönderim sağlanmaktadır.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-700" />
            <span>Tahtakale Mağazadan Teslim Al (Click & Collect)</span>
          </h3>
          <p className="mt-2">
            İstanbul içi müşterilerimiz, sepet adımında "Tahtakale Mağazadan Teslim" seçeneğini seçerek hiçbir kargo ücreti ödemeden siparişlerini Eminönü Marpuççular Caddesi'ndeki mağazamızdan aynı gün elden teslim alabilirler.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-700" />
            <span>14 Gün Koşulsuz İade ve Değişim (RMA Masası)</span>
          </h3>
          <p className="mt-2">
            Teslim aldığınız ürünü 14 gün içerisinde hiçbir gerekçe göstermeksizin iade edebilir veya beden/model değişimi talep edebilirsiniz. İade talebi oluşturmak için <strong>Hesabım ➔ İade Masası</strong> sekmesinden tek tıkla talep açmanız yeterlidir.
          </p>
        </div>
      </div>
    </div>
  );
}
