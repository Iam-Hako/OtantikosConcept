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
  LogOut
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
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Ana Header & Navbar */}
      <div className="bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#E6DCD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Sol: Mobil Menü & Arama Butonu */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#3E2E28] hover:bg-[#EAE0D5] rounded-full transition"
                aria-label="Menü"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#3E2E28] hover:bg-[#EAE0D5] rounded-full transition"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Logo Entegrasyonu */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#C86D51] shadow-sm bg-[#EAE0D5]">
                <Image
                  src="/otantikos-logo.png"
                  alt="OtantikosConcept Logo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-wide text-[#3E2E28] font-bold leading-tight">
                  {settings.siteTitle}
                </span>
                <span className="text-[10px] tracking-wider text-[#C86D51] uppercase font-sans font-semibold">
                  Bijuteri & Hediyelik Eşya
                </span>
              </div>
            </Link>

            {/* Masaüstü Navigasyon Linkleri */}
            <nav className="hidden md:flex flex-1 justify-center space-x-8 lg:space-x-12 xl:space-x-16 text-sm font-medium text-[#3E2E28] px-6">
              <Link href="/" className="hover:text-[#C86D51] transition">
                {siteTexts?.header?.navHome || "Ana Sayfa"}
              </Link>
              <Link href="/urunler" className="hover:text-[#C86D51] transition">
                {siteTexts?.header?.navAllProducts || "Tüm Ürünler"}
              </Link>
              <Link href="/kategori/bijuteri-taki" className="hover:text-[#C86D51] transition">
                Bijuteri & Takı
              </Link>
              <Link href="/kategori/hediyelik-esya" className="hover:text-[#C86D51] transition">
                Hediyelik Eşya
              </Link>
              <Link href="/kategori/trend-oyuncak-squishy" className="hover:text-[#C86D51] transition">
                Trend Oyuncak & Squishy
              </Link>

              {/* Sadece Admin Kullanıcılar Görebilir */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs bg-[#C86D51] text-white px-3.5 py-1.5 rounded-full hover:bg-[#B05B41] transition font-semibold flex items-center gap-1 shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Site Yönetimi
                </Link>
              )}
            </nav>

            {/* Sağ: Arama & Sepet & Profil */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
                <input
                  type="text"
                  placeholder={siteTexts?.header?.searchPlaceholder || "Squishy, bijuteri ara..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 bg-[#EAE0D5]/50 border border-[#D8C7B5] rounded-full py-2 pl-4 pr-10 text-xs text-[#3E2E28] placeholder-[#7C6354] focus:outline-none focus:ring-2 focus:ring-[#C86D51] transition"
                />
                <button type="submit" className="absolute right-3 text-[#7C6354] hover:text-[#C86D51]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Kullanıcı Hesabı Linki */}
              <Link
                href="/hesabim"
                className="hidden sm:flex p-2 text-[#3E2E28] hover:text-[#C86D51] hover:bg-[#EAE0D5]/50 rounded-full transition items-center gap-1.5"
                title={user ? `Hesabım (${user.name})` : "Giriş Yap / Kayıt Ol"}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-semibold max-w-[80px] truncate">
                  {user ? user.name : (siteTexts?.header?.accountLabel || "Hesabım")}
                </span>
              </Link>

              {/* Sepet Butonu */}
              <Link
                href="/sepet"
                className="relative p-2.5 bg-[#C86D51] text-white rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center justify-center group"
                aria-label="Sepet"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#3E2E28] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F8F5F0]">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobil Arama Çubuğu */}
      {searchOpen && (
        <div className="md:hidden bg-[#F8F5F0] border-b border-[#E6DCD3] p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={siteTexts?.header?.searchPlaceholder || "Squishy, bijuteri ara..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border border-[#D8C7B5] rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              autoFocus
            />
            <button type="submit" className="bg-[#C86D51] text-white px-4 py-2 rounded-lg text-sm font-medium">
              Ara
            </button>
          </form>
        </div>
      )}

      {/* Mobil Menü Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-[#F8F5F0] h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E6DCD3]">
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C86D51]">
                    <Image src="/otantikos-logo.png" alt="Logo" fill className="object-cover" />
                  </div>
                  <span className="font-serif text-lg font-bold text-[#3E2E28]">{settings.siteTitle}</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#3E2E28]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 flex flex-col space-y-4">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  {siteTexts?.header?.navHome || "Ana Sayfa"}
                </Link>
                <Link href="/urunler" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  {siteTexts?.header?.navAllProducts || "Tüm Ürünler"}
                </Link>
                <Link href="/kategori/trend-oyuncak-squishy" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  {siteTexts?.header?.navSquishy || "Trend Oyuncak & Squishy"}
                </Link>
                <Link href="/kategori/bijuteri-taki" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  {siteTexts?.header?.navJewelry || "Bijuteri & Takı"}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-bold text-[#C86D51] pt-2"
                  >
                    Site Yönetimi (Admin)
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E6DCD3]">
              {user ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#7C6354]">Oturum Açıldı: <strong>{user.email}</strong></p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </button>
                </div>
              ) : (
                <Link
                  href="/hesabim"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm text-[#3E2E28] font-medium"
                >
                  <User className="w-5 h-5 text-[#C86D51]" /> Giriş Yap / Kayıt Ol
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
