'use client';

import React from 'react';
import { FileText, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function DistanceSellingPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-700" />
          <span>Mesafeli Satış Sözleşmesi</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Uyarınca Düzenlenmiştir</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        
        {/* MADDE 1 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 1 - TARAFLAR</h3>
          <div className="mt-3 space-y-2">
            <p><strong>1.1. SATICI BİLGİLERİ:</strong></p>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs">
              <p><strong>Ticari Unvan:</strong> Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</p>
              <p><strong>Vergi Dairesi:</strong> Hocapaşa Vergi Dairesi</p>
              <p><strong>Vergi Kimlik No (VKN):</strong> 6491340351</p>
              <p><strong>MERSİS No:</strong> 0649134035100001</p>
              <p><strong>Ticaret Sicil No:</strong> 1146371</p>
              <p><strong>İş Yeri Adresi:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</p>
              <p><strong>Telefon / WhatsApp:</strong> +90 (507) 773 77 77</p>
              <p><strong>E-posta:</strong> aylindurmus54@gmail.com</p>
            </div>

            <p className="mt-3"><strong>1.2. ALICI (TÜKETİCİ) BİLGİLERİ:</strong></p>
            <p className="text-xs">
              www.otantikosconcept.com internet sitesinden sipariş veren, sipariş formunda adı, soyadı, teslimat adresi ve iletişim bilgileri belirtilen gerçek veya tüzel kişi (&quot;ALICI&quot;).
            </p>
          </div>
        </div>

        {/* MADDE 2 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
          <p className="mt-2 text-xs">
            İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait www.otantikosconcept.com internet sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış fiyatı belirtilen ürünlerin satışı, teslimi ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun ile Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
          </p>
        </div>

        {/* MADDE 3 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 3 - FİYAT VE NETLİK PRENSİBİ</h3>
          <p className="mt-2 text-xs">
            Sitede listelenen tüm ürün fiyatları KDV (%20) dahil doğrudan net satış fiyatlarıdır. SATICI, yanıltıcı fiyat şişirme veya sahte kupon uygulamaları yapmaksızın doğrudan şeffaf ve adil fiyat sunmayı taahhüt eder.
          </p>
        </div>

        {/* MADDE 4 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 4 - TESLİMAT SÜRESİ VE MASRAFLAR</h3>
          <div className="mt-2 space-y-2 text-xs">
            <p>
              <strong>4.1. Teslimat Süresi:</strong> Siparişler, yasal 30 günlük süreyi aşmamak kaydıyla ortalama <strong>1-3 iş günü</strong> içerisinde kargoya teslim edilir.
            </p>
            <p>
              <strong>4.2. Teslimat Şekli ve Kargo:</strong> Ürünler, ALICI&apos;nın sipariş formunda belirttiği teslimat türüne göre anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong> aracılığıyla ALICI&apos;nın adresine veya Eminönü Tahtakale şubemizden elden teslim alınmak üzere hazırlanır. Standart kargo bedeli sipariş özetinde gösterildiği üzere sabit 200,00 TL&apos;dir; mağazadan elden teslim alımlarda kargo ücreti 0,00 TL&apos;dir.
            </p>
          </div>
        </div>

        {/* MADDE 5 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 5 - CAYMA HAKKI VE İADE KOŞULLARI</h3>
          <div className="mt-2 space-y-2 text-xs">
            <p>
              <strong>5.1. Cayma Hakkı Süresi:</strong> ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, malın teslim alındığı tarihten itibaren <strong>14 (ondört) gün</strong> içerisinde cayma hakkını kullanabilir.
            </p>
            <p className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 text-amber-900">
              <strong>5.2. Kargo Firması & İade Masrafı:</strong> İadelerin yalnızca anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong> aracılığıyla yapılması gerekmektedir. Cayma hakkı kapsamındaki keyfi iadelerde kargo gönderim bedeli ALICI&apos;ya aittir. Ayıplı, hasarlı veya hatalı ürün gönderimlerinde ise kargo masrafı SATICI tarafından karşılanır.
            </p>
            <p>
              <strong>5.3. İade Süreci:</strong> ALICI, iade talebini site üzerinden <strong>Hesabım ➔ İade Masası</strong> sekmesini kullanarak veya müşteri hizmetleri e-postası (aylindurmus54@gmail.com) / WhatsApp hattı (+90 507 773 77 77) üzerinden bildirebilir. İade edilen ürün SATICI&apos;ya ulaştıktan ve incelendikten sonra, ürün bedeli en geç 14 gün içinde ALICI&apos;nın ödeme yaptığı kart/hesaba iade edilir.
            </p>
          </div>
        </div>

        {/* MADDE 6 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 6 - ÖDEME VE GÜVENLİK</h3>
          <p className="mt-2 text-xs">
            Ödemeler, 256-Bit SSL güvenlik sertifikası ve 3D Secure korumalı Sanal POS altyapısı üzerinden kredi kartı / banka kartı (Visa, Mastercard, Troy) ile tahsil edilir. ALICI&apos;nın kart bilgileri hiçbir şekilde SATICI sistemlerinde saklanmaz.
          </p>
        </div>

        {/* MADDE 7 */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">MADDE 7 - YETKİLİ MAHKEME</h3>
          <p className="mt-2 text-xs">
            İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI&apos;nın veya SATICI&apos;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
          </p>
        </div>

      </div>
    </div>
  );
}
