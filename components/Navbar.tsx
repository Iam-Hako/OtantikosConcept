'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Package, 
  Settings,
  Truck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useAuth } from '@/lib/store/auth-context';
import { DataService } from '@/lib/data/store-data';
import { Category } from '@/lib/types/ecommerce';
import SearchModal from '@/components/SearchModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { totalFavorites } = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    DataService.getCategories().then(setCategories);

    const handleCustomOpenSearch = () => {
      setIsSearchModalOpen(true);
    };
    window.addEventListener('otantikos:open_search', handleCustomOpenSearch);
    return () => window.removeEventListener('otantikos:open_search', handleCustomOpenSearch);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide on admin paths as requested by user
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all shadow-2xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-[11px] py-1.5 px-4 hidden sm:block shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-bold">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse inline-block" />
            <span className="text-white/95">Eminönü Tahtakale Doğrudan Sevkiyat • DHL Kargo Güvencesi</span>
            <span className="text-white/40">|</span>
            <span className="text-yellow-200 font-extrabold">Toptan & Perakende Satış</span>
          </div>
          <div className="flex items-center gap-4 text-white/90 text-[11px]">
            <Link href="/toptan-satis" className="hover:text-yellow-200 transition font-extrabold flex items-center gap-1">
              <span>Tahtakale Toptan Satış</span>
            </Link>
            <span className="text-white/30">•</span>
            <a href="https://wa.me/905077737777" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition flex items-center gap-1 font-semibold">
              <span>WhatsApp: +90 (507) 773 77 77</span>
            </a>
            <span className="text-white/30">•</span>
            <Link href="/iletisim" className="hover:text-yellow-200 transition">Mağaza Konumu</Link>
          </div>
        </div>
      </div>

      {/* Search Modal Component */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-orange-600 focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-orange-50 border-2 border-orange-200 shrink-0 shadow-xs group-hover:border-orange-400 transition">
                <Image
                  src="/images/logo.webp"
                  alt="Otantikos Concept"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-xl sm:text-2xl text-stone-900 tracking-tight leading-none group-hover:text-orange-600 transition">
                    Otantikos
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-orange-600 tracking-widest uppercase mt-0.5">
                  CONCEPT • TAHTAKALE
                </span>
              </div>
            </Link>
          </div>

          {/* TRENDYOL STYLE SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center justify-between p-1.5 pl-4 bg-stone-100/80 hover:bg-orange-50/50 border border-stone-200 hover:border-orange-400 rounded-full text-stone-500 text-xs sm:text-sm transition group shadow-2xs cursor-pointer ring-1 ring-black/[0.02]"
            >
              <div className="flex items-center gap-2.5 text-stone-400 group-hover:text-stone-700">
                <span className="text-xs sm:text-sm font-medium">Ürün, doğal taş, kalemlik veya kategori arayın...</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 rounded-md">
                  Ctrl K
                </kbd>
                <div className="w-8 h-8 rounded-full bg-orange-500 group-hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-2 text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition"
              aria-label="Arama"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-xs font-bold text-stone-700 hover:text-orange-600 hover:bg-orange-50/70 rounded-full sm:rounded-xl transition border border-transparent hover:border-orange-200"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 text-stone-700 group-hover:text-orange-600 flex items-center justify-center font-bold text-xs">
                  {user ? (user.full_name?.[0] || user.email?.[0] || 'U').toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user ? (user.full_name?.split(' ')[0] || user.email?.split('@')[0]) : 'Giriş Yap'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-scale-in">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-400">Giriş Yapıldı</p>
                        <p className="text-xs font-bold text-stone-900 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                            ⭐ Yönetici (Admin)
                          </span>
                        )}
                      </div>
                      <Link
                        href="/hesabim"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-600 font-medium transition"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Siparişlerim & Bilgilerim</span>
                      </Link>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-600 font-medium transition"
                      >
                        <Truck className="w-4 h-4 text-stone-400" />
                        <span>Kargo Takibi</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-orange-700 font-bold bg-orange-50 hover:bg-orange-100 transition"
                        >
                          <Settings className="w-4 h-4 text-orange-600" />
                          <span>Admin Yönetim Paneli</span>
                        </Link>
                      )}
                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100 text-center">
                        <Link
                          href="/giris"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <Package className="w-4 h-4 text-orange-600" />
                        <span>Misafir Sipariş Takibi</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link
              href="/favorilerim"
              className="relative flex items-center gap-1 p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-full sm:rounded-xl transition border border-transparent hover:border-rose-200"
              aria-label="Favorilerim"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold">Favorilerim</span>
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-1 sm:right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </Link>

            {/* Trendyol Style Cart Trigger */}
            <button
              onClick={openDrawer}
              className="relative flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 bg-stone-900 hover:bg-orange-600 text-white rounded-full sm:rounded-xl transition shadow-xs group"
              aria-label="Sepetim"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-stone-900 animate-scale">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-black">Sepetim</span>
            </button>

          </div>

        </div>
      </div>

      {/* TRENDYOL STYLE CATEGORIES NAVIGATION BAR */}
      <nav className="hidden lg:block border-t border-stone-200/80 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-bold text-stone-700 py-2.5 gap-2 overflow-x-auto no-scrollbar">
            
            {/* All Categories Link */}
            <li>
              <Link 
                href="/kategori/tum-urunler" 
                className="hover:text-orange-600 transition py-1 text-stone-900 font-extrabold border-b-2 border-transparent hover:border-orange-500 whitespace-nowrap"
              >
                Tüm Ürünler
              </Link>
            </li>

            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="hover:text-orange-600 transition py-1 border-b-2 border-transparent hover:border-orange-500 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              </li>
            ))}

            <li>
              <Link 
                href="/kategori/tum-urunler" 
                className="hover:text-orange-600 transition py-1 text-orange-600 font-extrabold border-b-2 border-transparent hover:border-orange-500 whitespace-nowrap"
              >
                Haftanın Vitrini
              </Link>
            </li>

            <li>
              <Link 
                href="/toptan-satis" 
                className="text-emerald-700 hover:text-emerald-800 transition py-1 flex items-center gap-1 font-black bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                <span>📦 Tahtakale Toptan</span>
              </Link>
            </li>

            <li>
              <Link 
                href="/hakkimizda" 
                className="text-stone-500 hover:text-orange-600 transition py-1"
              >
                Hakkımızda
              </Link>
            </li>

            <li>
              <Link 
                href="/iletisim" 
                className="text-stone-500 hover:text-orange-600 transition py-1"
              >
                İletişim & Konum
              </Link>
            </li>

          </ul>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-100 bg-white px-4 pt-3 pb-6 animate-slide-down">
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchModalOpen(true);
            }} 
            className="w-full flex items-center justify-between px-4 py-2.5 mb-4 bg-slate-100 text-slate-500 text-xs rounded-xl border border-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-600" />
              <span>Ürün ara...</span>
            </div>
            <span className="text-[10px] font-semibold text-brand-600 bg-white px-2 py-0.5 rounded">ARA</span>
          </button>

          <div className="space-y-1 divide-y divide-slate-100">
            <div className="pb-2">
              <Link
                href="/kategori/tum-urunler"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-brand-800"
              >
                Tüm Ürünler
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-xs font-medium text-slate-800 hover:text-brand-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 space-y-2 text-xs font-medium text-slate-600">
              <Link
                href="/siparis-takip"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1 text-slate-700"
              >
                <Package className="w-4 h-4 text-brand-600" />
                <span>Sipariş Takibi</span>
              </Link>
              <Link
                href="/toptan-satis"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-brand-700 font-semibold"
              >
                Toptan Satış & Teklif
              </Link>
              <Link
                href="/hakkimizda"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-slate-700"
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-slate-700"
              >
                İletişim & Eminönü Mağaza
              </Link>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}