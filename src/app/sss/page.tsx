"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Siparişler ne kadar sürede kargoya verilir?",
      a: "Verdiğiniz siparişler en geç 1-2 iş günü içerisinde özenle paketlenerek kargoya teslim edilmektedir.",
    },
    {
      q: "Kargo ücreti ne kadardır?",
      a: "Tüm Türkiye geneline sabit kargo ücretimiz 49.90 TL'dir.",
    },
    {
      q: "Ürünler orijinal ve kaliteli midir?",
      a: "Evet, OtantikosConcept olarak satışa sunduğumuz tüm bijuteri, hediyelik eşya ve trend oyuncak ürünleri yüksek kalite standartlarına sahiptir.",
    },
    {
      q: "İade veya değişim nasıl yapabilirim?",
      a: "Ürününüzü teslim aldığınız tarihten itibaren 14 gün içerisinde ambalajı bozulmamış şekilde iade edebilir veya değiştirebilirsiniz.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-full bg-white border border-[#E6DCD3] text-[#3E2E28] hover:bg-[#EAE0D5] transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#3E2E28] flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-[#C86D51]" /> Sıkça Sorulan Sorular
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#3E2E28]">{faq.q}</h3>
            <p className="text-sm text-[#7C6354] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
