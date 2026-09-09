'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export type LogoConceptId =
  | 'png-logo-01'      // 01. Siyah & Şampanya Altını Lüks Monogram
  | 'png-logo-02'      // 02. Minimalist İsviçre Atölye Mührü
  | 'png-logo-03'      // 03. Kadife Bordo & Platin Kraliyet Arması
  | 'png-logo-04'      // 04. Parizyen Tipografik Mühür
  | 'png-logo-05'      // 05. Saf Minimalizm Hilal Halka (Avangart)
  | 'png-logo-06'      // 06. Zümrüt Yeşili & Gümüş İkili Halka
  | 'png-logo-07'      // 07. Fasetli Elmas & Prizma Mührü
  | 'png-logo-08'      // 08. Tarihi İpek Yolu Pusulası
  | 'png-logo-09'      // 09. Modern Monolit & Sonsuzluk
  | 'png-logo-10'      // 10. Platin Çift Halka & Geometrik Monogram
  | 'haute-monogram'   // Vektör: Haute Monogram
  | 'swiss-atelier'    // Vektör: Swiss Atelier
  | 'noir-champagne'   // Vektör: Noir & Champagne
  | 'minimal-crescent' // Vektör: Minimal Crescent
  | 'parisian-seal'    // Vektör: Parisian Seal
  | 'velvet-crimson';  // Vektör: Velvet Crimson

export const PNG_LOGOS = [
  {
    id: 'png-logo-01' as LogoConceptId,
    number: '01',
    name: 'Noir & Şampanya Altını Lüks Monogram',
    tag: 'Haute Lüks & Altın',
    image: '/images/logos/logo_01_noir_gold.png',
    description: 'Derin mat obsidian siyahı (#0f172a) zemin, şampanya altını çift çember, iç içe geçen modern "O" ve "C" harfleri ve merkez pırlanta detayı.',
  },
  {
    id: 'png-logo-02' as LogoConceptId,
    number: '02',
    name: 'İsviçre Saat & Hassas Tasarım Mührü',
    tag: 'Swiss Precision Atelier',
    image: '/images/logos/logo_02_swiss_atelier.png',
    description: 'Lüks İsviçre saat kadranı çizgileri, beyaz zemin üzerine keskin siyah halkalar, merkezde geometrik "O" ve kuzey-güney meridyenleri.',
  },
  {
    id: 'png-logo-03' as LogoConceptId,
    number: '03',
    name: 'Kadife Bordo & Platin Kraliyet Arması',
    tag: 'Royal Atelier & Bordo',
    image: '/images/logos/logo_03_velvet_crimson.png',
    description: 'Zengin şarap kadifesi bordo (#881337) zemin, platin çift halka, üstte 3 tepeli asil taç ve iç içe geçen kavisli monogram.',
  },
  {
    id: 'png-logo-04' as LogoConceptId,
    number: '04',
    name: 'Parizyen Tipografik Konsept Mührü',
    tag: 'Parisien Editorial Crest',
    image: '/images/logos/logo_04_parisian_crest.png',
    description: 'Byredo ve Diptyque tarzı zarif tipografik çember. Merkezde yüksek moda dev serif "O" ve "C" harfleri, üstte ve altta kavisli kurumsal unvan.',
  },
  {
    id: 'png-logo-05' as LogoConceptId,
    number: '05',
    name: 'Avangart Hilal & Odak Noktası',
    tag: 'Modern Minimalizm',
    image: '/images/logos/logo_05_minimal_crescent.png',
    description: 'Celine ve Apple tarzı modern minimalizm. Mat siyah dairesel gövde içinde dinamik beyaz hilal kavis ve merkez odak noktası.',
  },
  {
    id: 'png-logo-06' as LogoConceptId,
    number: '06',
    name: 'Zümrüt Yeşili & Gümüş İkili Halka',
    tag: 'Emerald & Platinum',
    image: '/images/logos/logo_06_emerald_silver.png',
    description: 'Derin asil zümrüt yeşili zemin, çift gümüş bordür ve iç içe geçen iki sonsuzluk çemberi. Prestijli ve sofistike.',
  },
  {
    id: 'png-logo-07' as LogoConceptId,
    number: '07',
    name: 'Fasetli Elmas Prizma Mührü',
    tag: 'Geometric Diamond',
    image: '/images/logos/logo_07_diamond_prism.png',
    description: 'Gece siyahı zemin üzerine geometrik fasetli elmas prizma çizgileri ve sağ üstte parıldayan elmas ışıltısı. Özel koleksiyon.',
  },
  {
    id: 'png-logo-08' as LogoConceptId,
    number: '08',
    name: 'Tarihi İpek Yolu Ticaret Pusulası',
    tag: 'Heritage & Pusula',
    image: '/images/logos/logo_08_silkroad_compass.png',
    description: 'Gece mavisi zemin üzerinde Tahtakale ve Eminönü ticaret mirasını simgeleyen 8 yönlü denizci ve ticaret pusulası yıldızı.',
  },
  {
    id: 'png-logo-09' as LogoConceptId,
    number: '09',
    name: 'Modern Monolit & Sonsuzluk Bağı',
    tag: 'Perpetual Monolith',
    image: '/images/logos/logo_09_infinite_monolith.png',
    description: 'Antrasit dairesel gövde üzerinde pürüzsüz beyaz sonsuzluk halkası. Sürekli yenilenen konsept ve tasarım dünyası.',
  },
  {
    id: 'png-logo-10' as LogoConceptId,
    number: '10',
    name: 'Platin Çift Halka & Geometrik Monogram',
    tag: 'Haute Monogram Atelier',
    image: '/images/logos/logo_10_platinum_monogram.png',
    description: 'Saf beyaz zemin üzerinde çift kalın siyah çember, mimari geometrik "O" ve "C" harfleri, ATELIER DE DESIGN kurumsal imzası.',
  },
];

interface LogoProps {
  concept?: LogoConceptId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function Logo({
  concept,
  size = 'md',
  showText = true,
  className = '',
  isDark = false,
}: LogoProps) {
  const [selectedConcept, setSelectedConcept] = useState<string>(concept || 'png-logo-01');

  useEffect(() => {
    if (concept) {
      setSelectedConcept(concept);
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('otantikos_active_logo');
      if (stored) setSelectedConcept(stored);
    } catch {}

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('otantikos_active_logo');
        if (stored) setSelectedConcept(stored);
      } catch {}
    };

    window.addEventListener('otantikos_logo_changed', handleStorageChange);
    return () => window.removeEventListener('otantikos_logo_changed', handleStorageChange);
  }, [concept]);

  // Dimensions
  const dimensions = {
    xs: { icon: 'w-7 h-7', title: 'text-sm tracking-[0.08em]', sub: 'text-[7px] tracking-[0.25em]' },
    sm: { icon: 'w-9 h-9', title: 'text-base tracking-[0.1em]', sub: 'text-[8px] tracking-[0.3em]' },
    md: { icon: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-lg sm:text-xl tracking-[0.12em]', sub: 'text-[8.5px] tracking-[0.35em]' },
    lg: { icon: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-2xl sm:text-3xl tracking-[0.14em]', sub: 'text-xs tracking-[0.4em]' },
    xl: { icon: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-3xl sm:text-4xl tracking-[0.16em]', sub: 'text-sm tracking-[0.45em]' },
  }[size];

  const matchedPng = PNG_LOGOS.find(p => p.id === selectedConcept);

  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* CIRCULAR LUXURY EMBLEM */}
      <div 
        className={`${dimensions.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-2xs relative`}
        title="Otantikos Concept"
      >
        {matchedPng ? (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image 
              src={matchedPng.image} 
              alt={matchedPng.name} 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 48px, 96px"
              priority
            />
          </div>
        ) : (
          <HauteMonogramVectorIcon />
        )}
      </div>

      {/* REFINED HAUTE TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-sans font-extrabold uppercase ${dimensions.title} ${
                isDark ? 'text-white' : 'text-stone-900 group-hover:text-stone-700'
              } transition-colors`}
            >
              OTANTİKOS
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
            <span className={`font-semibold uppercase text-stone-500 group-hover:text-stone-800 transition-colors ${dimensions.sub}`}>
              CONCEPT
            </span>
            <span className={`text-[7px] text-stone-300 ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              •
            </span>
            <span className={`text-[8px] font-medium text-stone-400 tracking-[0.2em] uppercase ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              İSTANBUL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Haute Monogram Vector Icon */
export function HauteMonogramVectorIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="24" cy="24" r="22.5" stroke="#111827" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="19.5" stroke="#111827" strokeWidth="0.6" strokeDasharray="1.5 2.5" opacity="0.4" />
      <ellipse cx="24" cy="24" rx="10.5" ry="12.5" stroke="#111827" strokeWidth="1.8" fill="none" />
      <path d="M 27.5,15 C 19.5,15 16,18.5 16,24 C 16,29.5 19.5,33 27.5,33" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 24,22 L 25.4,24 L 24,26 L 22.6,24 Z" fill="#111827" />
      <circle cx="24" cy="7.2" r="0.9" fill="#111827" />
      <circle cx="24" cy="40.8" r="0.9" fill="#111827" />
      <circle cx="7.2" cy="24" r="0.9" fill="#111827" />
      <circle cx="40.8" cy="24" r="0.9" fill="#111827" />
    </svg>
  );
}

// Backward compatibility exports
export const HauteMonogramIcon = HauteMonogramVectorIcon;
export const SwissAtelierIcon = HauteMonogramVectorIcon;
export const NoirChampagneIcon = HauteMonogramVectorIcon;
export const MinimalCrescentIcon = HauteMonogramVectorIcon;
export const ParisianSealIcon = HauteMonogramVectorIcon;
export const VelvetCrimsonIcon = HauteMonogramVectorIcon;
export const RoundSealIcon = HauteMonogramVectorIcon;
export const RoundMonogramIcon = HauteMonogramVectorIcon;
export const RoundMinimalIcon = HauteMonogramVectorIcon;
export const SmileBagIcon = HauteMonogramVectorIcon;
export const GiftRibbonIcon = HauteMonogramVectorIcon;
export const KawaiiMascotIcon = HauteMonogramVectorIcon;
export const LogoIcon01 = HauteMonogramVectorIcon;
export const LogoIcon02 = HauteMonogramVectorIcon;
export const LogoIcon03 = HauteMonogramVectorIcon;
export const LogoIcon04 = HauteMonogramVectorIcon;
export const LogoIcon05 = HauteMonogramVectorIcon;
export const LogoIcon06 = HauteMonogramVectorIcon;
export const LogoIcon07 = HauteMonogramVectorIcon;
export const LogoIcon08 = HauteMonogramVectorIcon;
export const LogoIcon09 = HauteMonogramVectorIcon;
export const LogoIcon10 = HauteMonogramVectorIcon;
export const LogoIcon11 = HauteMonogramVectorIcon;
export const LogoIcon12 = HauteMonogramVectorIcon;
export const LUXURY_CONCEPTS = PNG_LOGOS;
