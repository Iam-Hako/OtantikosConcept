'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('order_number') || 'OTN-2026-78412';
  const email = searchParams?.get('email') || '';

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-fade-in">
        <CheckCircle2 className="w-12 h-12 stroke-[2]" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Ödeme Onaylandı & Sipariş Alındı
        </span>
        <h1 className="text-3xl font-serif font-black text-stone-900">
          Teşekkür Ederiz, Siparişiniz Hazırlanıyor!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Sipariş detaylarınız ve faturanız {email ? <strong>{email}</strong> : 'e-posta'} adresinize iletildi.
        </p>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-md mx-auto space-y-3">
        <div className="text-xs text-stone-500 font-medium">Sipariş Takip Numaranız:</div>
        <div className="text-2xl font-mono font-black text-amber-700 tracking-wider select-all">
          {orderNumber}
        </div>
        <p className="text-[11px] text-stone-400">
          Bu kod ile kargonuzun her aşamasını canlı takip edebilirsiniz.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm text-left space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-700" />
          <span>Sipariş Süreci Canlı Takip Çizelgesi</span>
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold mx-auto flex items-center justify-center shadow-xs">
              ✓
            </div>
            <div className="font-bold text-stone-900 text-[11px]">Sipariş Alındı</div>
            <div className="text-[10px] text-stone-400">Ödeme onaylandı</div>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold mx-auto flex items-center justify-center animate-pulse">
              2
            </div>
            <div className="font-bold text-amber-800 text-[11px]">Hazırlanıyor</div>
            <div className="text-[10px] text-stone-400">Tahtakale depomuzda</div>
          </div>

          <div className="space-y-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold mx-auto flex items-center justify-center">
              3
            </div>
            <div className="font-semibold text-stone-600 text-[11px]">Kargoya Verildi</div>
            <div className="text-[10px] text-stone-400">Takip no atanacak</div>
          </div>

          <div className="space-y-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold mx-auto flex items-center justify-center">
              4
            </div>
            <div className="font-semibold text-stone-600 text-[11px]">Teslim Edildi</div>
            <div className="text-[10px] text-stone-400">Alıcıya teslim</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/siparis-takip?order_number=${orderNumber}&email=${encodeURIComponent(email)}`}
          className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Siparişi Canlı Takip Et</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Alışverişe Devam Et</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Sipariş bilgileri yükleniyor...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
