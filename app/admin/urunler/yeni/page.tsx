'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  Check,
  Star,
  UploadCloud,
  Loader2,
  Globe,
  Archive,
  RefreshCw,
  Barcode
} from 'lucide-react';
import { Category, ProductSpecification, ProductVariant, ProductImage } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { actionSaveProduct } from '@/app/actions/ecommerce-actions';
import { slugify, convertGoogleDriveUrl, convertGoogleDriveVideoUrl } from '@/lib/utils/format';
import { uploadMediaFile } from '@/lib/utils/upload';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  // Main Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('');
  const [sku, setSku] = useState('');
  const [isPublished, setIsPublished] = useState(true); // true = Sitede Yayında, false = Sadece Depo Stoğu
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Upload States & Refs
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Specifications & Variants
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    DataService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleGenerateSku = () => {
    const randomCode = `OTK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setSku(randomCode);
    toast.info(`Otomatik kod üretildi: ${randomCode}`);
  };

  // Spec Builder Helpers
  const addSpecRow = () => {
    setSpecs((prev) => [
      ...prev,
      { spec_key: '', spec_value: '', display_order: prev.length + 1 }
    ]);
  };

  const updateSpecRow = (index: number, key: string, value: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], spec_key: key, spec_value: value };
      return copy;
    });
  };

  const removeSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant Builder Helpers
  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { name: 'Model / Renk', value: '', stock: 10, is_active: true }
    ]);
  };

  const updateVariantRow = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Image Upload Helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const formatted = convertGoogleDriveUrl(newImageUrl.trim());
    setImages((prev) => [
      ...prev,
      {
        image_url: formatted,
        is_cover: prev.length === 0,
        display_order: prev.length + 1,
        alt_text: name,
      }
    ]);
    setNewImageUrl('');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedUrl = await uploadMediaFile(file);
        if (uploadedUrl) {
          setImages((prev) => [
            ...prev,
            {
              image_url: uploadedUrl,
              is_cover: prev.length === 0,
              display_order: prev.length + 1,
              alt_text: name || file.name,
            },
          ]);
          successCount++;
        }
      } catch (err: any) {
        toast.error(`"${file.name}" yüklenirken hata: ${err.message || 'Hata oluştu'}`);
      }
    }

    setIsUploadingImage(false);
    if (e.target) e.target.value = '';
    if (successCount > 0) {
      toast.success(`${successCount} fotoğraf Supabase'e yüklendi!`);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const uploadedUrl = await uploadMediaFile(file);
      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        toast.success('Tanıtım videosu başarıyla yüklendi!');
      }
    } catch (err: any) {
      toast.error(`Video yüklenirken hata: ${err.message || 'Bağlantı hatası'}`);
    } finally {
      setIsUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_cover: i === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Lütfen ürün adını giriniz.');
      return;
    }

    const cleanVideo = videoUrl.trim() ? (convertGoogleDriveVideoUrl(videoUrl.trim()) || videoUrl.trim()) : null;

    const res = await actionSaveProduct({
      name,
      slug: slug || slugify(name),
      category_id: categoryId,
      price: Number(price) || 0,
      cost_price: costPrice !== '' ? Number(costPrice) : null,
      wholesale_price: wholesalePrice ? Number(wholesalePrice) : null,
      stock: Number(stock) || 0,
      sku: sku.trim() || null, // Optional, auto-generated on backend if null
      is_published: isPublished,
      short_description: shortDescription,
      description,
      video_url: cleanVideo,
      is_featured: isFeatured,
      is_new: isNew,
      specifications: specs.filter((s) => s.spec_key.trim() && s.spec_value.trim()),
      variants: variants.filter((v) => v.value.trim()),
      images: images,
    });

    if (res.success && res.product) {
      toast.success(`"${res.product.name}" başarıyla oluşturuldu!`, {
        description: isPublished 
          ? 'Ürün canlı web sitesinde yayında.' 
          : 'Ürün sadece iç depo stoğuna kaydedildi (webde gizli).',
      });
      router.push('/admin/urunler');
    } else {
      toast.error(res.error || 'Ürün oluşturulamadı.');
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/urunler" className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
              + Yeni Ürün & Stok Kartı Tanımla
            </h1>
            <p className="text-xs text-stone-500">Perakende & toptan fiyat, depo yayınlama ve görsel yönetimi</p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Ürünü Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info, Specs & Variants (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Information */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Temel Ürün Bilgileri
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Ürün Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn: 316L Kararmaz Çelik İtalyan Kolye"
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">URL / Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kısa Tanıtım (Vurgu)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Örn: Suya, parfüme dayanıklı 316L çelik İtalyan ezme kolye."
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Detaylı Ürün Açıklaması</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ürünün detaylı zanaat ve malzeme bilgileri..."
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* 2. SPEC BUILDER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Ürün Özellik Tablosu (Opsiyonel)</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Ürün sayfasındaki bilgi tablosuna özellik ekleyin (Örn: Malzeme, Ölçü, Taş Türü).
                </p>
              </div>

              <button
                type="button"
                onClick={addSpecRow}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-lg border border-brand-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yeni Özellik Ekle</span>
              </button>
            </div>

            {specs.length === 0 && (
              <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
                Henüz özel bir teknik özellik eklenmedi. Gerekirse yukarıdaki butondan ekleyebilirsiniz.
              </div>
            )}

            <div className="space-y-2.5">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="Örn: Malzeme / Boyut"
                    value={spec.spec_key}
                    onChange={(e) => updateSpecRow(index, e.target.value, spec.spec_value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-brand-600 font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Örn: 316L Çelik / 45 cm"
                    value={spec.spec_value}
                    onChange={(e) => updateSpecRow(index, spec.spec_key, e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-brand-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 transition"
                    title="Özelliği Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. VARIANTS BUILDER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Renk / Beden / Model Seçenekleri (Opsiyonel)</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Farklı renk veya beden seçenekleri varsa ekleyin. Tek model ürünler için boş bırakabilirsiniz.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariantRow}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-lg border border-brand-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Seçenek Ekle</span>
              </button>
            </div>

            {variants.length === 0 && (
              <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
                Ayrı renk/beden seçeneği tanımlanmadı. Ürün tek model olarak satışa sunulacaktır.
              </div>
            )}

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 items-center">
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Varyant Türü</label>
                    <input
                      type="text"
                      placeholder="Renk / Model"
                      value={variant.name}
                      onChange={(e) => updateVariantRow(index, 'name', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Seçenek Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: 18K Altın Kaplama"
                      value={variant.value}
                      onChange={(e) => updateVariantRow(index, 'value', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Varyant Stoğu</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariantRow(index, 'stock', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-center font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(index)}
                      className="text-stone-400 hover:text-rose-600 p-2 transition ml-auto"
                      title="Varyantı Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Publishing Toggle, Pricing, Media & SKU (1 Col) */}
        <div className="space-y-6">
          
          {/* 1. PUBLISH STATUS TOGGLE CARD */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center justify-between">
              <span>Yayınlama Durumu</span>
              {isPublished ? (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Sitede Yayında
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                  <Archive className="w-3 h-3" /> Sadece Depo Stoğu
                </span>
              )}
            </h2>

            <div 
              onClick={() => setIsPublished(!isPublished)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                isPublished 
                  ? 'bg-emerald-50/70 border-emerald-300' 
                  : 'bg-amber-50/70 border-amber-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isPublished}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isPublished ? 'Web Sitesinde Yayınla' : 'Sadece Depo Stoğu Olarak Sakla'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPublished 
                    ? 'Açık: Ürün online mağazada sergilenir ve müşteriler tarafından satın alınabilir.' 
                    : 'Kapalı: Ürün web sitesinde gizlenir, sadece depo ve admin panelinizde takip edilir.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. PRICING & STOCK (RETAIL & WHOLESALE) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Fiyat & Depo Stoğu
            </h2>

            {/* Retail Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Perakende Satış Fiyatı (₺) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Örn: 450"
                className="w-full text-base font-bold p-3 bg-brand-50 text-brand-900 border border-brand-300 rounded-xl focus:bg-white focus:outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">Web sitesindeki standart son kullanıcı fiyatı</p>
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Alış / Maliyet Fiyatı (₺ - Kâr Hesabı İçin)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Örn: 120"
                className="w-full text-sm font-bold p-2.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-xl focus:bg-white focus:outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">Tahtakale / toptancıdan birim alış maliyetiniz</p>
            </div>

            {/* Wholesale Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Toptan Satış Fiyatı (₺ - Opsiyonel)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="Örn: 220"
                className="w-full text-sm font-semibold p-2.5 bg-stone-50 text-stone-800 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">Toplu alım veya B2B müşteriler için geçerli birim fiyat</p>
            </div>

            {/* Stock Count */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Toplam Depo Stoğu *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Örn: 50"
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold"
              />
            </div>

            {/* SKU / Barcode (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-brand-600" />
                  <span>Barkod / Stok Kodu (Opsiyonel)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] font-bold text-brand-700 hover:text-brand-900 flex items-center gap-0.5"
                >
                  <RefreshCw className="w-3 h-3" /> Otomatik Üret
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Boş bırakılırsa otomatik üretilir"
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-700"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Barkodunuz yoksa boş bırakabilirsiniz; sistem otomatik benzersiz kod atar.
              </p>
            </div>

            {/* Badges */}
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="font-semibold text-stone-700">⭐ Çok Satan / Öne Çıkan Ürün</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="font-semibold text-stone-700">✨ Yeni Koleksiyon Rozeti</span>
              </label>
            </div>
          </div>

          {/* 3. PRODUCT IMAGES (SUPABASE STORAGE) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span>Ürün Fotoğrafları ({images.length})</span>
              </h2>
            </div>

            {/* Supabase Storage Direct Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 hover:bg-brand-50 text-brand-800 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer disabled:opacity-60"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                    <span>Supabase&apos;e Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-brand-600" />
                    <span>📁 Cihazdan Fotoğraf Seç / Yükle</span>
                    <span className="text-[10px] text-brand-600/80 font-normal">
                      Doğrudan Supabase Storage veritabanına kaydeder
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Add by URL */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Veya görsel linki yapıştırın..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg hover:bg-stone-900"
              >
                Ekle
              </button>
            </div>

            {/* Images Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100">
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || 'Ürün Görseli'}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverImage(index)}
                        className={`p-1.5 rounded-lg text-xs font-bold ${
                          img.is_cover ? 'bg-amber-400 text-stone-900' : 'bg-white/80 text-stone-800 hover:bg-white'
                        }`}
                        title="Kapak Fotoğrafı Yap"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        title="Görseli Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {img.is_cover && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-stone-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                        KAPAK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-[11px] text-stone-400">
                Henüz görsel eklenmedi.
              </div>
            )}
          </div>

          {/* 4. VIDEO UPLOAD */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-brand-600" />
              <span>Ürün Tanıtım Videosu (Opsiyonel)</span>
            </h2>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingVideo}
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {isUploadingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span>Video Yükleniyor...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-brand-600" />
                  <span>🎥 Cihazdan Video Yükle</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Veya Video MP4 / Drive Linki..."
              className="w-full text-base sm:text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

        </div>

      </div>

    </form>
  );
}
