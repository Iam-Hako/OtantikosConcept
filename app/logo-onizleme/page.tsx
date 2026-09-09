'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, ArrowRight, ShoppingBag, Eye, Copy, Download, RefreshCw } from 'lucide-react';
import Logo, { LogoConcept, SmileBagIcon, GiftRibbonIcon, KawaiiMascotIcon } from '@/components/Logo';

export default function LogoPreviewPage() {
  const [activeConcept, setActiveConcept] = useState<LogoConcept>('smile-bag');
  const [copied, setCopied] = useState(false);

  const concepts = [
    {
      id: 'smile-bag' as LogoConcept,
      title: 'Konsept 1: Neşeli Alışveriş Çantası (Önerilen)',
      tag: 'Miniso / Pop Mart Tarzı',
      desc: 'Miniso kırmızısı yumuşak köşeli alışveriş çantası, beyaz çanta kulpu, sempatik kawaii gülümseme ve parıltı yıldızı. Peluş, oyuncak ve hediye dünyasına tam uyumlu neşeli ve samimi bir marka kimliği.',
      icon: SmileBagIcon,
    },
    {
      id: 'gift-ribbon' as LogoConcept,
      title: 'Konsept 2: "O" Monogram & Hediye Kurdelesi',
      tag: 'Modern Lifestyle & Gift',
      desc: 'Otantikos\'un "O" harfini zarif bir hediye kutusu ve fiyonk kurdelesiyle birleştiren modern, kurumsal ve şık monogram amblem.',
      icon: GiftRibbonIcon,
    },
    {
      id: 'kawaii-mascot' as LogoConcept,
      title: 'Konsept 3: Kawaii Maskot Amblemi',
      tag: 'Sevimli Peluş Maskot',
      desc: 'Japon kawaii kültüründen ilham alan sevimli peluş ayı maskot silüeti. Özellikle peluş ve blind box koleksiyonlarını vurgulayan tatlı bir imza.',
      icon: KawaiiMascotIcon,
    },
  ];

  const handleCopySvg = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* TOP INTRO */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#e60012] border border-red-200 text-xs font-bold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Otantikos Concept Yeni Logo Tasarımları</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
            Yeni Kurumsal Logo Seçenekleri
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Eski kutu içi yazılı "OTAN / TIKOS" tasarımı yerine, Miniso tarzı ikonik ambleme ve modern tipografiye sahip 3 farklı konsept hazırladık. Aşağıdan inceleyip sitenizde nasıl durduğunu canlı test edebilirsiniz.
          </p>
        </div>

        {/* CONCEPT SELECTOR TABS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {concepts.map((c) => {
            const isSelected = activeConcept === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConcept(c.id)}
                className={`text-left p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-[#e60012] bg-red-50/20 shadow-md ring-2 ring-red-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 p-1">
                    <c.icon />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isSelected ? 'bg-[#e60012] text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {c.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{c.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{c.desc}</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                  <span className={isSelected ? 'text-[#e60012]' : 'text-stone-400'}>
                    {isSelected ? '✓ Seçili Konsept' : 'İncelemek İçin Tıklayın'}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#e60012] translate-x-0.5' : 'text-stone-300'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* LIVE SHOWCASE CANVAS */}
        <div className="p-6 sm:p-10 rounded-3xl border border-stone-200 bg-stone-50/50 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#e60012] uppercase tracking-wider">Canlı Görünüm</span>
              <h2 className="text-xl font-bold text-stone-900 mt-0.5">Büyük Boyut & Tipografi Detayı</h2>
            </div>
            <span className="text-xs font-mono text-stone-400">Vektörel SVG • 4K Netlik</span>
          </div>

          {/* MAIN BIG LOGO DISPLAY */}
          <div className="bg-white p-8 sm:p-14 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-6 shadow-xs">
            <Logo concept={activeConcept} size="xl" />
            <p className="text-xs text-stone-400 text-center max-w-md">
              Kusursuz oranlar, net Miniso kırmızısı (#e60012), modern font ağırlıkları ve dengeli harf aralığı.
            </p>
          </div>

          {/* REAL WORLD MOCKUPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mockup 1: Navbar Header Simulation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">1. Sitenin Üst Menüsünde (Navbar)</span>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <Logo concept={activeConcept} size="md" />
                <div className="flex items-center gap-3 text-stone-400 text-xs">
                  <span className="hidden sm:inline bg-stone-100 px-3 py-1.5 rounded-lg">Arama Çubuğu...</span>
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

            {/* Mockup 3: Shopping Bag Retail Mockup */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">3. Mağaza Alışveriş Poşeti Baskısı</span>
              <div className="bg-[#fef2f2] p-8 rounded-2xl border border-red-100 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-4 border-2 border-stone-300 rounded-t-full" />
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 flex flex-col items-center">
                  <Logo concept={activeConcept} size="lg" />
                  <span className="text-[9px] text-stone-400 font-mono mt-3">Tahtakale • Eminönü / İstanbul</span>
                </div>
              </div>
            </div>

            {/* Mockup 4: Favicon & App Icon Scales */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">4. Favicon / Mobil Uygulama Ölçekleri</span>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 p-1 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-center">
                    <Logo concept={activeConcept} size="lg" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">64px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 p-1 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center">
                    <Logo concept={activeConcept} size="md" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">48px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 p-0.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-center">
                    <Logo concept={activeConcept} size="sm" showText={false} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">32px (Favicon)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Hangi logoyu daha çok beğendiniz?</h4>
            <p className="text-xs text-stone-400 mt-0.5">
              1. Konsept ("Neşeli Çanta") sitemizin üst menüsü ve alt kısmına otomatik olarak entegre edilmiştir.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0"
          >
            Ana Sayfada Görünümüne Bak ➔
          </Link>
        </div>

      </div>
    </div>
  );
}
