import React from 'react';
import Link from 'next/link';
import { Compass, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-stone-100 text-stone-700 rounded-3xl flex items-center justify-center mx-auto border border-stone-200 shadow-inner">
          <Compass className="w-10 h-10 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            404 Sayfa Bulunamadı
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
            Aradığınız Sayfa Bulunamadı
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş ya da geçici olarak kullanım dışı kalmış olabilir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <Link
            href="/kategori/tumu"
            className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tüm Ürünler</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
