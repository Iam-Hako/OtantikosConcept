'use client';

import React from 'react';
import { FileText, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function PreInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-700" />
          <span>Ön Bilgilendirme Koşulları</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Sipariş Öncesi 6502 Sayılı Kanun Uyarınca Tüketici Bilgilendirme Formu</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        
        {/* 1. SATICI BİLGİLERİ */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">1. SATICI BİLGİLERİ</h3>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs mt-3">
            <p><strong>Ticari Unvan:</strong> Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</p>
            <p><strong>Vergi Dairesi:</strong> Hocapaşa Vergi Dairesi</p>
            <p><strong>Vergi Kimlik No (VKN):</strong> 6491340351</p>
            <p><strong>MERSİS No:</strong> 0649134035100001</p>
            <p><strong>Ticaret Sicil No:</strong> 1146371</p>
            <p><strong>İş Yeri Adresi:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</p>
            <p><strong>Telefon / WhatsApp:</strong> +90 (507) 773 77 77</p>
            <p><strong>E-posta:</strong> aylindurmus54@gmail.com</p>
          </div>
        </div>

        {/* 2. SÖZLEŞME KONUSU ÜRÜN VE BEDELİ */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">2. SÖZLEŞME KONUSU ÜRÜN VE BEDELİ</h3>
          <p className="mt-2 text-xs">
            Siparişe konu olan ürün/ürünlerin cinsi, miktarı, modeli, rengi, vergiler dahil toplam satış tutarı ve kargo ücreti sepet ve ödeme ekranında detaylı olarak yer almaktadır.
          </p>
        </div>

        {/* 3. TESLİMAT VE KARGO BİLGİLERİ */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">3. TESLİMAT VE KARGO BİLGİLERİ</h3>
          <div className="mt-2 space-y-2 text-xs">
            <p>
              Siparişler, yasal 30 günlük süreyi aşmamak kaydıyla ortalama <strong>1-3 iş günü</strong> içerisinde anlaşmalı kargo firmamız <strong>DHL Kargo</strong>&apos;ya teslim edilir.
            </p>
            <p>
              Kargo bedeli, sipariş edilen ürünlerin paket desi/hacim ağırlığına göre anlaşmalı kargo firmamız <strong>DHL Kargo</strong> resmi tarifesi doğrultusunda sipariş özetinde dinamik olarak hesaplanarak ALICI&apos;ya sunulur. Mağazadan elden teslim alımlarda kargo ücreti 0,00 TL&apos;dir.
            </p>
          </div>
        </div>

        {/* 4. CAYMA HAKKI VE İADE SÜRECİ */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">4. CAYMA HAKKI VE İADE PROSEDÜRÜ</h3>
          <div className="mt-2 space-y-2 text-xs">
            <p>
              Tüketici, malı teslim aldığı tarihten itibaren <strong>14 (ondört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart üstlenmeksizin sözleşmeden cayma hakkına sahiptir.
            </p>
            <p className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 text-amber-900">
              <strong>Kargo Firması & İade Masrafı:</strong> İadelerin yalnızca anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong> aracılığıyla yapılması gerekmektedir. Cayma hakkı kapsamındaki keyfi iadelerde kargo gönderim bedeli ALICI&apos;ya aittir. Ayıplı, hasarlı veya hatalı ürün gönderimlerinde ise kargo masrafı SATICI tarafından karşılanır.
            </p>
          </div>
        </div>

        {/* 5. ÖDEME VE GÜVENLİK BİLGİLERİ */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">5. ÖDEME VE GÜVENLİK BİLGİLERİ</h3>
          <p className="mt-2 text-xs">
            Ödemeler, 256-Bit SSL güvenlikli Sanal POS altyapısı üzerinden 3D Secure güvencesiyle kredi kartı veya banka kartı (Visa, Mastercard, Troy) ile tahsil edilir.
          </p>
        </div>

        {/* 6. ŞİKAYET VE İTİRAZLAR */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">6. ŞİKAYET VE İTİRAZLAR</h3>
          <p className="mt-2 text-xs">
            Tüketici, şikayet ve itirazları konusunda başvurularını Ticaret Bakanlığı&apos;nca her yıl belirlenen parasal sınırlar dahilinde Tüketici Sorunları Hakem Heyetine veya Tüketici Mahkemesine yapabilir.
          </p>
        </div>

      </div>
    </div>
  );
}
