'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, 
  Save, 
  Search, 
  ArrowLeft, 
  Globe, 
  Archive, 
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionUpdateQuickStock } from '@/app/actions/ecommerce-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

interface RowEditState {
  stock: number;
  price: number;
  costPrice: number | '' | null;
  wholesalePrice: number | '' | null;
  isPublished: boolean;
}

export default function QuickStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, RowEditState>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const list = await DataService.getAllAdminProducts();
        setProducts(list);
        const initialMap: Record<string, RowEditState> = {};
        list.forEach((p) => {
          initialMap[p.id] = { 
            stock: p.stock, 
            price: p.price,
            costPrice: p.cost_price !== undefined && p.cost_price !== null ? p.cost_price : '',
            wholesalePrice: p.wholesale_price !== undefined && p.wholesale_price !== null ? p.wholesale_price : '',
            isPublished: p.is_published !== false
          };
        });
        setEditedValues(initialMap);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleFieldChange = (id: string, field: keyof RowEditState, val: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleSaveRow = async (product: Product) => {
    const current = editedValues[product.id];
    if (!current) return;

    setIsSaving((prev) => ({ ...prev, [product.id]: true }));
    const wsPrice = current.wholesalePrice === '' || current.wholesalePrice === null 
      ? null 
      : Number(current.wholesalePrice);
    const cPrice = current.costPrice === '' || current.costPrice === null 
      ? null 
      : Number(current.costPrice);

    const res = await actionUpdateQuickStock(
      product.id,
      Number(current.stock) || 0,
      Number(current.price) || 0,
      cPrice,
      wsPrice,
      current.isPublished
    );
    setIsSaving((prev) => ({ ...prev, [product.id]: false }));

    if (res.success) {
      toast.success(`"${product.name}" güncellendi!`, {
        description: `Stok: ${current.stock} | Perakende: ${formatPrice(current.price)} | Alış: ${cPrice ? formatPrice(cPrice) : 'Yok'} | Durum: ${current.isPublished ? 'Yayında' : 'Sadece Depo'}`,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                stock: current.stock,
                price: current.price,
                cost_price: cPrice,
                wholesale_price: wsPrice,
                is_published: current.isPublished,
              }
            : p
        )
      );
    } else {
      toast.error(res.error || 'Güncelleme kaydedilemedi.');
    }
  };

  const handleSaveAll = async () => {
    const changedProducts = products.filter((p) => {
      const current = editedValues[p.id];
      if (!current) return false;
      const wsCurrent = current.wholesalePrice === '' ? null : current.wholesalePrice;
      const wsOld = p.wholesale_price || null;
      const cCurrent = current.costPrice === '' ? null : current.costPrice;
      const cOld = p.cost_price || null;
      return (
        current.stock !== p.stock ||
        current.price !== p.price ||
        cCurrent !== cOld ||
        wsCurrent !== wsOld ||
        current.isPublished !== (p.is_published !== false)
      );
    });

    if (changedProducts.length === 0) {
      toast.info('Değişiklik yapılan ürün bulunmuyor.');
      return;
    }

    setIsSavingAll(true);
    let successCount = 0;

    for (const p of changedProducts) {
      const current = editedValues[p.id];
      if (current) {
        const wsPrice = current.wholesalePrice === '' || current.wholesalePrice === null 
          ? null 
          : Number(current.wholesalePrice);
        const cPrice = current.costPrice === '' || current.costPrice === null 
          ? null 
          : Number(current.costPrice);
        const res = await actionUpdateQuickStock(
          p.id, 
          Number(current.stock) || 0, 
          Number(current.price) || 0, 
          cPrice,
          wsPrice, 
          current.isPublished
        );
        if (res.success) successCount++;
      }
    }

    setIsSavingAll(false);
    toast.success(`${successCount} ürün başarıyla güncellendi!`);

    const list = await DataService.getAllAdminProducts();
    setProducts(list);
  };

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    const nameMatch = normalizeTurkish(p.name).includes(q);
    const skuMatch = p.sku ? normalizeTurkish(p.sku).includes(q) : false;
    return nameMatch || skuMatch;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/urunler" className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600 fill-amber-500" />
              <span>Hızlı Stok, Çift Fiyat & Yayınlama Editörü</span>
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Excel gibi tek ekrandan perakende/toptan fiyatları, stok adetlerini ve sitede yayın durumunu güncelleyin.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSavingAll}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition min-h-[44px] disabled:opacity-60"
        >
          {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Tüm Değişiklikleri Topluca Kaydet</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hızlı arama yapın (Ürün adı veya barkod)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-brand-500 transition"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium hidden sm:block">
          Listelenen: <strong>{filtered.length}</strong> ürün
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">Görsel</th>
                <th className="py-3.5 px-4 min-w-[200px]">Ürün & Kod</th>
                <th className="py-3.5 px-4 w-32">Alış Maliyeti (₺)</th>
                <th className="py-3.5 px-4 w-32">Perakende (₺)</th>
                <th className="py-3.5 px-4 w-32">Toptan (₺)</th>
                <th className="py-3.5 px-4 w-28 text-center">Depo Stoğu</th>
                <th className="py-3.5 px-4 w-40 text-center">Web Satış (Yayın)</th>
                <th className="py-3.5 px-4 w-24 text-right">Kaydet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Envanter yükleniyor...</span>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((product) => {
                  const current = editedValues[product.id] || { 
                    stock: product.stock, 
                    price: product.price, 
                    costPrice: product.cost_price || '',
                    wholesalePrice: product.wholesale_price || '', 
                    isPublished: product.is_published !== false 
                  };
                  const isRowChanged =
                    current.stock !== product.stock ||
                    current.price !== product.price ||
                    (current.costPrice === '' ? null : current.costPrice) !== (product.cost_price || null) ||
                    (current.wholesalePrice === '' ? null : current.wholesalePrice) !== (product.wholesale_price || null) ||
                    current.isPublished !== (product.is_published !== false);
                  const coverImage = product.images?.find((img) => img.is_cover) || product.images?.[0];

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-stone-50/70 transition ${
                        isRowChanged ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Image */}
                      <td className="py-3 px-4 text-center">
                        <div className="relative w-10 h-10 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 mx-auto shrink-0">
                          {coverImage?.image_url ? (
                            <Image
                              src={coverImage.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400 font-bold">
                              OTK
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900 line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-stone-400">
                            {product.sku || 'KODSUZ'}
                          </span>
                          {product.category?.name && (
                            <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost Price Input */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0.00"
                          value={current.costPrice ?? ""}
                          onChange={(e) => handleFieldChange(product.id, 'costPrice', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full font-bold text-xs p-2 bg-amber-50/60 border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 text-amber-950"
                        />
                      </td>

                      {/* Retail Price Input */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={current.price}
                            onChange={(e) => handleFieldChange(product.id, 'price', Number(e.target.value))}
                            className="w-full font-bold text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-brand-600"
                          />
                        </div>
                      </td>

                      {/* Wholesale Price Input */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Yok"
                          value={current.wholesalePrice ?? ""}
                          onChange={(e) => handleFieldChange(product.id, 'wholesalePrice', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full font-semibold text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-brand-600 text-brand-900"
                        />
                      </td>

                      {/* Stock Count Input */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          value={current.stock}
                          onChange={(e) => handleFieldChange(product.id, 'stock', Number(e.target.value))}
                          className={`w-20 font-bold text-xs p-2 rounded-lg border text-center mx-auto focus:outline-none ${
                            current.stock <= 0
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-white border-stone-300 text-stone-900'
                          }`}
                        />
                      </td>

                      {/* Web Satış (is_published) Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(product.id, 'isPublished', !current.isPublished)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            current.isPublished
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {current.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          <span>{current.isPublished ? 'Sitede Satışta' : 'Sadece Depo'}</span>
                        </button>
                      </td>

                      {/* Save Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSaveRow(product)}
                          disabled={isSaving[product.id]}
                          className={`p-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 ${
                            isRowChanged
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title="Bu Satırı Kaydet"
                        >
                          {isSaving[product.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Kaydet</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Aramaya uygun ürün bulunamadı.
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

