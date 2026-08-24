'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export default function PreInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-700" />
          <span>Ön Bilgilendirme Koşulları</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Sipariş Öncesi Tüketici Bilgilendirme Formu</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        <h3 className="font-bold text-stone-900 text-base">1. SATICI BİLGİLERİ</h3>
        <p>
          <strong>Firma:</strong> Otantikos Concept<br />
          <strong>Adres:</strong> Tahtakale Tanburacı Han Eminönü / Fatih / İSTANBUL<br />
          <strong>Tel:</strong> +90 (507) 773 77 77
        </p>

        <h3 className="font-bold text-stone-900 text-base">2. SÖZLEŞME KONUSU ÜRÜN VE BEDELİ</h3>
        <p>
          Ürünlerin temel nitelikleri, adedi, KDV dahil vergili toplam tutarı ve kargo bedeli sepet ve ödeme ekranında açıkça belirtilmiştir.
        </p>

        <h3 className="font-bold text-stone-900 text-base">3. ÖDEME VE İFA BİLGİLERİ</h3>
        <p>
          Ödemeler, 256-bit SSL güvenlikli sanal POS altyapısı üzerinden kredi/banka kartıyla peşin veya taksitle tahsil edilir. Stok durumu ödeme anında anlık kilit ile doğrulanır.
        </p>

        <h3 className="font-bold text-stone-900 text-base">4. ŞİKAYET VE İTİRAZLAR</h3>
        <p>
          Tüketici, uyuşmazlık durumunda yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri'ne veya Tüketici Mahkemeleri'ne başvurabilir.
        </p>
      </div>
    </div>
  );
}
