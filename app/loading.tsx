import React from 'react';

export default function Loading() {
  return (
    <div className="w-full space-y-8 sm:space-y-12 pb-20 animate-pulse select-none">
      
      {/* 1. Stories Skeletons (Widescreen Top Bar) */}
      <section className="bg-white/80 backdrop-blur-md border-b border-amber-200/40 pt-4 pb-5">
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-100 to-orange-100 border-2 border-white shadow-xs" />
                <div className="w-12 h-2.5 bg-stone-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. "Kategorileri Keşfet" 6 Pastel Cards Skeleton */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border border-amber-200/60 shadow-lg shadow-orange-950/[0.02] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100" />
              <div className="h-5 w-36 sm:w-48 bg-stone-200 rounded-md" />
            </div>
            <div className="h-4 w-24 bg-stone-200 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              'bg-rose-100/60',
              'bg-purple-100/60',
              'bg-sky-100/60',
              'bg-amber-100/60',
              'bg-orange-100/60',
              'bg-emerald-100/60',
            ].map((bg, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div className={`w-full aspect-square rounded-2xl sm:rounded-3xl ${bg} border border-stone-200/50 p-4`} />
                <div className="h-3 w-20 bg-stone-200 rounded-full mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. "Öne Çıkan Ürünler" 6-Column Widescreen Skeleton Grid */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border border-amber-200/60 shadow-lg shadow-orange-950/[0.02] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-200" />
              <div className="h-6 w-44 bg-stone-200 rounded-md" />
            </div>
            <div className="h-4 w-20 bg-stone-200 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-3 space-y-3">
                <div className="aspect-square w-full bg-stone-100 rounded-xl" />
                <div className="h-3 bg-stone-200 rounded-md w-3/4" />
                <div className="h-4 bg-orange-100 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
