'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, Edit3, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
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
      await DataService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Ürün başarıyla silindi.');
    }
  };

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    return normalizeTurkish(p.name).includes(q) || normalizeTurkish(p.sku).includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            <span>Ürün & Dinamik Özellik Yönetimi</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tüm Tahtakale ürünlerini, dinamik teknik özellik tablolarını, varyant ve görsellerini yönetin.
          </p>
        </div>

        <Link
          href="/admin/urunler/yeni"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Ürün Ekle</span>
        </Link>
      </div>

      {/* Search & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Ürün adı veya SKU ile filtreleyin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-stone-500 font-semibold">
          Toplam <strong>{filtered.length}</strong> Ürün
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
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
                const cover = product.images?.[0]?.image_url || '/images/logo.webp';
                return (
                  <tr key={product.id} className="hover:bg-stone-50 transition">
                    
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                        <Image src={cover} alt={product.name} fill className="object-cover" />
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
