'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Layers, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import Logo, { LogoConcept, LOGO_CONCEPTS, LogoIconRender } from '@/components/Logo';

export default function LogoPreviewPage() {
  const [activeConcept, setActiveConcept] = useState<LogoConcept>('concept-01');
  const [appliedConcept, setAppliedConcept] = useState<LogoConcept>('concept-01');
  const [justApplied, setJustApplied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('otantikos_active_logo') as LogoConcept;
      if (stored) {
        setActiveConcept(stored);
        setAppliedConcept(stored);
      }
    } catch {}
  }, []);

  const handleApplyLogo = (conceptId: LogoConcept) => {
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

  const selectedMeta = LOGO_CONCEPTS.find((c) => c.id === activeConcept) || LOGO_CONCEPTS[0];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-14">
        
        {/* TOP HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#e60012] border border-red-200 text-xs font-bold rounded-full shadow-2xs">
            <Building2 className="w-4 h-4" />
            <span>Otantikos Concept • 12 Farklı Yuvarlak Şirket Logosu Koleksiyonu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-stone-900 tracking-tight leading-tight">
            Şirketiniz İçin 12 Yuvarlak Logo Tasarımı
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
            İstediğiniz <strong>dairesel, resmi ve kurumsal şirket logosu</strong> için 12 farklı tasarım hazırlandı. Aşağıdan dilediğiniz logoyu inceleyebilir ve <strong>"Bu Logoyu Sitede Aktif Et"</strong> butonuna basarak anında sitenizin üst menüsünde ve altında görebilirsiniz.
          </p>

          {/* ACTIVE STATUS BANNER */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-stone-900 text-white rounded-2xl shadow-sm text-xs">
              <span className="text-stone-400">Şu An Sitede Aktif Olan Logo:</span>
              <span className="font-bold text-[#e60012] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                #{LOGO_CONCEPTS.find(c => c.id === appliedConcept)?.number} - {LOGO_CONCEPTS.find(c => c.id === appliedConcept)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* 12 LOGO INTERACTIVE GRID */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#e60012]" />
                <span>12 Kurumsal Konsept Listesi</span>
              </h2>
              <p className="text-xs text-stone-500">İncelemek istediğiniz logoya tıklayın veya doğrudan sitede aktifleştirin.</p>
            </div>
            <span className="text-xs font-mono font-bold text-stone-400 hidden sm:inline-block">12 / 12 Vektörel Tasarım</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {LOGO_CONCEPTS.map((c) => {
              const isSelected = activeConcept === c.id;
              const isApplied = appliedConcept === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConcept(c.id)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                    isSelected
                      ? 'border-[#e60012] bg-red-50/20 shadow-md ring-2 ring-red-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono font-black px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                      #{c.number}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isApplied 
                        ? 'bg-emerald-600 text-white' 
                        : isSelected 
                          ? 'bg-[#e60012] text-white' 
                          : 'bg-stone-100 text-stone-600'
                    }`}>
                      {isApplied ? '✓ Sitede Aktif' : c.tag}
                    </span>
                  </div>

                  {/* Logo Center Display */}
                  <div className="py-3 flex flex-col items-center justify-center">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-xs">
                      <LogoIconRender concept={c.id} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyLogo(c.id);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Şu An Sitede Aktif</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Bu Logoyu Sitede Aktif Et</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED LOGO LARGE SHOWCASE & MOCKUPS */}
        <div className="p-6 sm:p-12 rounded-3xl border border-stone-200 bg-stone-50/70 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black px-2.5 py-0.5 bg-[#e60012] text-white rounded-md">
                  #{selectedMeta.number}
                </span>
                <span className="text-xs font-bold text-[#e60012] uppercase tracking-wider">
                  Detaylı Canlı İnceleme
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mt-1">
                {selectedMeta.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedMeta.description}
              </p>
            </div>

            <button
              onClick={() => handleApplyLogo(selectedMeta.id)}
              className="px-6 py-3.5 bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Bu Logoyu Sitede Aktif Et</span>
            </button>
          </div>

          {/* Large Logo Showcase */}
          <div className="bg-white p-8 sm:p-16 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-6 shadow-xs">
            <Logo concept={activeConcept} size="xl" />
            <div className="text-center space-y-1 pt-2 border-t border-stone-100 max-w-lg">
              <span className="text-xs font-bold text-stone-800 tracking-wider uppercase">
                Otantikos Hediyelik Eşya Oyuncak Ticaret Ltd. Şti.
              </span>
              <p className="text-[11px] text-stone-400">
                Tahtakale / Eminönü • Resmi Kurumsal Marka İmzası
              </p>
            </div>
          </div>

          {/* REAL WORLD MOCKUPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mockup 1: Navbar Header Simulation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">1. Sitenin Üst Menüsünde (Navbar)</span>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <Logo concept={activeConcept} size="md" />
                <div className="flex items-center gap-3 text-stone-400 text-xs">
                  <span className="hidden sm:inline bg-stone-100 px-3 py-1.5 rounded-lg text-stone-500">Ürün Ara...</span>
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Dark Background / Gece Modu */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">2. Koyu / Siyah Zemin Üzerinde</span>
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between">
                <Logo concept={activeConcept} size="md" isDark={true} />
                <span className="text-[10px] text-stone-400 font-mono">Dark Mod Uyumu</span>
              </div>
            </div>

            {/* Mockup 3: Official Letterhead / Stamp */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">3. Resmi Sevkiyat & Fatura / Kargo Etiketi Kaşesi</span>
              <div className="bg-[#fef2f2] p-8 rounded-2xl border border-red-100 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 flex flex-col items-center">
                  <Logo concept={activeConcept} size="lg" />
                  <div className="mt-3 pt-3 border-t border-stone-100 text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-800 block">RESMİ SEVKİYAT VE TESCİL BELGESİ</span>
                    <span className="text-[9px] text-stone-400 font-mono">VKN: 6491340351 • MERSİS: 0649134035100001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 4: Favicon & App Icon Scales */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">4. Instagram Avatar & Mobil Favicon Ölçekleri</span>
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
                  <span className="text-[10px] text-stone-400 font-mono">Mobil App (48px)</span>
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

        {/* BOTTOM NOTIFICATION / TOAST */}
        {justApplied && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5" />
            <div className="text-xs">
              <span className="font-bold block">Tebrikler! Logo Başarıyla Seçildi!</span>
              <span className="text-emerald-100">Seçtiğiniz logo sitenizin tüm sayfalarında hemen aktif edildi.</span>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION */}
        <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Hangisini beğendiyseniz seçebilirsiniz</h4>
            <p className="text-xs text-stone-400 mt-0.5">
              İstediğiniz logonun altındaki "Bu Logoyu Sitede Aktif Et" butonuna tıkladığınızda tüm sitede canlıya yansır.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0"
          >
            Ana Sayfaya Dön ➔
          </Link>
        </div>

      </div>
    </div>
  );
}
