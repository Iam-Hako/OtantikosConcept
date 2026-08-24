'use client';

import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <Lock className="w-8 h-8 text-amber-700" />
          <span>Gizlilik ve Güvenlik Politikası</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Müşteri Bilgilerinin Korunması ve Güvenliği</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-stone-200">
        <p>
          Otantikos Concept, ziyaretçilerinin ve müşterilerinin kişisel gizliliğine azami saygı göstermektedir. Sitemiz üzerinden ilettiğiniz hiçbir iletişim ve adres bilgisi üçüncü şahıslarla reklam veya pazarlama amacıyla paylaşılmaz.
        </p>
        <p>
          Ödeme esnasında girdiğiniz kredi kartı bilgileri sistemlerimizde kesinlikle saklanmaz; doğrudan 256-Bit SSL şifrelemeyle banka sanal POS altyapısına iletilir.
        </p>
      </div>
    </div>
  );
}
