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
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="loader-overlay" style={{ animation: 'pageFadeIn 0.2s ease forwards' }}>
      {/* Full-width progress bar */}
      <div className="loader-bar" />
      
      {/* Centered loading indicator */}
      <div
        className="flex flex-col items-center gap-3"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-xl border border-[#E6DCD3] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#C86D51] animate-sparkle" />
        </div>
        <span className="text-xs font-bold text-[#3E2E28] tracking-widest uppercase">Yükleniyor</span>
      </div>
    </div>
  );
}
