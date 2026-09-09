'use client';

import React, { useState, useEffect } from 'react';

export type LuxuryLogoConcept =
  | 'haute-monogram'   // 01. Haute Monogram (Lüks Siyah "OC" Monogramı)
  | 'swiss-atelier'    // 02. Swiss Atelier (İsviçre Saat & Tasarım Atölyesi)
  | 'noir-champagne'   // 03. Noir & Champagne (Siyah & Şampanya Altını Madalyon)
  | 'minimal-crescent' // 04. Minimal Crescent (Avangart & Sade Siyah Hilal Halka)
  | 'parisian-seal'    // 05. Parisian Atelier Seal (Parizyen Tasarım & Konsept Mührü)
  | 'velvet-crimson';  // 06. Velvet Crimson (Derin Bordo & Platin Prestij Arması)

export interface LuxuryLogoMeta {
  id: LuxuryLogoConcept;
  number: string;
  name: string;
  tag: string;
  style: string;
  description: string;
}

export const LUXURY_CONCEPTS: LuxuryLogoMeta[] = [
  {
    id: 'haute-monogram',
    number: '01',
    name: 'Haute "OC" Monogramı',
    tag: 'Haute Couture / Lüks',
    style: 'Obsidian Siyahı & İnce Vektörel Çizgiler',
    description: 'Paris ve Milano lüks moda evleri tarzında, kusursuz oranlarla iç içe geçmiş zarif "O" ve "C" harfleri, mikro pusula noktaları ve merkez pırlanta detayı. Ağırbaşlı, zamansız ve çok şık.',
  },
  {
    id: 'swiss-atelier',
    number: '02',
    name: 'Swiss Atelier & Tasarım Mührü',
    tag: 'İsviçre Saat & Atölye',
    style: 'Hassas Çember & Meridyen Çizgileri',
    description: 'Lüks saat ve mimari tasarım atölyelerinden ilham alan 12 kadran çizgisi, merkezde geometrik kusursuz çember ve parıltı yıldızı.',
  },
  {
    id: 'noir-champagne',
    number: '03',
    name: 'Noir & Şampanya Altını',
    tag: 'Mat Siyah & Altın Varak',
    style: 'Derin Mat Siyah (#0f172a) & Şampanya Altını (#d4af37)',
    description: 'Mat gece siyahı dairesel madalyon üzerine şampanya altını ince bordürler ve beyaz/altın iç içe geçmiş prestij monogramı.',
  },
  {
    id: 'minimal-crescent',
    number: '04',
    name: 'Minimal Crescent Halka',
    tag: 'Avangart & Modern Minimalizm',
    style: 'Saf Siyah & Beyaz Kontrastı',
    description: 'Celine ve Apple esintili, sıfır fazlalık, tek bir kusursuz siyah daire, dinamik beyaz negatif alan hilali ve odak noktası.',
  },
  {
    id: 'parisian-seal',
    number: '05',
    name: 'Parizyen Konsept Mührü',
    tag: 'Parizyen Parfüm & Atölye',
    style: 'İnce Tipografik Çember & Serif "O"',
    description: 'Diptyque ve Byredo tarzı, çember boyunca zarif harf aralıklı OTANTIKOS CONCEPT yazısı ve merkezde klasik yüksek moda "O" harfi.',
  },
  {
    id: 'velvet-crimson',
    number: '06',
    name: 'Velvet Crimson & Platin',
    tag: 'Kadife Bordo & Platin',
    style: 'Derin Şarap Bordosu (#881337) & Platin Beyazı',
    description: 'Koyu kadife şarap bordosu zemin, platin çift halka ve ince hatlı monogram. Son derece asil, zengin ve elit bir görünüm.',
  },
];

interface LogoProps {
  concept?: LuxuryLogoConcept | string;
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
  const [selectedConcept, setSelectedConcept] = useState<LuxuryLogoConcept>('haute-monogram');

  useEffect(() => {
    if (concept && isValidLuxuryConcept(concept)) {
      setSelectedConcept(concept as LuxuryLogoConcept);
      return;
    }
    // Read from localStorage
    try {
      const stored = localStorage.getItem('otantikos_active_logo');
      if (stored && isValidLuxuryConcept(stored)) {
        setSelectedConcept(stored as LuxuryLogoConcept);
      }
    } catch {}

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('otantikos_active_logo');
        if (stored && isValidLuxuryConcept(stored)) {
          setSelectedConcept(stored as LuxuryLogoConcept);
        }
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

  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* CIRCULAR LUXURY EMBLEM */}
      <div 
        className={`${dimensions.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-2xs`}
        title="Otantikos Concept"
      >
        <LuxuryLogoIconRender concept={selectedConcept} />
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

function isValidLuxuryConcept(id: string): boolean {
  return [
    'haute-monogram',
    'swiss-atelier',
    'noir-champagne',
    'minimal-crescent',
    'parisian-seal',
    'velvet-crimson',
  ].includes(id);
}

/**
 * Universal Icon Switcher for all Luxury Concepts
 */
export function LuxuryLogoIconRender({ concept }: { concept: LuxuryLogoConcept }) {
  switch (concept) {
    case 'haute-monogram':
      return <HauteMonogramIcon />;
    case 'swiss-atelier':
      return <SwissAtelierIcon />;
    case 'noir-champagne':
      return <NoirChampagneIcon />;
    case 'minimal-crescent':
      return <MinimalCrescentIcon />;
    case 'parisian-seal':
      return <ParisianSealIcon />;
    case 'velvet-crimson':
      return <VelvetCrimsonIcon />;
    default:
      return <HauteMonogramIcon />;
  }
}

// -------------------------------------------------------------
// 6 METICULOUSLY CRAFTED HAUTE / LUXURY CORPORATE SVG DESIGNS
// -------------------------------------------------------------

/** 01. Haute "OC" Monogramı (Zarif Lüks Monogram) */
export function HauteMonogramIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Outer Hairline Precision Circle */}
      <circle cx="24" cy="24" r="22.5" stroke="#111827" strokeWidth="1.2" />
      {/* Inner Delicate Dash Accent */}
      <circle cx="24" cy="24" r="19.5" stroke="#111827" strokeWidth="0.6" strokeDasharray="1.5 2.5" opacity="0.4" />
      
      {/* Architectural Intertwined 'O' & 'C' */}
      <ellipse cx="24" cy="24" rx="10.5" ry="12.5" stroke="#111827" strokeWidth="1.8" fill="none" />
      <path 
        d="M 27.5,15 C 19.5,15 16,18.5 16,24 C 16,29.5 19.5,33 27.5,33" 
        stroke="#111827" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Center Fine Diamond Accent */}
      <path d="M 24,22 L 25.4,24 L 24,26 L 22.6,24 Z" fill="#111827" />
      
      {/* Cardinal Precision Micro-Dots */}
      <circle cx="24" cy="7.2" r="0.9" fill="#111827" />
      <circle cx="24" cy="40.8" r="0.9" fill="#111827" />
      <circle cx="7.2" cy="24" r="0.9" fill="#111827" />
      <circle cx="40.8" cy="24" r="0.9" fill="#111827" />
    </svg>
  );
}

/** 02. Swiss Atelier & Tasarım Mührü (İsviçre Saat & Atölye) */
export function SwissAtelierIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Precision Circular Bezel */}
      <circle cx="24" cy="24" r="22.5" stroke="#111827" strokeWidth="1.4" />
      
      {/* 4 Cardinal Hash Marks */}
      <line x1="24" y1="3.5" x2="24" y2="6.5" stroke="#111827" strokeWidth="1.4" />
      <line x1="24" y1="41.5" x2="24" y2="44.5" stroke="#111827" strokeWidth="1.4" />
      <line x1="3.5" y1="24" x2="6.5" y2="24" stroke="#111827" strokeWidth="1.4" />
      <line x1="41.5" y1="24" x2="44.5" y2="24" stroke="#111827" strokeWidth="1.4" />
      
      {/* Inner Technical Ring */}
      <circle cx="24" cy="24" r="16" stroke="#111827" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
      
      {/* Geometric 'O' with Compass Needle */}
      <circle cx="24" cy="24" r="10" stroke="#111827" strokeWidth="2" fill="none" />
      <line x1="24" y1="10" x2="24" y2="16" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="24" y1="32" x2="24" y2="38" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" />
      
      {/* Center 8-Point Star Facet */}
      <polygon points="24,20 25.2,22.8 28,24 25.2,25.2 24,28 22.8,25.2 20,24 22.8,22.8" fill="#111827" />
    </svg>
  );
}

/** 03. Noir & Şampanya Altını (Mat Siyah & Altın Varak) */
export function NoirChampagneIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Deep Matte Noir Circle */}
      <circle cx="24" cy="24" r="23" fill="#0f172a" />
      
      {/* Champagne Gold Double Ring */}
      <circle cx="24" cy="24" r="20.5" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.85" />
      <circle cx="24" cy="24" r="18.5" stroke="#d4af37" strokeWidth="0.6" strokeDasharray="2 2.5" strokeOpacity="0.5" />
      
      {/* Intertwined Gold/White Monogram */}
      <circle cx="24" cy="24" r="12" stroke="#d4af37" strokeWidth="1.8" fill="none" />
      <path 
        d="M 27.5,15.5 C 20.5,15.5 17,19 17,24 C 17,29 20.5,32.5 27.5,32.5" 
        stroke="white" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        fill="none" 
      />
      <circle cx="24" cy="24" r="2.2" fill="#d4af37" />
    </svg>
  );
}

/** 04. Minimal Crescent Halka (Avangart & Modern Minimalizm) */
export function MinimalCrescentIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Deep Obsidian Black Circle */}
      <circle cx="24" cy="24" r="23" fill="#18181b" />
      
      {/* Dynamic Optical Lens Cutout */}
      <circle 
        cx="24" 
        cy="24" 
        r="14" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeDasharray="72 20" 
        strokeLinecap="round" 
        fill="none" 
        transform="rotate(-35 24 24)" 
      />
      
      {/* Pure Focal Point */}
      <circle cx="24" cy="24" r="4.5" fill="white" />
      <circle cx="24" cy="24" r="2" fill="#18181b" />
    </svg>
  );
}

/** 05. Parisian Atelier Seal (Parizyen Konsept Mührü) */
export function ParisianSealIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <path id="parisianTop" d="M 6.5,24 A 17.5,17.5 0 0,1 41.5,24" fill="none" />
        <path id="parisianBot" d="M 41.5,24 A 17.5,17.5 0 0,1 6.5,24" fill="none" />
      </defs>
      
      {/* Outer Precision Ring */}
      <circle cx="24" cy="24" r="22.5" stroke="#111827" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="14.5" stroke="#111827" strokeWidth="0.8" />
      
      {/* Curved Editorial Text */}
      <text fill="#111827" fontSize="3.8" fontWeight="800" letterSpacing="1.2">
        <textPath href="#parisianTop" startOffset="50%" textAnchor="middle">
          OTANTIKOS
        </textPath>
      </text>
      <text fill="#111827" fontSize="3.2" fontWeight="700" letterSpacing="1">
        <textPath href="#parisianBot" startOffset="50%" textAnchor="middle">
          CONCEPT • 2024
        </textPath>
      </text>
      
      {/* Center High-Fashion 'O' Letter */}
      <text x="24" y="27.5" fill="#111827" fontSize="10.5" fontFamily="serif" fontWeight="900" textAnchor="middle">
        O
      </text>
    </svg>
  );
}

/** 06. Velvet Crimson & Platin (Kadife Bordo & Platin) */
export function VelvetCrimsonIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="velvetGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#881337" />
          <stop offset="1" stopColor="#4c0519" />
        </linearGradient>
      </defs>
      
      {/* Deep Wine / Velvet Crimson Circle */}
      <circle cx="24" cy="24" r="23" fill="url(#velvetGrad)" />
      
      {/* Platinum Hairline Rings */}
      <circle cx="24" cy="24" r="20" stroke="#fecdd3" strokeWidth="1" strokeOpacity="0.8" />
      <circle cx="24" cy="24" r="18" stroke="#fecdd3" strokeWidth="0.6" strokeDasharray="2 2.5" strokeOpacity="0.5" />
      
      {/* Slender Platinum Monogram */}
      <circle cx="24" cy="24" r="11.5" stroke="white" strokeWidth="2" fill="none" />
      <path 
        d="M 27.5,16.5 C 20.5,16.5 17,19.5 17,24 C 17,28.5 20.5,31.5 27.5,31.5" 
        stroke="#fecdd3" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        fill="none" 
      />
      <circle cx="24" cy="24" r="1.8" fill="white" />
    </svg>
  );
}

// Backward compatibility exports
export const RoundSealIcon = HauteMonogramIcon;
export const RoundMonogramIcon = HauteMonogramIcon;
export const RoundMinimalIcon = SwissAtelierIcon;
export const SmileBagIcon = HauteMonogramIcon;
export const GiftRibbonIcon = NoirChampagneIcon;
export const KawaiiMascotIcon = MinimalCrescentIcon;
export const LogoIcon01 = HauteMonogramIcon;
export const LogoIcon02 = SwissAtelierIcon;
export const LogoIcon03 = NoirChampagneIcon;
export const LogoIcon04 = MinimalCrescentIcon;
export const LogoIcon05 = ParisianSealIcon;
export const LogoIcon06 = VelvetCrimsonIcon;
export const LogoIcon07 = HauteMonogramIcon;
export const LogoIcon08 = SwissAtelierIcon;
export const LogoIcon09 = NoirChampagneIcon;
export const LogoIcon10 = MinimalCrescentIcon;
export const LogoIcon11 = ParisianSealIcon;
export const LogoIcon12 = VelvetCrimsonIcon;
