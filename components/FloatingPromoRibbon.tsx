'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function FloatingPromoRibbon() {
  return (
    <aside aria-label="Web'e Özel Kampanyalar" className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:block">
      <Link
        href="/kategori/tum-urunler"
        className="group flex flex-col items-center bg-gradient-to-b from-amber-400 via-rose-500 to-red-600 text-white py-3.5 px-1.5 rounded-l-2xl shadow-xl hover:shadow-2xl hover:px-2.5 transition-all duration-300 border-l border-y border-white/40 cursor-pointer"
        title="Web'e Özel Fırsatlar"
      >
        {/* Star Icon */}
        <div className="w-6 h-6 rounded-full bg-white/90 text-amber-500 flex items-center justify-center mb-2 shadow-xs group-hover:rotate-12 group-hover:scale-110 transition-transform">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
        </div>

        {/* Vertical Text */}
        <span
          className="text-[10px] font-black tracking-wider uppercase text-white drop-shadow-sm select-none"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          SEPETTE SÜRPRİZ İNDİRİM • WEB&apos;E ÖZEL
        </span>

        {/* Bottom Arrow */}
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-2 group-hover:bg-white group-hover:text-red-600 transition-colors">
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </aside>
  );
}
