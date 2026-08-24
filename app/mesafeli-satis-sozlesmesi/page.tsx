'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export default function DistanceSellingPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-700" />
          <span>Mesafeli Satış Sözleşmesi</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">6502 Sayılı Tüketicinin Korunması Hakkında Kanun Uyarınca Düzenlenmiştir</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        <h3 className="font-bold text-stone-900 text-base">MADDE 1 - TARAFLAR</h3>
        <p>
          <strong>SATICI:</strong> Otantikos Concept<br />
          <strong>Adres:</strong> Tahtakale Mah. Marpuççular Cad. No:18 Eminönü / Fatih / İSTANBUL<br />
          <strong>Telefon:</strong> +90 (212) 522 34 56<br />
          <strong>E-Posta:</strong> destek@otantikosconcept.com<br />
          <strong>ALICI:</strong> www.otantikosconcept.com sitesinden sipariş veren gerçek veya tüzel kişi ("Tüketici").
        </p>

        <h3 className="font-bold text-stone-900 text-base">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
        <p>
          İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini yaptığı ürünlerin satışı, teslimi ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
        </p>

        <h3 className="font-bold text-stone-900 text-base">MADDE 3 - FİYAT VE NETLİK PRENSİBİ</h3>
        <p>
          Sitede listelenen tüm ürün fiyatları KDV dahil doğrudan net satış fiyatlarıdır. SATICI, yanıltıcı fiyat şişirme veya sahte kupon uygulamaları yapmaksızın doğrudan şeffaf fiyat sunmayı taahhüt eder.
        </p>

        <h3 className="font-bold text-stone-900 text-base">MADDE 4 - TESLİMAT VE MASRAFLAR</h3>
        <p>
          Ürünler, ALICI'nın sipariş formunda belirttiği teslimat türüne göre anlaşmalı kargo firması aracılığıyla adrese veya Eminönü Tahtakale şubesinden teslim alınmak üzere hazırlanır. Kargo bedeli sipariş özetinde gösterildiği gibidir; belirlenen limit üzeri siparişlerde kargo ücretsizdir.
        </p>

        <h3 className="font-bold text-stone-900 text-base">MADDE 5 - CAYMA HAKKI (14 GÜN)</h3>
        <p>
          ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, malın teslim alındığı tarihten itibaren 14 (ondört) gün içerisinde cayma hakkını kullanabilir. İade talebi site üzerinden RMA Masası açılarak kolayca başlatılabilir.
        </p>
      </div>
    </div>
  );
}
