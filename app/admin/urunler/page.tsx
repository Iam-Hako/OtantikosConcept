'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Archive, 
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionDeleteProduct, actionToggleProductPublish } from '@/app/actions/ecommerce-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'depot'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleTogglePublish = async (p: Product) => {
    const nextState = !p.is_published;
    setTogglingId(p.id);
    
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_published: nextState } : item))
    );

    const res = await actionToggleProductPublish(p.id, nextState);
    setTogglingId(null);

    if (res.success) {
      toast.success(
        nextState 
          ? `"${p.name}" web sitesinde yayına alındı!` 
          : `"${p.name}" web sitesinden kaldırıldı (sadece depo stoğu).`
      );
    } else {
      // Revert on error
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_published: !nextState } : item))
      );
      toast.error(res.error || 'Yayın durumu güncellenemedi.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" ürününü tamamen silmek istediğinize emin misiniz?`)) {
      const res = await actionDeleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
        toast.success('Ürün başarıyla silindi.');
      } else {
        toast.error(res.error || 'Ürün silinemedi.');
      }
    }
  };

  const filtered = products.filter((p) => {
    // 1. Tab Filter
    if (filterTab === 'published' && p.is_published === false) return false;
    if (filterTab === 'depot' && p.is_published !== false) return false;

    // 2. Search Filter
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    const nameMatch = normalizeTurkish(p.name).includes(q);
    const skuMatch = p.sku ? normalizeTurkish(p.sku).includes(q) : false;
    const catMatch = p.category?.name ? normalizeTurkish(p.category.name).includes(q) : false;
    return nameMatch || skuMatch || catMatch;
  });

  const publishedCount = products.filter((p) => p.is_published !== false).length;
  const depotCount = products.filter((p) => p.is_published === false).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            <span>Ürün & Depo Envanter Yönetimi</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Perakende & toptan fiyatları yönetin, tek tıkla web sitesinde satışa açın veya sadece depoya çekin.
          </p>
        </div>

        <Link
          href="/admin/urunler/yeni"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Ürün Ekle</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tüm Ürünler ({products.length})
            </button>
            <button
              onClick={() => setFilterTab('published')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                filterTab === 'published'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Sitede Satışta ({publishedCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('depot')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                filterTab === 'depot'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Sadece Depo Stoğu ({depotCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün adı, barkod veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Görsel</th>
                <th className="py-3.5 px-4">Ürün Adı & Barkod</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Fiyat (Perakende / Toptan)</th>
                <th className="py-3.5 px-4 text-center">Depo Stoğu</th>
                <th className="py-3.5 px-4 text-center">Web Satış Durumu</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Ürünler yükleniyor...</span>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((product) => {
                  const coverImage = product.images?.find((img) => img.is_cover) || product.images?.[0];
                  const isPub = product.is_published !== false;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/60 transition group">
                      
                      {/* Image */}
                      <td className="py-3 px-4 text-center">
                        <div className="relative w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 mx-auto shrink-0">
                          {coverImage?.image_url ? (
                            <Image
                              src={coverImage.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-bold">
                              OTK
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-stone-900 group-hover:text-brand-700 transition line-clamp-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.sku && (
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded">
                              {product.sku}
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded">
                              ⭐ Öne Çıkan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {product.category?.name || 'Kategorisiz'}
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-900 block">
                            {formatPrice(product.price)}
                          </span>
                          {product.wholesale_price ? (
                            <span className="text-[10px] font-semibold text-brand-800 bg-brand-50 px-1.5 py-0.5 rounded inline-block">
                              Toptan: {formatPrice(product.wholesale_price)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 block">-</span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${
                            product.stock <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : product.stock < 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {product.stock} Adet
                        </span>
                      </td>

                      {/* Publish Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(product)}
                          disabled={togglingId === product.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            isPub
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                          }`}
                          title={isPub ? 'Tıklayarak yayından kaldırın' : 'Tıklayarak sitede yayına alın'}
                        >
                          {togglingId === product.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isPub ? (
                            <Globe className="w-3.5 h-3.5" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                          <span>{isPub ? 'Yayında (Satışta)' : 'Sadece Depo'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPub && (
                            <Link
                              href={`/urun/${product.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-brand-600 hover:bg-brand-50 transition"
                              title="Sitede Görüntüle"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/urunler/${product.id}`}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Filtreye uygun ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
