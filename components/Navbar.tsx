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
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/90 transition-all shadow-2xs">
      {/* Search Modal Component */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      {/* MAIN MINISO STYLE HEADER ROW */}
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-[#e60012] focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Miniso Style Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#e60012] rounded-xl flex flex-col items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-[10px] sm:text-[11px] font-black tracking-tighter leading-none">OTAN</span>
                <span className="text-[10px] sm:text-[11px] font-black tracking-tighter leading-none mt-0.5">TIKOS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-lg sm:text-xl text-stone-900 tracking-tight leading-none group-hover:text-[#e60012] transition">
                  Otantikos
                </span>
                <span className="text-[9px] font-extrabold text-[#e60012] tracking-widest uppercase mt-0.5">
                  CONCEPT
                </span>
              </div>
            </Link>
          </div>

          {/* MINISO STYLE WIDE SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center justify-between py-2.5 px-4 bg-[#f5f5f5] hover:bg-stone-200/60 border border-stone-200/80 rounded-md text-stone-400 text-xs sm:text-sm transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-stone-400">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
                <span className="text-xs sm:text-sm text-stone-400 font-normal group-hover:text-stone-600 transition-colors">
                  Ara...
                </span>
              </div>
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 rounded">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* MINISO STYLE RIGHT ACTION ICONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Favorilerim */}
            <Link
              href="/favorilerim"
              className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-2 text-stone-700 hover:text-[#e60012] transition rounded-lg group"
              aria-label="Favorilerim"
            >
              <div className="relative">
                <Heart className="w-5 h-5 sm:w-5 sm:h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
                {totalFavorites > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#e60012] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalFavorites}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-600 sm:text-stone-700">Favorilerim</span>
            </Link>

            {/* Hesabım Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-2 text-xs font-semibold text-stone-700 hover:text-[#e60012] transition rounded-lg group cursor-pointer"
              >
                <User className="w-5 h-5 sm:w-5 sm:h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-semibold text-stone-600 sm:text-stone-700 max-w-[70px] sm:max-w-[90px] truncate">
                  {user ? (user.full_name?.split(' ')[0] || user.email?.split('@')[0]) : 'Hesabım'}
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
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#e60012] font-medium transition"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Siparişlerim & Bilgilerim</span>
                      </Link>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#e60012] font-medium transition"
                      >
                        <Truck className="w-4 h-4 text-stone-400" />
                        <span>Kargo Takibi</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-700 font-bold bg-red-50 hover:bg-red-100 transition"
                        >
                          <Settings className="w-4 h-4 text-[#e60012]" />
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
                          className="block w-full py-2 px-4 bg-[#e60012] hover:bg-[#c90010] text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#e60012] transition"
                      >
                        <Package className="w-4 h-4 text-[#e60012]" />
                        <span>Misafir Sipariş Takibi</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sepetim */}
            <button
              onClick={openDrawer}
              className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-2 text-stone-700 hover:text-[#e60012] transition rounded-lg group cursor-pointer"
              aria-label="Sepetim"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 stroke-[1.8] group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#e60012] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-600 sm:text-stone-700">Sepetim</span>
            </button>

          </div>

        </div>

        {/* MINISO MOBILE ROW 2: FULL-WIDTH SEARCH BAR (EXACT AS SCREENSHOT) */}
        <div className="md:hidden pb-3 pt-0.5">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between py-2 px-3.5 bg-[#f5f5f5] hover:bg-stone-200/60 border border-stone-200/80 rounded-lg text-stone-400 text-xs transition group cursor-pointer"
          >
            <span className="text-xs text-stone-400 font-normal group-hover:text-stone-600 transition-colors">
              Ürün, kategori veya marka ara...
            </span>
            <Search className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* MINISO STYLE CATEGORIES SUBNAV (WITH CUTE MINI ICONS) */}
      <nav className="border-t border-stone-100 bg-white">
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-start lg:justify-between text-[11px] sm:text-xs font-semibold text-stone-700 py-2 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            
            {/* Tüm Ürünler */}
            <li className="shrink-0">
              <Link 
                href="/kategori/tum-urunler" 
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🎒</span>
                <span className="font-bold text-stone-900 group-hover:text-[#e60012]">Tüm Ürünler</span>
              </Link>
            </li>

            {/* İndirimli Ürünler */}
            <li className="shrink-0">
              <Link 
                href="/kategori/tum-urunler" 
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🏷️</span>
                <span className="text-[#e60012] font-bold">İndirimli Ürünler</span>
              </Link>
            </li>

            {/* Yeni */}
            <li className="shrink-0">
              <Link 
                href="/kategori/tum-urunler" 
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">⭐</span>
                <span>Yeni</span>
              </Link>
            </li>

            {/* Dynamic DB Categories (e.g. Kırtasiye) */}
            {categories.map((category) => (
              <li key={category.id} className="shrink-0">
                <Link
                  href={`/kategori/${category.slug}`}
                  className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">✏️</span>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}

            {/* Tahtakale Toptan */}
            <li className="shrink-0">
              <Link 
                href="/toptan-satis" 
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">📦</span>
                <span>Tahtakale Toptan</span>
              </Link>
            </li>

            {/* Sipariş Takip */}
            <li className="shrink-0">
              <Link 
                href="/siparis-takip" 
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🚚</span>
                <span>Sipariş Takip</span>
              </Link>
            </li>

            {/* Canlı Destek */}
            <li className="shrink-0">
              <a 
                href="https://wa.me/905077737777" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#e60012] transition-colors py-1 whitespace-nowrap group text-emerald-600 font-bold"
              >
                <span className="text-base group-hover:scale-110 transition-transform">💬</span>
                <span>Canlı Destek</span>
              </a>
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