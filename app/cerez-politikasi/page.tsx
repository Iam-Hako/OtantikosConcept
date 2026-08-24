'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-700" />
          <span>Çerez (Cookie) Politikası</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">Sitemizde Kullanılan Çerezler Hakkında Bilgilendirme</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-stone-200">
        <p>
          Otantikos Concept olarak web sitemizde oturum sürekliliğini sağlamak, sepetinizi ve favori ürünlerinizi hafızada tutmak, canlı destek mesajlaşmasını sürdürmek ve ziyaretçi deneyimini optimize etmek amacıyla zorunlu ve işlevsel çerezler kullanılmaktadır.
        </p>
        <p>
          Tarayıcı ayarlarınızdan dilediğiniz an çerez tercihlerinizi değiştirebilir veya silebilirsiniz.
        </p>
      </div>
    </div>
  );
}
