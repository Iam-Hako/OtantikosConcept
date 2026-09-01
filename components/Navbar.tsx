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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-100 transition-all">
      {/* Search Modal Component */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-navy-950 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-brand-300">
            <Sparkles className="w-3.5 h-3.5" /> El Emeği Otantik Zanaat & Doğal Taş Koleksiyonları
          </span>
          <span className="mx-auto sm:mx-0">
            🚚 <strong>1.500 TL Üzeri Ücretsiz Kargo</strong> | Kapıda Ödeme & Taksit İmkanı
          </span>
          <Link href="/toptan-satis" className="hidden sm:inline text-brand-300 hover:text-white underline transition">
            Toptan Alım Teklifi Al
          </Link>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-brand-700 focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-brand-50 border border-brand-200 shrink-0">
                <Image
                  src="/otantikos-logo.webp"
                  alt="Otantikos Concept"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg sm:text-2xl text-slate-900 tracking-tight leading-none group-hover:text-brand-700 transition">
                  Otantikos
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-brand-600 tracking-widest uppercase mt-0.5">
                  Concept
                </span>
              </div>
            </Link>
          </div>

          {/* SEARCH BAR (CLICK TO OPEN FAST SEARCH ENGINE MODAL) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-brand-50/70 border border-slate-200 hover:border-brand-300 rounded-full text-slate-500 text-xs sm:text-sm transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-brand-600 group-hover:scale-110 transition" />
                <span className="text-slate-400 group-hover:text-slate-600">Ürün, doğal taş, kolye veya kod arayın...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded-md">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-2 text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition"
              aria-label="Arama"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/favorilerim"
              className="relative p-2 text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition"
              aria-label="Favorilerim"
            >
              <Heart className="w-5 h-5" />
              {totalFavorites > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {totalFavorites}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition flex items-center gap-1.5"
              aria-label="Sepetim"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Admin Menu */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-full sm:rounded-xl text-xs font-semibold transition border border-transparent hover:border-brand-200"
              >
                <User className="w-5 h-5 sm:w-4 sm:h-4 text-brand-600" />
                <span className="hidden sm:inline">{user ? user.email?.split('@')[0] : 'Giriş Yap'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-brand-100 py-2 z-50 animate-slide-down">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.full_name || 'Kullanıcı'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-brand-100 text-brand-900 rounded-md">
                            👑 Yönetici (Admin)
                          </span>
                        )}
                      </div>
                      <Link
                        href="/hesabim"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Siparişlerim & Bilgilerim</span>
                      </Link>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Kargo Takibi</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-brand-700 font-bold bg-brand-50/80 hover:bg-brand-100 transition"
                        >
                          <Settings className="w-4 h-4 text-brand-600" />
                          <span>Admin Yönetim Paneli</span>
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100 text-center">
                        <Link
                          href="/giris"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
                      >
                        <Package className="w-4 h-4 text-brand-600" />
                        <span>Misafir Sipariş Takibi</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* CATEGORIES NAVIGATION BAR */}
      <nav className="hidden lg:block border-t border-brand-100 bg-brand-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-bold text-slate-700 py-2.5">
            <li>
              <Link 
                href="/kategori/tum-urunler" 
                className="hover:text-brand-700 transition py-1"
              >
                Tüm Ürünler
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="hover:text-brand-700 transition py-1"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link 
                href="/toptan-satis" 
                className="text-brand-700 hover:text-brand-900 transition py-1 flex items-center gap-1"
              >
                ✨ Toptan Satış
              </Link>
            </li>
            <li>
              <Link 
                href="/hakkimizda" 
                className="text-slate-500 hover:text-brand-700 transition py-1"
              >
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link 
                href="/iletisim" 
                className="text-slate-500 hover:text-brand-700 transition py-1"
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
            className="w-full flex items-center justify-between px-4 py-2.5 mb-4 bg-slate-100 text-slate-500 text-xs rounded-xl border border-slate-200"
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

