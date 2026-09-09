'use client';

import React, { useState, useEffect } from 'react';

export type LogoConcept =
  | 'concept-01' // 01. Resmi Şirket Arması & Mührü
  | 'concept-02' // 02. Prestij "OC" Lüks Monogramı
  | 'concept-03' // 03. Minimalist Zen Halka (Japon Perakende)
  | 'concept-04' // 04. Kraliyet Tacı & Defne Dalı Arması
  | 'concept-05' // 05. Tahtakale Ticaret & Pusula Yıldızı
  | 'concept-06' // 06. Hediye Paketi & Fiyonk Rozeti
  | 'concept-07' // 07. 5 Yıldızlı Galaksi & Pop Star
  | 'concept-08' // 08. Japon Origami & Turna Kuşu
  | 'concept-09' // 09. Sonsuzluk & Kalp Bağı Mührü
  | 'concept-10' // 10. Sevimli Peluş Maskot Arması
  | 'concept-11' // 11. Klasik Tipografik Damga (Heritage)
  | 'concept-12' // 12. Pırlanta Elmas & Prizma Mührü
  | 'round-seal' // alias to concept-01
  | 'round-monogram' // alias to concept-02
  | 'round-minimal' // alias to concept-03
  | 'smile-bag'; // alias to concept-10

export interface LogoMeta {
  id: LogoConcept;
  number: string;
  name: string;
  tag: string;
  description: string;
}

export const LOGO_CONCEPTS: LogoMeta[] = [
  {
    id: 'concept-01',
    number: '01',
    name: 'Resmi Şirket Arması & Mührü',
    tag: 'Kurumsal & Güvenilir',
    description: 'Çift çemberli resmi şirket mühür arması. Kavisli "OTANTIKOS CONCEPT" ve "EST. 2024" yazısı, merkezde geometrik "O" ve 4 köşeli parlak yıldız.',
  },
  {
    id: 'concept-02',
    number: '02',
    name: 'Prestij "OC" Monogramı',
    tag: 'Lüks & Moda Markası',
    description: 'Lüks global perakende evleri tarzında, iç içe geçen geometrik "O" ve "C" harfleri, çift halka kenarlık ve merkez elmas aksanı.',
  },
  {
    id: 'concept-03',
    number: '03',
    name: 'Minimalist Zen Halka',
    tag: 'Japon Perakende & Tech',
    description: 'Uniqlo ve Muji esintili, kalın kırmızı daire içinde negatif alanlı dinamik beyaz halka ve merkez odak noktası.',
  },
  {
    id: 'concept-04',
    number: '04',
    name: 'Kraliyet Tacı & Defne Dalı',
    tag: 'Prestige & Kalite',
    description: 'Dairesel madalyon içinde 3 tepeli zarif taç, iki yanında başarıyı simgeleyen defne çelengi ve "OTANTIKOS" unvanı.',
  },
  {
    id: 'concept-05',
    number: '05',
    name: 'Tahtakale Ticaret Pusulası',
    tag: 'Tarihi Ticaret & Pusula',
    description: 'Eminönü ve Tahtakale\'nin köklü ticaret mirasını simgeleyen 8 yönlü denizci/ticaret pusula yıldızı ve dairesel bordür.',
  },
  {
    id: 'concept-06',
    number: '06',
    name: 'Hediye Paketi & Fiyonk Mührü',
    tag: 'Hediye & Oyuncak Dünyası',
    description: 'Dairesel damga içinde origami tarzı zarif hediye paketi ve fiyonk kurdelesi. Hediye, blind box ve oyuncak konseptine tam uyumlu.',
  },
  {
    id: 'concept-07',
    number: '07',
    name: '5 Yıldızlı Galaksi & Pop Star',
    tag: '5 Yıldızlı Hizmet',
    description: 'Merkezdeki "O" ambleminin üzerinde yayılan 5 yıldız kavisli takım yıldızı. Yüksek müşteri memnuniyeti ve popüler ürünler imzası.',
  },
  {
    id: 'concept-08',
    number: '08',
    name: 'Japon Origami Turna Kuşu',
    tag: 'Otantik & Sanatsal',
    description: 'Japon kültüründe şans, neşe ve otantikliği simgeleyen geometrik origami kuşu ve dairesel güneş halesi.',
  },
  {
    id: 'concept-09',
    number: '09',
    name: 'Sonsuzluk & Kalp Bağı',
    tag: 'Sevgi & Tutku',
    description: 'Dairesel madalyon içinde birbirine kenetlenen sonsuzluk halkası ve gizli kalp formu. Sevilen hediyelikler dünyası.',
  },
  {
    id: 'concept-10',
    number: '10',
    name: 'Sevimli Peluş Maskot Arması',
    tag: 'Peluş & Kawaii Kurumsal',
    description: 'Dairesel resmi mühür içine yerleştirilmiş zarif geometrik peluş maskot silüeti. Hem kurumsal hem sevimli.',
  },
  {
    id: 'concept-11',
    number: '11',
    name: 'Klasik Tipografik Damga',
    tag: 'Heritage & Vintage',
    description: 'Kalın çemberli endüstriyel damga, merkezde yatay kırmızı bant üzerine yerleşmiş güçlü "OTANTIKOS" tipografisi.',
  },
  {
    id: 'concept-12',
    number: '12',
    name: 'Pırlanta Elmas & Prizma',
    tag: 'Özel Koleksiyon',
    description: 'Geometrik elmas kesim prizma silüeti ve dairesel altın oran halkası. Değerli, nadir ve özel koleksiyon ürünlerini simgeler.',
  },
];

interface LogoProps {
  concept?: LogoConcept;
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
  const [selectedConcept, setSelectedConcept] = useState<LogoConcept>(concept || 'concept-01');

  useEffect(() => {
    if (concept) {
      setSelectedConcept(concept);
      return;
    }
    // Read from localStorage on client side
    try {
      const stored = localStorage.getItem('otantikos_active_logo') as LogoConcept;
      if (stored) setSelectedConcept(stored);
    } catch {}

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('otantikos_active_logo') as LogoConcept;
        if (stored) setSelectedConcept(stored);
      } catch {}
    };

    window.addEventListener('otantikos_logo_changed', handleStorageChange);
    return () => window.removeEventListener('otantikos_logo_changed', handleStorageChange);
  }, [concept]);

  // Dimension definitions
  const dimensions = {
    xs: { icon: 'w-7 h-7', title: 'text-sm', sub: 'text-[7px]', badge: 'text-[6px]' },
    sm: { icon: 'w-9 h-9', title: 'text-base', sub: 'text-[8px]', badge: 'text-[7px]' },
    md: { icon: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-lg sm:text-xl', sub: 'text-[9px]', badge: 'text-[8px]' },
    lg: { icon: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-2xl sm:text-3xl', sub: 'text-xs', badge: 'text-[10px]' },
    xl: { icon: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-3xl sm:text-4xl', sub: 'text-sm', badge: 'text-xs' },
  }[size];

  // Resolve normalized concept ID
  let normalizedId = selectedConcept;
  if (normalizedId === 'round-seal') normalizedId = 'concept-01';
  if (normalizedId === 'round-monogram') normalizedId = 'concept-02';
  if (normalizedId === 'round-minimal') normalizedId = 'concept-03';
  if (normalizedId === 'smile-bag') normalizedId = 'concept-10';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* CIRCULAR COMPANY LOGO EMBLEM */}
      <div 
        className={`${dimensions.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs`}
        title="Otantikos Concept Şirket Logosu"
      >
        <LogoIconRender concept={normalizedId} />
      </div>

      {/* CORPORATE TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-sans font-black tracking-tight ${dimensions.title} ${
                isDark ? 'text-white' : 'text-stone-900 group-hover:text-[#e60012]'
              } transition-colors uppercase`}
            >
              Otantikos
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e60012] animate-pulse" />
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span className={`font-black text-[#e60012] tracking-[0.25em] uppercase ${dimensions.sub}`}>
              CONCEPT
            </span>
            <span className={`text-[8px] font-bold text-stone-300 ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              •
            </span>
            <span className={`font-bold text-stone-400 tracking-wider uppercase ${dimensions.badge} ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              LTD. ŞTİ.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Universal Icon Switcher for all 12 Concepts
 */
export function LogoIconRender({ concept }: { concept: LogoConcept }) {
  switch (concept) {
    case 'concept-01':
    case 'round-seal':
      return <LogoIcon01 />;
    case 'concept-02':
    case 'round-monogram':
      return <LogoIcon02 />;
    case 'concept-03':
    case 'round-minimal':
      return <LogoIcon03 />;
    case 'concept-04':
      return <LogoIcon04 />;
    case 'concept-05':
      return <LogoIcon05 />;
    case 'concept-06':
      return <LogoIcon06 />;
    case 'concept-07':
      return <LogoIcon07 />;
    case 'concept-08':
      return <LogoIcon08 />;
    case 'concept-09':
      return <LogoIcon09 />;
    case 'concept-10':
    case 'smile-bag':
      return <LogoIcon10 />;
    case 'concept-11':
      return <LogoIcon11 />;
    case 'concept-12':
      return <LogoIcon12 />;
    default:
      return <LogoIcon01 />;
  }
}

// -------------------------------------------------------------
// 12 HIGH-PRECISION CIRCULAR CORPORATE SVG DESIGNS
// -------------------------------------------------------------

/** 01. Resmi Şirket Arması & Mührü */
export function LogoIcon01() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g01" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
        <path id="p01Top" d="M 6.5,24 A 17.5,17.5 0 0,1 41.5,24" fill="none" />
        <path id="p01Bot" d="M 41.5,24 A 17.5,17.5 0 0,1 6.5,24" fill="none" />
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g01)" />
      <circle cx="24" cy="24" r="21" stroke="white" strokeWidth="1" strokeOpacity="0.85" />
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="1" strokeOpacity="0.75" />
      <text fill="white" fontSize="4.1" fontWeight="900" letterSpacing="0.9">
        <textPath href="#p01Top" startOffset="50%" textAnchor="middle">OTANTIKOS</textPath>
      </text>
      <text fill="white" fontSize="3.6" fontWeight="800" letterSpacing="0.8">
        <textPath href="#p01Bot" startOffset="50%" textAnchor="middle">CONCEPT • 2024</textPath>
      </text>
      <path d="M 6.5,23.5 L 7.5,24.5 L 8.5,23.5 L 7.5,22.5 Z" fill="white" />
      <path d="M 41.5,23.5 L 42.5,24.5 L 43.5,23.5 L 42.5,22.5 Z" fill="white" />
      <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="2.4" fill="none" />
      <path d="M 24,19 L 25.2,22.8 L 29,24 L 25.2,25.2 L 24,29 L 22.8,25.2 L 19,24 L 22.8,22.8 Z" fill="white" />
    </svg>
  );
}

/** 02. Prestij "OC" Lüks Monogramı */
export function LogoIcon02() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g02" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2434" />
          <stop offset="1" stopColor="#a3000d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g02)" />
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="18.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 2" />
      <circle cx="24" cy="24" r="13" stroke="white" strokeWidth="3.2" fill="none" />
      <path d="M 27.5,16.5 C 20,16.5 16,19.8 16,24 C 16,28.2 20,31.5 27.5,31.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M 24,21 L 26,24 L 24,27 L 22,24 Z" fill="white" />
      <circle cx="24" cy="7.5" r="1.2" fill="white" />
      <circle cx="24" cy="40.5" r="1.2" fill="white" />
    </svg>
  );
}

/** 03. Minimalist Zen Halka (Japon Perakende) */
export function LogoIcon03() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g03" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g03)" />
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="72 16" transform="rotate(-45 24 24)" />
      <circle cx="24" cy="24" r="5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="#b8000e" />
      <path d="M 24,5.5 L 24.8,7.2 L 26.5,8 L 24.8,8.8 L 24,10.5 L 23.2,8.8 L 21.5,8 L 23.2,7.2 Z" fill="white" />
    </svg>
  );
}

/** 04. Kraliyet Tacı & Defne Dalı Arması */
export function LogoIcon04() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g04" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#99000a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g04)" />
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1" strokeOpacity="0.8" />
      {/* Crown */}
      <path d="M 16,21 L 18,15 L 24,18 L 30,15 L 32,21 Z" fill="white" />
      <circle cx="18" cy="14" r="1.2" fill="white" />
      <circle cx="24" cy="17" r="1.2" fill="white" />
      <circle cx="30" cy="14" r="1.2" fill="white" />
      {/* Center 'O' letter */}
      <circle cx="24" cy="29" r="6.5" stroke="white" strokeWidth="2.6" fill="none" />
      {/* Laurel Wreath Arcs */}
      <path d="M 11,26 C 11,33 16,38 24,38 C 32,38 37,33 37,26" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
    </svg>
  );
}

/** 05. Tahtakale Ticaret & Pusula Yıldızı */
export function LogoIcon05() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g05" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1e2d" />
          <stop offset="1" stopColor="#a8000d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g05)" />
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="17" stroke="white" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.6" />
      {/* 8-Point Star / Compass */}
      <path d="M 24,9 L 26.5,21.5 L 39,24 L 26.5,26.5 L 24,39 L 21.5,26.5 L 9,24 L 21.5,21.5 Z" fill="white" />
      <path d="M 24,15 L 25.5,22.5 L 33,24 L 25.5,25.5 L 24,33 L 22.5,25.5 L 15,24 L 22.5,22.5 Z" fill="#b8000e" />
      <circle cx="24" cy="24" r="3.2" fill="white" />
      <circle cx="24" cy="24" r="1.5" fill="#a8000d" />
    </svg>
  );
}

/** 06. Hediye Paketi & Fiyonk Rozeti */
export function LogoIcon06() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g06" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2434" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g06)" />
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" />
      {/* Ribbon Bow on Top */}
      <path d="M 18,17 C 14,13 18,9 22,12 C 23.5,13.5 24,17 24,17 C 24,17 24.5,13.5 26,12 C 30,9 34,13 30,17 Z" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.2" />
      <circle cx="24" cy="17" r="1.8" fill="white" />
      {/* Gift Box Body */}
      <rect x="15" y="20" width="18" height="16" rx="3" stroke="white" strokeWidth="2.2" fill="none" />
      <line x1="24" y1="20" x2="24" y2="36" stroke="white" strokeWidth="2" />
      <line x1="15" y1="28" x2="33" y2="28" stroke="white" strokeWidth="2" />
      {/* Stars */}
      <circle cx="10" cy="24" r="1" fill="white" />
      <circle cx="38" cy="24" r="1" fill="white" />
    </svg>
  );
}

/** 07. 5 Yıldızlı Galaksi & Pop Star */
export function LogoIcon07() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g07" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#a3000d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g07)" />
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1" strokeOpacity="0.8" />
      {/* 5 Stars Arch on top */}
      <path d="M 12,19 L 13,21 L 15,21.3 L 13.5,22.6 L 14,24.5 L 12,23.3 L 10,24.5 L 10.5,22.6 L 9,21.3 L 11,21 Z" fill="white" transform="scale(0.8) translate(3, -2)" />
      <path d="M 17,14 L 18,16 L 20,16.3 L 18.5,17.6 L 19,19.5 L 17,18.3 L 15,19.5 L 15.5,17.6 L 14,16.3 L 16,16 Z" fill="white" transform="scale(0.8) translate(5, 0)" />
      <path d="M 24,10 L 25.3,12.8 L 28,13.2 L 26,15 L 26.6,17.7 L 24,16.2 L 21.4,17.7 L 22,15 L 20,13.2 L 22.7,12.8 Z" fill="white" />
      <path d="M 31,14 L 32,16 L 34,16.3 L 32.5,17.6 L 33,19.5 L 31,18.3 L 29,19.5 L 29.5,17.6 L 28,16.3 L 30,16 Z" fill="white" transform="scale(0.8) translate(9, 0)" />
      <path d="M 36,19 L 37,21 L 39,21.3 L 37.5,22.6 L 38,24.5 L 36,23.3 L 34,24.5 L 34.5,22.6 L 33,21.3 L 35,21 Z" fill="white" transform="scale(0.8) translate(11, -2)" />
      {/* Big 'O' in center-bottom */}
      <circle cx="24" cy="29" r="8" stroke="white" strokeWidth="3" fill="none" />
      <circle cx="24" cy="29" r="3" fill="white" />
    </svg>
  );
}

/** 08. Japon Origami & Turna Kuşu */
export function LogoIcon08() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g08" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2434" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g08)" />
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.2" strokeOpacity="0.85" />
      {/* Origami Bird Facets */}
      <polygon points="24,12 36,20 28,26" fill="white" fillOpacity="0.95" />
      <polygon points="24,12 12,20 20,26" fill="white" fillOpacity="0.75" />
      <polygon points="24,12 28,26 24,35 20,26" fill="white" />
      <polygon points="24,35 24,28 17,33" fill="white" fillOpacity="0.85" />
      {/* Sun Circle behind */}
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
    </svg>
  );
}

/** 09. Sonsuzluk & Kalp Bağı Mührü */
export function LogoIcon09() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g09" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#a8000d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g09)" />
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.85" />
      {/* Interlinked Infinity Loop */}
      <path 
        d="M 18,20 C 13,20 13,28 18,28 C 22,28 26,20 30,20 C 35,20 35,28 30,28 C 26,28 22,20 18,20 Z" 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      {/* Heart Sparkle above */}
      <path d="M 24,11 C 24,11 21.5,8.5 19.5,10.5 C 17.5,12.5 20.5,15.5 24,18 C 27.5,15.5 30.5,12.5 28.5,10.5 C 26.5,8.5 24,11 24,11 Z" fill="white" />
      {/* Dots */}
      <circle cx="24" cy="34" r="1.5" fill="white" />
      <circle cx="12" cy="24" r="1" fill="white" />
      <circle cx="36" cy="24" r="1" fill="white" />
    </svg>
  );
}

/** 10. Sevimli Peluş Maskot Arması */
export function LogoIcon10() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g10" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g10)" />
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.2" strokeOpacity="0.85" />
      {/* Bear Ears */}
      <circle cx="16" cy="16" r="4.2" fill="white" />
      <circle cx="32" cy="16" r="4.2" fill="white" />
      <circle cx="16" cy="16" r="2.2" fill="#b8000e" />
      <circle cx="32" cy="16" r="2.2" fill="#b8000e" />
      {/* Bear Head */}
      <circle cx="24" cy="26" r="12" fill="white" />
      {/* Eyes */}
      <circle cx="19.5" cy="24" r="1.6" fill="#1c1917" />
      <circle cx="28.5" cy="24" r="1.6" fill="#1c1917" />
      {/* Snout */}
      <ellipse cx="24" cy="28" rx="4" ry="2.8" fill="#fef2f2" />
      <ellipse cx="24" cy="27" rx="1.6" ry="1" fill="#1c1917" />
      <path d="M 22.5,28.8 C 23.2,29.8 24.8,29.8 25.5,28.8" stroke="#1c1917" strokeWidth="0.9" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="17" cy="26.5" r="1.3" fill="#f87171" opacity="0.75" />
      <circle cx="31" cy="26.5" r="1.3" fill="#f87171" opacity="0.75" />
    </svg>
  );
}

/** 11. Klasik Tipografik Damga (Heritage) */
export function LogoIcon11() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g11" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#99000a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g11)" />
      {/* Thick Stamped Border */}
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="16.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" />
      {/* Center White Ribbon Banner */}
      <rect x="5" y="19.5" width="38" height="9" fill="white" rx="1.5" />
      <text x="24" y="26.5" fill="#99000a" fontSize="5.2" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
        OTANTIKOS
      </text>
      {/* Top & Bottom Subtext */}
      <text x="24" y="15" fill="white" fontSize="3.6" fontWeight="900" textAnchor="middle" letterSpacing="1.2">
        CONCEPT
      </text>
      <text x="24" y="34" fill="white" fontSize="3.2" fontWeight="800" textAnchor="middle" letterSpacing="1">
        ★ EST. 2024 ★
      </text>
    </svg>
  );
}

/** 12. Pırlanta Elmas & Prizma Mührü */
export function LogoIcon12() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="g12" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#g12)" />
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1" strokeOpacity="0.85" />
      <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.5" />
      {/* Faceted Diamond */}
      <polygon points="17,19 31,19 36,25 24,35 12,25" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
      <polyline points="12,25 36,25" stroke="white" strokeWidth="1.8" />
      <polyline points="20,19 17,25 24,35 31,25 28,19" stroke="white" strokeWidth="1.4" fill="none" />
      <polyline points="20,19 24,25 28,19" stroke="white" strokeWidth="1.4" fill="none" />
      <line x1="24" y1="25" x2="24" y2="35" stroke="white" strokeWidth="1.4" />
      {/* Tiny Sparkle at top left */}
      <path d="M 12,14 L 13,15.5 L 14.5,16 L 13,16.5 L 12,18 L 11,16.5 L 9.5,16 L 11,15.5 Z" fill="white" />
    </svg>
  );
}

// Backward compatibility exports
export const RoundSealIcon = LogoIcon01;
export const RoundMonogramIcon = LogoIcon02;
export const RoundMinimalIcon = LogoIcon03;
export const SmileBagIcon = LogoIcon10;
export const GiftRibbonIcon = LogoIcon06;
export const KawaiiMascotIcon = LogoIcon10;
