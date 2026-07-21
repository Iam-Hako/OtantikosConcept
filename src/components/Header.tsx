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
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { INITIAL_CATEGORIES } from "@/data/mockData";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
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
      {/* Üst Duyuru Çubuğu (Top Bar) - "Kargo Bedava" ibaresi kaldırıldı */}
      <div className="bg-[#3E2E28] text-[#F8F5F0] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51] animate-pulse" />
            <span>OtantikosConcept <strong>Doğal & El Yapımı</strong> Özel Tasarım Mağazası</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-[#D8C7B5]">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Hızlı & Özenli Teslimat</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> %100 Orijinal El Yapımı</span>
            <Link href="/iletisim" className="hover:text-white transition">Müşteri Destek</Link>
          </div>
        </div>
      </div>

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
                  Otantikos<span className="text-[#C86D51] font-light">Concept</span>
                </span>
                <span className="text-[9px] tracking-[0.2em] text-[#7C6354] uppercase font-sans font-semibold">
                  Specialist Local Products
                </span>
              </div>
            </Link>

            {/* Masaüstü Navigasyon Linkleri */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#3E2E28]">
              <Link href="/" className="hover:text-[#C86D51] transition">
                Ana Sayfa
              </Link>
              <Link href="/urunler" className="hover:text-[#C86D51] transition">
                Tüm Ürünler
              </Link>
              <div className="relative group py-6">
                <button className="hover:text-[#C86D51] transition flex items-center gap-1">
                  Kategoriler <ChevronDown className="w-4 h-4 text-[#7C6354]" />
                </button>
                {/* Dropdown Menü */}
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-[#E6DCD3] p-2 opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visibility-visible transition-all duration-200 z-50">
                  {INITIAL_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      className="block px-4 py-2.5 text-xs text-[#3E2E28] hover:bg-[#F8F5F0] hover:text-[#C86D51] rounded-lg transition font-medium"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/admin" className="text-xs bg-[#C86D51] text-white px-3.5 py-1.5 rounded-full hover:bg-[#B05B41] transition font-semibold">
                + Ürün Ekle (Admin)
              </Link>
            </nav>

            {/* Sağ: Arama & Sepet & Profil */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 bg-[#EAE0D5]/50 border border-[#D8C7B5] rounded-full py-2 pl-4 pr-10 text-xs text-[#3E2E28] placeholder-[#7C6354] focus:outline-none focus:ring-2 focus:ring-[#C86D51] transition"
                />
                <button type="submit" className="absolute right-3 text-[#7C6354] hover:text-[#C86D51]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <Link href="/admin" className="hidden sm:flex p-2 text-[#3E2E28] hover:text-[#C86D51] hover:bg-[#EAE0D5]/50 rounded-full transition" title="Yönetici Paneli">
                <User className="w-5 h-5" />
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
              placeholder="Ürün ara..."
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
                  <span className="font-serif text-lg font-bold text-[#3E2E28]">OtantikosConcept</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#3E2E28]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 flex flex-col space-y-4">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  Ana Sayfa
                </Link>
                <Link href="/urunler" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#3E2E28]">
                  Tüm Ürünler
                </Link>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-[#C86D51]">
                  Yönetici Paneli / Ürün Ekle
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
