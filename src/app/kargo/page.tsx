"use client";

import React from "react";
import Link from "next/link";
import { Truck, ArrowLeft, ShieldCheck, Clock } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-full bg-white border border-[#E6DCD3] text-[#3E2E28] hover:bg-[#EAE0D5] transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#3E2E28] flex items-center gap-2">
          <Truck className="w-7 h-7 text-[#C86D51]" /> Kargo ve Teslimat Bilgileri
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8F5F0] p-6 rounded-2xl border border-[#E6DCD3] space-y-2">
            <Clock className="w-6 h-6 text-[#C86D51]" />
            <h3 className="font-serif text-base font-bold text-[#3E2E28]">Teslimat Süresi</h3>
            <p className="text-xs text-[#7C6354] leading-relaxed">
              Siparişleriniz 1-2 iş günü içinde kargoya verilir. Kargo firması bulunduğunuz il ve ilçeye göre 1-3 iş günü içinde teslimatı gerçekleştirir.
            </p>
          </div>

          <div className="bg-[#F8F5F0] p-6 rounded-2xl border border-[#E6DCD3] space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#C86D51]" />
            <h3 className="font-serif text-base font-bold text-[#3E2E28]">Sabit Kargo Ücreti</h3>
            <p className="text-xs text-[#7C6354] leading-relaxed">
              Tüm siparişlerinizde sabit kargo ücreti 49.90 TL olarak uygulanmaktadır. Ürünleriniz özenle paketlenir.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F8F5F0]">
          <h2 className="font-serif text-xl font-bold text-[#3E2E28]">Kargo Takibi</h2>
          <p className="text-xs text-[#7C6354] leading-relaxed">
            Siparişiniz kargoya verildiğinde size e-posta ve sms yoluyla kargo takip numarası iletilir. Hesabım sekmesinden de siparişinizin durumunu takip edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
