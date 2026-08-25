'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function KvkkPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-700" />
          <span>KVKK Aydınlatma Metni</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        
        {/* 1. Veri Sorumlusu */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">1. Veri Sorumlusu Sıfatı</h3>
          <p className="mt-2 text-xs">
            <strong>Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</strong> (&quot;Şirket&quot;, VKN: 6491340351, MERSİS No: 0649134035100001, Ticaret Sicil No: 1146371) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar ve yasal çerçevede işlemekte, saklamakta ve korumaktayız.
          </p>
        </div>

        {/* 2. İşlenen Kişisel Veriler */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">2. İşlenen Kişisel Veriler</h3>
          <p className="mt-2 text-xs">
            Tarafımızca işlenen kişisel veriler şunlardır: Kimlik bilgileri (Ad, Soyad, TCKN/VKN), İletişim bilgileri (Adres, E-posta, Telefon), Müşteri işlem bilgileri (Sipariş geçmişi, Kargo takip no, İade talepleri), Finansal bilgiler (Fatura bilgileri, ödeme onay durumları), İşlem güvenliği (IP adresi, bağlantı ve çerez kayıtları).
          </p>
        </div>

        {/* 3. Kişisel Verilerin İşlenme Amaçları */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">3. Kişisel Verilerin İşlenme Amaçları</h3>
          <p className="mt-2 text-xs">
            Kişisel verileriniz; e-ticaret faaliyetlerimizin yürütülmesi, sipariş edilen ürünlerin paketlenmesi ve adresinize DHL Kargo ile sevk edilmesi, fatura tanzimi, satış sonrası destek ve iade süreçlerinin yönetilmesi, yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
          </p>
        </div>

        {/* 4. Verilerin Aktarımı */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">4. Verilerin Aktarımı</h3>
          <p className="mt-2 text-xs">
            Kişisel verileriniz yalnızca siparişinizin ifası için zorunlu olan anlaşmalı kargo firmamız DHL Kargo&apos;ya, 256-bit SSL güvenlikli Sanal POS ödeme kuruluşlarına ve yasal mevzuat sınırları dahilinde yetkili kamu kurum ve kuruluşlarına aktarılmaktadır.
          </p>
        </div>

        {/* 5. İletişim ve Başvuru */}
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">5. İletişim ve Başvuru Hakları</h3>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs mt-2">
            <p>KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki resmi kanallardan şirketimize başvurabilirsiniz:</p>
            <p><strong>Şirket:</strong> Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</p>
            <p><strong>Adres:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</p>
            <p><strong>Telefon / WhatsApp:</strong> +90 (507) 773 77 77</p>
            <p><strong>E-posta:</strong> aylindurmus54@gmail.com</p>
          </div>
        </div>

      </div>
    </div>
  );
}
