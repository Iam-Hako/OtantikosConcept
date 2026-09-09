'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Gem,
  Award
} from 'lucide-react';
import Logo, { LuxuryLogoConcept, LUXURY_CONCEPTS, LuxuryLogoIconRender } from '@/components/Logo';

export default function LogoPreviewPage() {
  const [activeConcept, setActiveConcept] = useState<LuxuryLogoConcept>('haute-monogram');
  const [appliedConcept, setAppliedConcept] = useState<LuxuryLogoConcept>('haute-monogram');
  const [justApplied, setJustApplied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('otantikos_active_logo') as LuxuryLogoConcept;
      if (stored && LUXURY_CONCEPTS.some(c => c.id === stored)) {
        setActiveConcept(stored);
        setAppliedConcept(stored);
      }
    } catch {}
  }, []);

  const handleApplyLogo = (conceptId: LuxuryLogoConcept) => {
    try {
      localStorage.setItem('otantikos_active_logo', conceptId);
      window.dispatchEvent(new Event('otantikos_logo_changed'));
      setAppliedConcept(conceptId);
      setActiveConcept(conceptId);
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedMeta = LUXURY_CONCEPTS.find((c) => c.id === activeConcept) || LUXURY_CONCEPTS[0];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14">
        
        {/* EDITORIAL LUXURY HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold rounded-full">
            <Gem className="w-3.5 h-3.5 text-stone-700" />
            <span>Haute Couture & Kurumsal Şıklık</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
            Şık & Lüks Yuvarlak Şirket Logoları
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl mx-auto">
            Çocuksu veya oyuncak perakende havasından tamamen arındırılmış; <strong>zarif, yüksek moda, mimari ve ağırbaşlı</strong> 6 farklı dairesel şirket kimliği tasarlandı.
          </p>

          {/* ACTIVE STATUS BANNER */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-stone-900 text-white rounded-full shadow-xs text-xs">
              <span className="text-stone-400">Canlıdaki Logo:</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                #{LUXURY_CONCEPTS.find(c => c.id === appliedConcept)?.number} - {LUXURY_CONCEPTS.find(c => c.id === appliedConcept)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* 6 LUXURY LOGO INTERACTIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LUXURY_CONCEPTS.map((c) => {
            const isSelected = activeConcept === c.id;
            const isApplied = appliedConcept === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setActiveConcept(c.id)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-5 relative group ${
                  isSelected
                    ? 'border-stone-900 bg-stone-50/70 shadow-md ring-1 ring-stone-900/10'
                    : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/40'
                }`}
              >
                {/* Top Number & Tag */}
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md">
                    #{c.number}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isApplied 
                      ? 'bg-emerald-700 text-white' 
                      : isSelected 
                        ? 'bg-stone-900 text-white' 
                        : 'bg-stone-100 text-stone-600'
                  }`}>
                    {isApplied ? '✓ Sitede Aktif' : c.tag}
                  </span>
                </div>

                {/* Center High-End Render */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 transition-transform duration-300 group-hover:scale-105 drop-shadow-2xs">
                    <LuxuryLogoIconRender concept={c.id} />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 mt-3">{c.style}</span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-stone-900 text-base">
                    {c.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyLogo(c.id);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-900 hover:bg-stone-800 active:scale-95 text-white shadow-xs'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sitede Aktif</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bu Logoyu Sitede Aktif Et</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SELECTED LOGO HIGH-END SHOWCASE & MOCKUPS */}
        <div className="p-6 sm:p-12 rounded-3xl border border-stone-200 bg-stone-50/50 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black px-2 py-0.5 bg-stone-900 text-white rounded">
                  #{selectedMeta.number}
                </span>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Seçili Şık Tasarım
                </span>
              </div>
              <h2 className="text-2xl font-serif font-black text-stone-900 mt-1">
                {selectedMeta.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedMeta.description}
              </p>
            </div>

            <button
              onClick={() => handleApplyLogo(selectedMeta.id)}
              className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Bu Logoyu Sitede Aktif Et</span>
            </button>
          </div>

          {/* Large Logo Showcase */}
          <div className="bg-white p-10 sm:p-16 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-6 shadow-2xs">
            <Logo concept={activeConcept} size="xl" />
            <div className="text-center space-y-0.5 pt-3 border-t border-stone-100 max-w-sm">
              <span className="text-xs font-bold text-stone-900 tracking-[0.2em] uppercase">
                Otantikos Concept
              </span>
              <p className="text-[11px] text-stone-400 font-mono tracking-wider">
                İstanbul • Haute Retail & Design
              </p>
            </div>
          </div>

          {/* REAL WORLD MOCKUPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mockup 1: Navbar Header Simulation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">1. Sitenin Üst Menüsünde (Navbar Duruşu)</span>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <Logo concept={activeConcept} size="md" />
                <div className="flex items-center gap-3 text-stone-400 text-xs">
                  <span className="hidden sm:inline bg-stone-50 border border-stone-200 px-3.5 py-1.5 rounded-lg text-stone-400">Ara...</span>
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Dark Luxury Background */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">2. Koyu / Gece Zemininde</span>
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between">
                <Logo concept={activeConcept} size="md" isDark={true} />
                <span className="text-[10px] text-stone-400 font-mono">Lüks Gece Modu</span>
              </div>
            </div>

            {/* Mockup 3: Luxury Packaging / Box Mockup */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">3. Lüks Paket & Alışveriş Poşeti Baskısı</span>
              <div className="bg-stone-100 p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center">
                  <Logo concept={activeConcept} size="lg" />
                  <div className="mt-3 pt-3 border-t border-stone-100 text-center">
                    <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase">
                      Bespoke Packaging • Istanbul
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 4: Favicon & Social Profile Avatar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">4. Instagram & Mobil Uygulama Dairesel Avatarı</span>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 p-1 bg-stone-50 rounded-full border border-stone-200 flex items-center justify-center shadow-xs">
                    <Logo concept={activeConcept} size="lg" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Instagram (64px)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 p-1 bg-stone-50 rounded-full border border-stone-200 flex items-center justify-center shadow-xs">
                    <Logo concept={activeConcept} size="md" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">App (48px)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 p-0.5 bg-stone-50 rounded-full border border-stone-200 flex items-center justify-center shadow-xs">
                    <Logo concept={activeConcept} size="sm" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Favicon (32px)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM TOAST */}
        {justApplied && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-stone-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div className="text-xs">
              <span className="font-bold block">Tebrikler! Şık Logo Sitede Aktif Edildi!</span>
              <span className="text-stone-300">Seçtiğiniz logo sitenizin üst menüsünde ve alt kısmında hemen uygulandı.</span>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION */}
        <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Hangisini beğendiyseniz tek tıkla seçebilirsiniz</h4>
            <p className="text-xs text-stone-400 mt-0.5">
              İstediğiniz logonun altındaki "Bu Logoyu Sitede Aktif Et" butonuna bastığınız anda tüm sitede güncellenir.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-white hover:bg-stone-100 active:scale-95 text-stone-950 font-bold text-xs rounded-xl shadow-md transition shrink-0"
          >
            Ana Sayfayı Gör ➔
          </Link>
        </div>

      </div>
    </div>
  );
}
