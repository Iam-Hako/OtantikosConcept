"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      {/* Üst İnce Hızlı Yüklenme Çubuğu */}
      <div className="h-1 bg-gradient-to-r from-[#C86D51] via-[#E6A085] to-[#C86D51] animate-pulse w-full shadow-md" />
      
      {/* Şık Hafif Yüklenme Göstergesi */}
      <div className="fixed top-4 right-4 bg-[#3E2E28] text-white px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[11px] font-bold border border-white/20 animate-in fade-in zoom-in duration-200">
        <Sparkles className="w-3.5 h-3.5 text-[#C86D51] animate-spin" />
        <span className="tracking-wide">Yükleniyor...</span>
      </div>
    </div>
  );
}
