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
        <p className="text-xs text-stone-500 mt-1">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        <h3 className="font-bold text-stone-900 text-base">1. Veri Sorumlusu Sıfatı</h3>
        <p>
          Otantikos Concept ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar ve yasal çerçevede işlemekte, saklamakta ve korumaktayız.
        </p>

        <h3 className="font-bold text-stone-900 text-base">2. İşlenen Kişisel Veriler</h3>
        <p>
          Tarafımızca işlenen kişisel veriler şunlardır: Kimlik bilgileri (Ad, Soyad, TCKN), İletişim bilgileri (Adres, E-posta, Telefon), Müşteri işlem bilgileri (Sipariş geçmişi, Kargo takip no, İade talepleri), Finansal bilgiler (Fatura bilgileri, ödeme onay durumları), İşlem güvenliği (IP adresi, çerez kayıtları).
        </p>

        <h3 className="font-bold text-stone-900 text-base">3. Kişisel Verilerin İşlenme Amaçları</h3>
        <p>
          Kişisel verileriniz; e-ticaret faaliyetlerimizin yürütülmesi, sipariş edilen ürünlerin paketlenmesi ve adresinize sevk edilmesi, fatura tanzimi, satış sonrası destek ve iade süreçlerinin yönetilmesi, yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
        </p>

        <h3 className="font-bold text-stone-900 text-base">4. Verilerin Aktarımı</h3>
        <p>
          Kişisel verileriniz yalnızca siparişinizin ifası için zorunlu olan anlaşmalı kargo firmalarına, güvenli sanal POS ödeme kuruluşlarına ve yasal mercilere mevzuat sınırları dahilinde aktarılmaktadır.
        </p>

        <h3 className="font-bold text-stone-900 text-base">5. İletişim ve Başvuru</h3>
        <p>
          KVKK kapsamındaki haklarınızı kullanmak için <strong>Tahtakale Tanburacı Han Eminönü / Fatih / İSTANBUL</strong> açık adresimiz veya <strong>+90 (507) 773 77 77</strong> telefon ve WhatsApp hattımız üzerinden şirketimize başvurabilirsiniz.
        </p>
      </div>
    </div>
  );
}
