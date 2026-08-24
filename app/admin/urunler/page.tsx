'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, Edit3, Trash2, ExternalLink, Sparkles, Play } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionDeleteProduct } from '@/app/actions/ecommerce-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const list = await DataService.getAllAdminProducts();
        setProducts(list);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      const res = await actionDeleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
        toast.success('Ürün başarıyla silindi.');
        try {
          const list = await DataService.getAllAdminProducts();
          setProducts(list);
        } catch {
          // Ignore
        }
      } else {
        toast.error(res.error || 'Ürün silinemedi.');
      }
    }
  };

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    return normalizeTurkish(p.name).includes(q) || normalizeTurkish(p.sku).includes(q);
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            <span>Ürün Envanter Yönetimi</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tüm ürünleri listeleyin, yeni ürün ekleyin, stok ve fiyat güncelleyin.
          </p>
        </div>

        <Link
          href="/admin/urunler/yeni"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ürün Ekle</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ürün adı veya SKU ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="text-xs text-stone-500 self-start sm:self-center font-medium">
          Toplam <strong>{filtered.length}</strong> Ürün
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            Kriterlere uygun ürün bulunamadı.
          </div>
        ) : (
          filtered.map((product) => {
            const validImages = (product.images || []).filter(
              (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
            );
            const cover = validImages[0]?.image_url;
            const hasVideo = Boolean(product.video_url && product.video_url.trim());

            return (
              <div key={product.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {cover ? (
                      <Image src={cover} alt={product.name} fill sizes="64px" className="object-cover" />
                    ) : hasVideo ? (
                      <div className="w-full h-full bg-stone-900 text-amber-400 flex flex-col items-center justify-center p-1">
                        <Play className="w-5 h-5 fill-amber-400" />
                        <span className="text-[8px] font-bold text-stone-300 mt-0.5">Video</span>
                      </div>
                    ) : (
                      <Sparkles className="w-5 h-5 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-700">{product.category?.name || 'Tahtakale'}</span>
                      {product.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">Vitrin</span>}
                    </div>
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-1">{product.name}</h3>
                    <div className="text-[10px] font-mono text-stone-400">SKU: {product.sku}</div>
                    <div className="text-xs font-black text-amber-700 pt-0.5">{formatPrice(product.price)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    product.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                  }`}>
                    Stok: {product.stock} Adet
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/urun/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-stone-500 hover:text-stone-800 rounded-lg border border-stone-200 active:scale-95"
                      title="Mağazada Gör"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/urunler/${product.id}`}
                      className="px-3 py-2 bg-stone-900 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1 min-h-[36px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 active:scale-95 min-h-[36px]"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Products Table (md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Görsel & Başlık</th>
                <th className="py-3.5 px-4">SKU Kodu</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Stok</th>
                <th className="py-3.5 px-4">Fiyat</th>
                <th className="py-3.5 px-4">Özellikler</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((product) => {
                const validImages = (product.images || []).filter(
                  (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
                );
                const cover = validImages[0]?.image_url;
                const hasVideo = Boolean(product.video_url && product.video_url.trim());

                return (
                  <tr key={product.id} className="hover:bg-stone-50 transition">
                    
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {cover ? (
                          <Image src={cover} alt={product.name} fill className="object-cover" />
                        ) : hasVideo ? (
                          <div className="w-full h-full bg-stone-900 text-amber-400 flex flex-col items-center justify-center p-0.5">
                            <Play className="w-4 h-4 fill-amber-400" />
                            <span className="text-[7px] font-bold text-stone-300">Video</span>
                          </div>
                        ) : (
                          <Sparkles className="w-4 h-4 text-stone-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 line-clamp-1">{product.name}</div>
                        <div className="text-[10px] text-stone-400">
                          {product.is_featured && <span className="text-amber-700 font-bold mr-2">★ Vitrin</span>}
                          {product.is_new && <span className="text-emerald-700 font-bold">Yeni</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-stone-600">{product.sku}</td>

                    <td className="py-3 px-4 text-stone-600">{product.category?.name || 'Genel'}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        product.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                      }`}>
                        {product.stock} Adet
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-amber-700">{formatPrice(product.price)}</td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                        {product.specifications?.length || 0} Dinamik Özellik
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/urun/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-stone-400 hover:text-stone-700 inline-block"
                        title="Mağazada Gör"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/urunler/${product.id}`}
                        className="p-1.5 text-amber-600 hover:text-amber-700 inline-block font-bold"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 inline-block"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
