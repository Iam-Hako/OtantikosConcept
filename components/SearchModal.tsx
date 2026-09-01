'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, Tag, ArrowRight, Loader2, Clock } from 'lucide-react';
import { DataService } from '@/lib/data/store-data';
import { Product, Category } from '@/lib/types/ecommerce';
import { formatPrice } from '@/lib/utils/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      DataService.getCategories().then(setCategories);
      try {
        const saved = localStorage.getItem('otk_recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Controlled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let active = true;
    if (query.trim().length >= 1) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        const res = await DataService.search(query, true);
        if (active) {
          setResults(res.slice(0, 8));
          setIsLoading(false);
        }
      }, 150);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);

  const handleSelectProduct = (product: Product) => {
    saveSearchQuery(query);
    onClose();
    router.push(`/urun/${product.slug}`);
  };

  const saveSearchQuery = (q: string) => {
    if (!q.trim()) return;
    try {
      const updated = [q.trim(), ...recentSearches.filter((item) => item !== q.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('otk_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-brand-200 overflow-hidden z-10 animate-slide-down">
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-brand-100 gap-3">
          <Search className="w-5 h-5 text-brand-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) {
                handleSelectProduct(results[0]);
              }
            }}
            placeholder="Ürün adı, zanaat taşları, gümüş, takı veya kod arayın..."
            className="w-full text-base sm:text-lg text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {isLoading && <Loader2 className="w-5 h-5 text-brand-500 animate-spin shrink-0" />}
          {query && !isLoading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition"
          >
            ESC
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {/* Results List */}
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2 pb-1">
                  <span>BULUNAN ÜRÜNLER ({results.length})</span>
                  <span>Enter tuşuna basarak ilk ürüne gidin</span>
                </div>
                {results.map((product) => {
                  const coverImage = product.images?.find((img) => img.is_cover) || product.images?.[0];
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50/80 border border-transparent hover:border-brand-200 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {coverImage?.image_url ? (
                            <Image
                              src={coverImage.image_url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                              OTK
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.category?.name && (
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {product.category.name}
                              </span>
                            )}
                            {product.sku && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {product.sku}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-slate-900 block">
                          {formatPrice(product.price)}
                        </span>
                        {product.wholesale_price ? (
                          <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-1.5 py-0.5 rounded">
                            Toptan: {formatPrice(product.wholesale_price)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-base font-semibold">Sonuç bulunamadı</p>
                  <p className="text-xs text-slate-400 mt-1">
                    &quot;{query}&quot; için eşleşen bir ürün yok. Farklı bir arama terimi deneyin.
                  </p>
                </div>
              )
            )
          ) : (
            <div className="space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> SON ARAMALAR
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('otk_recent_searches');
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 rounded-lg transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories */}
              <div>
                <span className="text-xs font-semibold text-slate-400 mb-2 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> KATEGORİLER
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-xs font-semibold text-slate-700 hover:text-brand-800 transition group"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Otantikos Akıllı Arama Motoru</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>Kapatmak için <strong>ESC</strong></span>
            <span>Açmak için <strong>Ctrl+K</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
