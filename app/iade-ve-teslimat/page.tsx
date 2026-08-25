'use client';

import React from 'react';
import { RotateCcw, Truck, ShieldCheck, Store, Clock, PackageCheck, AlertCircle } from 'lucide-react';

export default function ReturnsAndDeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-amber-700" />
          <span>İade ve Teslimat Koşulları</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Eminönü Tahtakale Sevkiyatı, DHL Kargo Süreçleri ve 14 Gün Kolay İade</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        
        {/* 1. Teslimat Süreci */}
        <div className="space-y-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-2">
            <Truck className="w-5 h-5 text-amber-700" />
            <span>1. Teslimat Süresi ve Kargo Süreci</span>
          </h3>
          <p>
            Otantikos Concept üzerinden verilen tüm siparişler, yasal 30 günlük süreyi aşmamak kaydıyla ortalama <strong>1-3 iş günü</strong> içerisinde anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong>&apos;ya teslim edilir.
          </p>
          <p>
            Siparişiniz kargoya teslim edildiğinde SMS ve e-posta ile kargo takip numarası iletilir. Ayrıca sitemizdeki <strong>Sipariş Takibi</strong> sayfasından siparişinizin anlık durumunu adım adım takip edebilirsiniz.
          </p>
          <p>
            Standart adrese teslim kargo gönderim bedeli sabit <strong>200,00 TL</strong>&apos;dir.
          </p>
        </div>

        {/* 2. Mağazadan Teslim Alma */}
        <div className="space-y-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-2">
            <Store className="w-5 h-5 text-amber-700" />
            <span>2. Tahtakale Mağazadan Ücretsiz Teslim Al (Click & Collect)</span>
          </h3>
          <p>
            İstanbul içi müşterilerimiz, sepet ve ödeme adımında <strong>&quot;Tahtakale Mağazadan Teslim&quot;</strong> seçeneğini seçerek hiçbir kargo ücreti ödemeden (0,00 TL) siparişlerini Eminönü&apos;ndeki mağazamızdan aynı gün mesai saatleri (10:00 - 17:00) içerisinde elden teslim alabilirler.
          </p>
          <p className="text-xs bg-stone-50 p-3 rounded-xl border border-stone-200 font-medium">
            <strong>Mağaza Adresimiz:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL
          </p>
        </div>

        {/* 3. İade ve Değişim Koşulları */}
        <div className="space-y-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-2">
            <RotateCcw className="w-5 h-5 text-amber-700" />
            <span>3. 14 Gün Koşulsuz İade ve Cayma Hakkı</span>
          </h3>
          <p>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, teslim aldığınız ürünü teslimat tarihinden itibaren <strong>14 gün</strong> içerisinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin iade edebilirsiniz.
          </p>
          
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
            <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-700" />
              <span>Kargo Firması & İade Masrafı</span>
            </h4>
            <p className="text-xs leading-relaxed">
              İadelerin yalnızca anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong> aracılığıyla yapılması gerekmektedir. Cayma hakkı kapsamındaki keyfi iadelerde kargo gönderim bedeli <strong>ALICI&apos;ya aittir</strong>. Ayıplı, hasarlı veya hatalı ürün gönderimlerinde ise kargo masrafı <strong>SATICI tarafından karşılanır</strong>.
            </p>
          </div>
        </div>

        {/* 4. İade Nasıl Başlatılır? */}
        <div className="space-y-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <span>4. İade Süreci ve Ücret İadesi</span>
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li>Sitemizde oturum açarak <strong>Hesabım ➔ İade Taleplerim</strong> bölümünden veya <strong>aylindurmus54@gmail.com</strong> / <strong>+90 (507) 773 77 77</strong> iletişim hatlarımızdan iade talebinizi oluşturun.</li>
            <li>Ürünü faturası, orijinal kutusu ve tüm aksesuarlarıyla birlikte sağlam şekilde paketleyin.</li>
            <li>Paketinizi anlaşmalı kargo firmamız olan <strong>DHL Kargo</strong> şubesine teslim edin.</li>
            <li>İade kargonuz depomuza ulaştıktan sonra kalite kontrol ekibimiz tarafından incelenir ve onaylandığında ücret iadeniz <strong>en geç 14 gün</strong> içerisinde siparişte kullandığınız kredi/banka kartınıza yapılır.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
