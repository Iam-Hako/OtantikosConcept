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
  LogOut
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useAuth } from '@/lib/store/auth-context';
import { DataService } from '@/lib/data/store-data';
import { Category, Product } from '@/lib/types/ecommerce';
import { formatPrice } from '@/lib/utils/format';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { totalFavorites } = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
  }, []);

  // Live search filtering with Turkish character normalization directly from DataService
  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim().length > 1) {
        const results = await DataService.search(searchQuery);
        setSearchResults(results.slice(0, 5));
        setIsSearchOpen(true);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }
    performSearch();
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/kategori/tum-urunler?ara=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200 shadow-2xs">
      
      {/* MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          
          {/* 1. Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-amber-700 focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-xl bg-stone-900 border border-stone-800 p-1 flex items-center justify-center shadow-xs">
                <Image
                  src="/images/logo.webp"
                  alt="Otantikos Concept Logo"
                  width={44}
                  height={44}
                  className="object-contain transform group-hover:scale-105 transition duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl sm:text-2xl text-stone-900 tracking-tight leading-none group-hover:text-amber-700 transition">
                  OTANTİKOS
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-amber-700 leading-tight">
                  CONCEPT
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Search Bar with Live Autocomplete */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün adı veya özellik ara..."
                className="w-full bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-stone-900 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-full border border-stone-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-700 absolute right-3 top-2.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Search Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-slide-down">
                <div className="p-2 text-xs font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  Eşleşen Ürünler ({searchResults.length})
                </div>
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/urun/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-amber-50/50 transition group"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        {product.images && product.images[0] && (
                          <Image
                            src={product.images[0].image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-amber-700">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Stok: {product.stock > 0 ? `${product.stock} Adet` : 'Tükendi'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/kategori/tum-urunler?ara=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="block text-center py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                >
                  Tüm Sonuçları Gör ({searchQuery}) ➔
                </Link>
              </div>
            )}
          </div>

          {/* 3. Favorilerim, 4. Sepetim, 5. Giriş Yap / Hesabım */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 3. Favorilerim Butonu */}
            <Link
              href="/favorilerim"
              className="relative p-2 text-stone-700 hover:text-amber-700 transition rounded-full hover:bg-stone-100"
              aria-label="Favorilerim"
            >
              <Heart className="w-5 h-5" />
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </Link>

            {/* 4. Sepetim Butonu */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 bg-stone-900 hover:bg-amber-700 text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-xs transition"
              aria-label="Sepetim"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Sepetim</span>
            </button>

            {/* 5. Giriş Yap / Hesabım Butonu */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-stone-700 hover:text-amber-700 transition rounded-full hover:bg-stone-100 focus:outline-none"
                aria-label="Hesabım"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-semibold text-stone-800">
                  {user ? (user.full_name?.split(' ')[0] || 'Hesabım') : 'Giriş Yap'}
                </span>
                <ChevronDown className="hidden md:inline w-3 h-3 text-stone-400" />
              </button>

              {isUserDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-slide-down"
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900">{user.full_name || 'Kullanıcı'}</p>
                        <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                            Yönetici
                          </span>
                        )}
                      </div>
                      <Link
                        href="/hesabim"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium"
                      >
                        <User className="w-4 h-4" />
                        <span>Siparişlerim & Bilgilerim</span>
                      </Link>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-700 font-medium"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Kargo Takibi</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-amber-700 font-bold hover:bg-amber-50"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Yönetim Paneli</span>
                        </Link>
                      )}
                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold"
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
                          className="block w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          Giriş Yap / Kayıt Ol
                        </Link>
                      </div>
                      <Link
                        href="/siparis-takip"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-700"
                      >
                        <Package className="w-4 h-4" />
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
      <nav className="hidden lg:block border-t border-stone-100 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-bold text-stone-700 py-2.5">
            <li>
              <Link 
                href="/kategori/tum-urunler" 
                className="hover:text-amber-700 transition py-1"
              >
                Tüm Ürünler
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="hover:text-amber-700 transition py-1"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link 
                href="/toptan-satis" 
                className="text-stone-500 hover:text-amber-700 transition py-1"
              >
                Toptan Satış
              </Link>
            </li>
            <li>
              <Link 
                href="/hakkimizda" 
                className="text-stone-500 hover:text-amber-700 transition py-1"
              >
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link 
                href="/iletisim" 
                className="text-stone-500 hover:text-amber-700 transition py-1"
              >
                İletişim & Konum
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 animate-slide-down">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full bg-stone-100 text-stone-900 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-1 divide-y divide-stone-100">
            <div className="pb-2">
              <Link
                href="/kategori/tum-urunler"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-amber-800"
              >
                Tüm Ürünler
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-xs font-medium text-stone-800 hover:text-amber-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 space-y-2 text-xs font-medium text-stone-600">
              <Link
                href="/siparis-takip"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1 text-stone-700"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span>Sipariş Takibi</span>
              </Link>
              <Link
                href="/toptan-satis"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-stone-700"
              >
                Toptan Satış & Teklif
              </Link>
              <Link
                href="/hakkimizda"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-stone-700"
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-stone-700"
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
