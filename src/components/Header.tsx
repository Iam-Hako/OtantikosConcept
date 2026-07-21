"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, isAdmin, logout, settings, siteTexts } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/urunler?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Üst Duyuru Bandı */}
      <div className="bg-gradient-to-r from-[#3E2E28] via-[#4A3B32] to-[#3E2E28] text-white py-2 px-4 text-[11px] font-medium tracking-wide border-b border-[#523E36] animate-gradient">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E6A085] animate-sparkle" />
            <span className="tracking-wider">{settings.topbarText || "OtantikosConcept • Bijuteri, Hediyelik Eşya ve Trend Oyuncak Mağazası"}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#E6A085] animate-sparkle" />
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[#D8C7B5] text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Güvenli Alışveriş</span>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-[#E6DCD3] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] gap-4">

            {/* Sol: Mobil Menü Butonu */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 text-[#3E2E28] hover:bg-[#F8F5F0] rounded-xl transition btn-press"
                aria-label="Menü"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Marka Logosu */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#C86D51] shadow-sm bg-[#EAE0D5] group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/otantikos-logo.png"
                  alt="OtantikosConcept Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl tracking-tight text-[#3E2E28] font-bold leading-none">
                  {settings.siteTitle || "OtantikosConcept"}
                </span>
                <span className="text-[9px] tracking-[0.2em] text-[#C86D51] uppercase font-sans font-bold mt-0.5">
                  {settings.siteSubtitle || "Bijuteri & Hediyelik Eşya"}
                </span>
              </div>
            </Link>

            {/* Masaüstü Navigasyon */}
            <nav className="hidden lg:flex items-center gap-x-6 text-[13px] font-semibold text-[#3E2E28]">
              <Link href="/" className="link-underline py-2 hover:text-[#C86D51] transition-colors">
                {siteTexts?.header?.navHome || "Ana Sayfa"}
              </Link>
              <Link href="/urunler" className="link-underline py-2 hover:text-[#C86D51] transition-colors">
                {siteTexts?.header?.navAllProducts || "Tüm Ürünler"}
              </Link>
              <Link href="/kategori/bijuteri-taki" className="link-underline py-2 hover:text-[#C86D51] transition-colors">
                Bijuteri & Takı
              </Link>
              <Link href="/kategori/hediyelik-esya" className="link-underline py-2 hover:text-[#C86D51] transition-colors">
                Hediyelik Eşya
              </Link>
              <Link href="/kategori/trend-oyuncak-squishy" className="link-underline py-2 hover:text-[#C86D51] transition-colors">
                Trend Oyuncak
              </Link>
            </nav>

            {/* Sağ: Arama, Admin, Profil, Sepet */}
            <div className="flex items-center gap-2.5">
              
              {/* Arama */}
              <form onSubmit={handleSearch} className="hidden md:flex relative items-center w-44 xl:w-56">
                <input
                  type="text"
                  placeholder={siteTexts?.header?.searchPlaceholder || "Ürün ara..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-full py-2 pl-9 pr-4 text-xs text-[#3E2E28] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:bg-white transition-all duration-200"
                />
                <Search className="w-3.5 h-3.5 text-[#7C6354] absolute left-3" />
              </form>

              {/* Admin Butonu */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-sm flex items-center gap-1.5 shrink-0 btn-press animate-pulse-glow"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline-block">Yönetim</span>
                </Link>
              )}

              {/* Hesabım */}
              <Link
                href="/hesabim"
                className="flex items-center gap-2 p-2 hover:bg-[#F8F5F0] rounded-full transition text-[#3E2E28] font-bold text-xs btn-press"
                title="Hesabım"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#C86D51] flex items-center justify-center font-serif font-bold text-sm">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-[#C86D51]" />}
                </div>
                {user && <span className="hidden xl:inline-block max-w-[100px] truncate text-xs">{user.name}</span>}
              </Link>

              {/* Sepet */}
              <Link
                href="/sepet"
                className="relative p-2.5 bg-[#3E2E28] text-white rounded-full hover:bg-[#C86D51] transition-all duration-300 shadow-md flex items-center justify-center shrink-0 btn-press"
                aria-label="Sepetim"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C86D51] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobil Menü Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden">
          <div
            className="w-4/5 max-w-sm bg-white h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl ml-auto"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <div>
              <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C86D51] text-white flex items-center justify-center font-bold text-sm">O</div>
                  <span className="font-serif font-bold text-lg text-[#3E2E28]">Menü</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-black btn-press">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                />
                <Search className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
              </form>

              <nav className="mt-6 flex flex-col space-y-1 font-semibold text-sm text-[#3E2E28]">
                {[
                  { label: "Ana Sayfa", href: "/" },
                  { label: "Tüm Ürünler", href: "/urunler" },
                  { label: "Bijuteri & Takı", href: "/kategori/bijuteri-taki" },
                  { label: "Hediyelik Eşya", href: "/kategori/hediyelik-esya" },
                  { label: "Trend Oyuncak", href: "/kategori/trend-oyuncak-squishy" },
                ].map((link, i) => (
                  <Link
                    key={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    href={link.href}
                    className="p-3 rounded-xl hover:bg-[#F8F5F0] transition animate-float-up"
                    style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-[#E6DCD3] pt-4 space-y-3">
              {isAdmin && (
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/admin"
                  className="w-full py-3 bg-[#C86D51] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 btn-press"
                >
                  <ShieldAlert className="w-4 h-4" /> Admin Paneli
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-3 bg-gray-100 text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 btn-press"
                >
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              ) : (
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/hesabim"
                  className="w-full py-3 bg-[#3E2E28] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 btn-press"
                >
                  <User className="w-4 h-4" /> Giriş Yap / Kayıt Ol
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
