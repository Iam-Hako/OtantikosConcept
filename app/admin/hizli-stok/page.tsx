'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Save, Check, Search, RefreshCw, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionUpdateQuickStock } from '@/app/actions/ecommerce-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function QuickStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, { stock: number; price: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadProducts() {
      const list = await DataService.getAllAdminProducts();
      setProducts(list);
      const initialMap: Record<string, { stock: number; price: number }> = {};
      list.forEach((p) => {
        initialMap[p.id] = { stock: p.stock, price: p.price };
      });
      setEditedValues(initialMap);
    }
    loadProducts();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        stock: Math.max(0, isNaN(val) ? 0 : val),
      },
    }));
  };

  const handlePriceChange = (id: string, val: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        price: Math.max(0, isNaN(val) ? 0 : val),
      },
    }));
  };

  const handleSaveRow = async (product: Product) => {
    const current = editedValues[product.id];
    if (!current) return;

    setIsSaving((prev) => ({ ...prev, [product.id]: true }));
    const res = await actionUpdateQuickStock(
      product.id,
      current.stock,
      current.price
    );
    setIsSaving((prev) => ({ ...prev, [product.id]: false }));

    if (res.success) {
      toast.success(`"${product.name}" güncellendi!`, {
        description: `Yeni Stok: ${current.stock} Adet | Yeni Fiyat: ${formatPrice(current.price)}`,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: current.stock, price: current.price } : p))
      );
    } else {
      toast.error(res.error || 'Güncelleme kaydedilemedi.');
    }
  };

  const handleSaveAll = async () => {
    const changedProducts = products.filter((p) => {
      const current = editedValues[p.id];
      return current && (current.stock !== p.stock || current.price !== p.price);
    });

    if (changedProducts.length === 0) {
      toast.info('Değişiklik yapılan ürün bulunmuyor.');
      return;
    }

    let successCount = 0;
    for (const p of changedProducts) {
      const current = editedValues[p.id];
      if (current) {
        const res = await actionUpdateQuickStock(p.id, current.stock, current.price);
        if (res.success) successCount++;
      }
    }

    toast.success(`${successCount} ürünün stok ve fiyatı başarıyla güncellendi!`);
    const list = await DataService.getAllAdminProducts();
    setProducts(list);
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
          <div className="flex items-center gap-2">
            <Link href="/admin/urunler" className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600" />
              <span>Hızlı Stok & Fiyat Matrisi</span>
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 ml-8">
            Tüm Tahtakale ürünlerinin stok adetlerini ve satış fiyatlarını Excel hızında tek ekrandan düzenleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>Tüm Değişiklikleri Kaydet</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tabloda ürün veya SKU ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-stone-500 font-semibold">
          {filtered.length} Ürün Listeleniyor
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.map((product) => {
          const validImages = (product.images || []).filter(
            (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
          );
          const cover = validImages[0]?.image_url;
          const hasVideo = Boolean(product.video_url && product.video_url.trim());
          const current = editedValues[product.id] || { stock: product.stock, price: product.price };
          const isChanged = current.stock !== product.stock || current.price !== product.price;

          return (
            <div
              key={product.id}
              className={`p-4 bg-white rounded-2xl border shadow-2xs space-y-3 transition ${
                isChanged ? 'border-amber-400 bg-amber-50/30' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {cover ? (
                    <Image src={cover} alt={product.name} fill sizes="56px" className="object-cover" />
                  ) : hasVideo ? (
                    <div className="w-full h-full bg-stone-900 text-amber-400 flex flex-col items-center justify-center p-1">
                      <Play className="w-4 h-4 fill-amber-400" />
                      <span className="text-[8px] font-bold text-stone-300">Video</span>
                    </div>
                  ) : (
                    <Sparkles className="w-4 h-4 text-stone-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700">{product.category?.name || 'Tahtakale'}</span>
                  <h3 className="font-bold text-xs text-stone-900 truncate">{product.name}</h3>
                  <div className="text-[10px] font-mono text-stone-400">SKU: {product.sku}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Stok (Adet)</label>
                  <input
                    type="number"
                    min="0"
                    value={current.stock}
                    onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                    className="w-full text-base sm:text-xs font-bold p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-center text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Fiyat (₺)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={current.price}
                    onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                    className="w-full text-base sm:text-xs font-bold p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-center text-stone-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveRow(product)}
                disabled={isSaving[product.id]}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[40px] shadow-2xs ${
                  isChanged
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                {isSaving[product.id] ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isChanged ? 'Kaydet (Değişiklik Var)' : 'Güncel'}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Editable Grid Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Görsel & Ürün</th>
                <th className="py-3.5 px-4">SKU Kodu</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 w-36">Stok Adedi</th>
                <th className="py-3.5 px-4 w-44">Satış Fiyatı (₺)</th>
                <th className="py-3.5 px-4 text-right">Canlı Kaydet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((product) => {
                const validImages = (product.images || []).filter(
                  (img) => img.image_url && img.image_url !== '/images/logo.webp' && !img.image_url.endsWith('logo.webp')
                );
                const cover = validImages[0]?.image_url;
                const hasVideo = Boolean(product.video_url && product.video_url.trim());
                const current = editedValues[product.id] || { stock: product.stock, price: product.price };
                const isChanged = current.stock !== product.stock || current.price !== product.price;

                return (
                  <tr key={product.id} className={`hover:bg-amber-50/30 transition ${isChanged ? 'bg-amber-50/50' : ''}`}>
                    
                    {/* Image & Title */}
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
                        <Link href={`/admin/urunler/${product.id}`} className="font-bold text-stone-900 hover:text-amber-700">
                          {product.name}
                        </Link>
                        <div className="text-[10px] text-stone-400">
                          {product.variants?.length ? `${product.variants.length} Varyant Mevcut` : 'Tek Varyant'}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-stone-600 font-bold text-[11px]">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-600">
                      {product.category?.name || 'Genel'}
                    </td>

                    {/* Inline Stock Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={current.stock}
                        onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                        className={`w-28 text-xs font-bold p-2 border rounded-lg focus:outline-none focus:border-amber-600 text-center ${
                          current.stock <= 5 ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-stone-50 border-stone-300 text-stone-900'
                        }`}
                      />
                    </td>

                    {/* Inline Price Input */}
                    <td className="py-3 px-4">
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-2 font-bold text-stone-400">₺</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={current.price}
                          onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                          className="w-full text-xs font-bold pl-7 pr-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900"
                        />
                      </div>
                    </td>

                    {/* Save Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveRow(product)}
                        disabled={isSaving[product.id]}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs ${
                          isChanged
                            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                        }`}
                      >
                        {isSaving[product.id] ? (
                          <span>Kaydediliyor...</span>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{isChanged ? 'Kaydet' : 'Güncel'}</span>
                          </>
                        )}
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
