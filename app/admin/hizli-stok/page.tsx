'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Save, Check, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
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

  const handleStockChange = (productId: string, val: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        stock: Math.max(0, val),
      },
    }));
  };

  const handlePriceChange = (productId: string, val: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: Math.max(0, val),
      },
    }));
  };

  const handleSaveRow = async (product: Product) => {
    const current = editedValues[product.id];
    if (!current) return;

    setIsSaving((prev) => ({ ...prev, [product.id]: true }));
    await DataService.updateQuickStockAndPrice(product.id, current.stock, current.price);
    setIsSaving((prev) => ({ ...prev, [product.id]: false }));

    toast.success(`"${product.name}" güncellendi!`, {
      description: `Yeni Stok: ${current.stock} adet | Yeni Fiyat: ${formatPrice(current.price)} (Anında canlıda)`,
    });
  };

  const handleSaveAll = async () => {
    for (const p of products) {
      const current = editedValues[p.id];
      if (current && (current.stock !== p.stock || current.price !== p.price)) {
        await DataService.updateQuickStockAndPrice(p.id, current.stock, current.price);
      }
    }
    toast.success('Tüm ürün stok ve fiyat değişiklikleri canlıya kaydedildi!');
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-600" />
            <span>Hızlı Toplu Stok & Fiyat Düzenleme Izgarası (Quick Grid)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Ürün sayfasına girmeden doğrudan tablo üzerinden anlık stok adedini ve satış fiyatını değiştirip kaydedin.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
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

      {/* Editable Grid Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
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
                const cover = product.images?.[0]?.image_url || '/images/logo.webp';
                const current = editedValues[product.id] || { stock: product.stock, price: product.price };
                const isChanged = current.stock !== product.stock || current.price !== product.price;

                return (
                  <tr key={product.id} className={`hover:bg-amber-50/30 transition ${isChanged ? 'bg-amber-50/50' : ''}`}>
                    
                    {/* Image & Title */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                        <Image src={cover} alt={product.name} fill className="object-cover" />
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
