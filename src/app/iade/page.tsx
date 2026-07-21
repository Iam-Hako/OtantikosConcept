"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-full bg-white border border-[#E6DCD3] text-[#3E2E28] hover:bg-[#EAE0D5] transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#3E2E28] flex items-center gap-2">
          <RefreshCw className="w-7 h-7 text-[#C86D51]" /> İade ve Değişim Koşulları
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#3E2E28]">14 Günlük İade Hakkı</h2>
          <p className="text-xs text-[#7C6354] leading-relaxed">
            OtantikosConcept'ten satın aldığınız ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilir veya değişim talep edebilirsiniz.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F8F5F0]">
          <h2 className="font-serif text-xl font-bold text-[#3E2E28]">İade Koşulları</h2>
          <ul className="space-y-2 text-xs text-[#7C6354]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>İade edilecek ürünün orijinal ambalajı veya kutusu bozulmamış olmalıdır.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Bijuteri ürünlerinde hijyen kuralları gereği kullanılmamış ve denenmemiş ürünler iade alınmaktadır.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>İade işlemi onaylandıktan sonra ürün bedeli 3 iş günü içinde ödeme yönteminize iade edilir.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
