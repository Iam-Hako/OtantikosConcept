'use client';

import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <Lock className="w-8 h-8 text-amber-700" />
          <span>Gizlilik ve Güvenlik Politikası</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Müşteri Bilgilerinin Korunması, 256-Bit SSL Güvenliği ve Gizlilik İlkeleri</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed bg-white p-5 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
        
        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">1. Genel Gizlilik İlkesi</h3>
          <p className="mt-2 text-xs">
            <strong>Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</strong> (&quot;Otantikos Concept&quot;), ziyaretçilerinin ve müşterilerinin kişisel gizliliğine azami saygı göstermektedir. Sitemiz üzerinden ilettiğiniz hiçbir iletişim, sipariş ve adres bilgisi üçüncü şahıslarla reklam veya pazarlama amacıyla paylaşılmaz.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">2. Ödeme Güvenliği ve Kredi Kartı Gizliliği</h3>
          <p className="mt-2 text-xs">
            Ödeme esnasında girdiğiniz kredi kartı / banka kartı bilgileri sistemlerimizde kesinlikle kaydedilmez ve saklanmaz. Tüm ödeme işlemleri <strong>256-Bit SSL şifreleme</strong> sertifikası ve <strong>3D Secure</strong> korumalı Sanal POS altyapısı üzerinden doğrudan bankaya iletilir.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2">3. Kurumsal İletişim Bilgileri</h3>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs mt-2">
            <p><strong>Unvan:</strong> Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi</p>
            <p><strong>Adres:</strong> Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</p>
            <p><strong>Vergi Dairesi & VKN:</strong> Hocapaşa V.D. / 6491340351</p>
            <p><strong>Telefon / WhatsApp:</strong> +90 (507) 773 77 77</p>
            <p><strong>E-posta:</strong> aylindurmus54@gmail.com</p>
          </div>
        </div>

      </div>
    </div>
  );
}
