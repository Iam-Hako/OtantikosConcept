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
  Truck,
  ShieldAlert,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, isAdmin, logout, settings, siteTexts } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/urunler?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Şık Üst Duyuru Çubuğu (Top Bar) */}
      <div className="bg-[#3E2E28] text-white py-1.5 px-4 text-[11px] font-medium tracking-wide border-b border-[#523E36]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51] animate-pulse" />
            <span>OtantikosConcept • Şık Aksesuarlar, Takı ve Hediyelik Eşyalar</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[#D8C7B5] text-[10px]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C86D51]" /> 500 TL Üzeri Ücretsiz Kargo
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> %100 Orijinal & Güvenli Alışveriş
            </span>
          </div>
        </div>
      </div>

      {/* Ana Header & Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#E6DCD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Sol: Mobil Menü Butonu */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#3E2E28] hover:bg-[#F8F5F0] rounded-xl transition"
                aria-label="Menü"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Marka Logosu */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#C86D51] shadow-sm bg-[#EAE0D5] group-hover:scale-105 transition-transform duration-300">
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
                <span className="text-[9px] tracking-widest text-[#C86D51] uppercase font-sans font-bold mt-1">
                  Bijuteri & Hediyelik Eşya
                </span>
              </div>
            </Link>

            {/* Masaüstü Navigasyon Linkleri */}
            <nav className="hidden lg:flex items-center gap-x-7 text-xs font-semibold text-[#3E2E28]">
              <Link
                href="/"
                className="hover:text-[#C86D51] transition-colors py-2 border-b-2 border-transparent hover:border-[#C86D51]"
              >
                {siteTexts?.header?.navHome || "Ana Sayfa"}
              </Link>
              <Link
                href="/urunler"
                className="hover:text-[#C86D51] transition-colors py-2 border-b-2 border-transparent hover:border-[#C86D51]"
              >
                {siteTexts?.header?.navAllProducts || "Tüm Ürünler"}
              </Link>
              <Link
                href="/kategori/bijuteri-taki"
                className="hover:text-[#C86D51] transition-colors py-2 border-b-2 border-transparent hover:border-[#C86D51]"
              >
                Bijuteri & Takı
              </Link>
              <Link
                href="/kategori/hediyelik-esya"
                className="hover:text-[#C86D51] transition-colors py-2 border-b-2 border-transparent hover:border-[#C86D51]"
              >
                Hediyelik Eşya
              </Link>
              <Link
                href="/kategori/squishy"
                className="hover:text-[#C86D51] transition-colors py-2 border-b-2 border-transparent hover:border-[#C86D51]"
              >
                Trend Oyuncak & Squishy
              </Link>
            </nav>

            {/* Sağ Taraf: Arama, Admin, Profil ve Sepet */}
            <div className="flex items-center gap-3">
              
              {/* Arama Çubuğu */}
              <form onSubmit={handleSearch} className="hidden md:flex relative items-center w-48 xl:w-60">
                <input
                  type="text"
                  placeholder={siteTexts?.header?.searchPlaceholder || "Ürün ara..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-full py-2 pl-9 pr-4 text-xs text-[#3E2E28] focus:outline-none focus:ring-1 focus:ring-[#C86D51] focus:bg-white transition"
                />
                <Search className="w-3.5 h-3.5 text-[#7C6354] absolute left-3" />
              </form>

              {/* Admin Butonu */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline-block">Site Yönetimi</span>
                </Link>
              )}

              {/* Kullanıcı Hesabım */}
              <Link
                href="/hesabim"
                className="flex items-center gap-2 p-2 hover:bg-[#F8F5F0] rounded-full transition text-[#3E2E28] font-bold text-xs"
                title="Hesabım"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#C86D51] flex items-center justify-center font-serif font-bold text-sm">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-[#C86D51]" />}
                </div>
                {user && <span className="hidden xl:inline-block max-w-[100px] truncate text-xs">{user.name}</span>}
              </Link>

              {/* Sepet Butonu */}
              <Link
                href="/sepet"
                className="relative p-2.5 bg-[#C86D51] text-white rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center justify-center shrink-0"
                aria-label="Sepetim"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#3E2E28] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobil Menü Çekmecesi (Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C86D51] text-white flex items-center justify-center font-bold text-sm">
                    O
                  </div>
                  <span className="font-serif font-bold text-lg text-[#3E2E28]">Menü</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Ürün veya bijuteri ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                />
                <Search className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
              </form>

              <nav className="mt-6 flex flex-col space-y-3 font-semibold text-sm text-[#3E2E28]">
                <Link onClick={() => setMobileMenuOpen(false)} href="/" className="p-2.5 rounded-xl hover:bg-[#F8F5F0]">
                  Ana Sayfa
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/urunler" className="p-2.5 rounded-xl hover:bg-[#F8F5F0]">
                  Tüm Ürünler
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/kategori/bijuteri-taki" className="p-2.5 rounded-xl hover:bg-[#F8F5F0]">
                  Bijuteri & Takı
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/kategori/hediyelik-esya" className="p-2.5 rounded-xl hover:bg-[#F8F5F0]">
                  Hediyelik Eşya
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/kategori/squishy" className="p-2.5 rounded-xl hover:bg-[#F8F5F0]">
                  Trend Oyuncak & Squishy
                </Link>
              </nav>
            </div>

            <div className="border-t border-[#E6DCD3] pt-4 space-y-3">
              {isAdmin && (
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/admin"
                  className="w-full py-3 bg-[#C86D51] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> Admin Paneli
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-gray-100 text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              ) : (
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href="/hesabim"
                  className="w-full py-3 bg-[#3E2E28] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
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
