import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-6">
      
      {/* Animated Glowing Logo Emblem */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Gold Halo */}
        <div className="absolute -inset-4 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
        
        {/* Spinning Amber Gradient Ring */}
        <div className="absolute -inset-2 rounded-3xl border-2 border-amber-500/40 border-t-amber-500 animate-spin" style={{ animationDuration: '1.8s' }} />

        {/* Logo Card */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-900 border border-amber-500/50 p-2.5 flex items-center justify-center shadow-2xl shadow-amber-950/30">
          <Image
            src="/images/logo.webp"
            alt="Otantikos Concept Yükleniyor"
            width={52}
            height={52}
            className="object-contain animate-pulse"
            priority
          />
        </div>
      </div>

      {/* Typography & Shimmer Indicator */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-bold text-amber-900 tracking-wide font-serif">
            OTANTİKOS CONCEPT
          </span>
        </div>
        <p className="text-xs text-stone-500 font-medium animate-pulse">
          İçerik ve ürünler hazırlanıyor, lütfen bekleyin...
        </p>
      </div>

      {/* Shimmer Skeleton Placeholder Grid */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 opacity-50 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 border border-stone-200 space-y-2.5 animate-pulse">
            <div className="aspect-square bg-stone-100 rounded-xl w-full" />
            <div className="h-3 bg-stone-100 rounded-md w-3/4" />
            <div className="h-4 bg-amber-100/60 rounded-md w-1/2" />
          </div>
        ))}
      </div>

    </div>
  );
}
