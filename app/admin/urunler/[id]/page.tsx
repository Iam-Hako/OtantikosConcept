'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  UploadCloud,
  Loader2,
  Globe,
  Archive,
  RefreshCw,
  Barcode
} from 'lucide-react';
import { Category, ProductSpecification, ProductVariant, ProductImage, Product } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { actionSaveProduct } from '@/app/actions/ecommerce-actions';
import { slugify, convertGoogleDriveUrl, convertGoogleDriveVideoUrl } from '@/lib/utils/format';
import { uploadMediaFile } from '@/lib/utils/upload';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Main Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('');
  const [sku, setSku] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Dynamic Specs & Variants & Images
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Upload States & Refs
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const cats = await DataService.getCategories();
      setCategories(cats);

      if (productId) {
        const prod = await DataService.getProductById(productId);
        if (prod) {
          setProduct(prod);
          setName(prod.name);
          setSlug(prod.slug);
          setCategoryId(prod.category_id || (cats[0]?.id ?? ''));
          setPrice(prod.price);
          setWholesalePrice(prod.wholesale_price !== undefined && prod.wholesale_price !== null ? prod.wholesale_price : '');
          setStock(prod.stock);
          setSku(prod.sku || '');
          setIsPublished(prod.is_published ?? true);
          setShortDescription(prod.short_description || '');
          setDescription(prod.description || '');
          setVideoUrl(prod.video_url || '');
          setIsFeatured(prod.is_featured);
          setIsNew(prod.is_new);
          setSpecs(prod.specifications || []);
          setVariants(prod.variants || []);
          setImages(prod.images || []);
        } else {
          toast.error('Ürün bulunamadı.');
          router.push('/admin/urunler');
        }
      }
    }
    loadData();
  }, [productId, router]);

  const handleGenerateSku = () => {
    const randomCode = `OTK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setSku(randomCode);
    toast.info(`Otomatik kod üretildi: ${randomCode}`);
  };

  // Spec Builder
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

  // Variant Builder
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

  // Images
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

    setIsSaving(true);
    const cleanVideo = videoUrl.trim() ? (convertGoogleDriveVideoUrl(videoUrl.trim()) || videoUrl.trim()) : null;

    const res = await actionSaveProduct({
      id: productId,
      name,
      slug: slug || slugify(name),
      category_id: categoryId,
      price: Number(price) || 0,
      wholesale_price: wholesalePrice !== '' && wholesalePrice !== null ? Number(wholesalePrice) : null,
      stock: Number(stock) || 0,
      sku: sku.trim() || null,
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

    setIsSaving(false);

    if (res.success && res.product) {
      toast.success(`"${res.product.name}" güncellendi!`);
      router.push('/admin/urunler');
    } else {
      toast.error(res.error || 'Ürün güncellenemedi.');
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
              Ürünü Düzenle: {name || 'Yükleniyor...'}
            </h1>
            <p className="text-xs text-stone-500">Stok, perakende/toptan fiyat ve yayın durumu güncelleme</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info & Specs */}
        <div className="lg:col-span-2 space-y-6">
          
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
                onChange={(e) => setName(e.target.value)}
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
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Detaylı Ürün Açıklaması</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Specs Builder */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Ürün Özellik Tablosu</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={addSpecRow}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-lg border border-brand-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yeni Özellik</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="Örn: Malzeme / Boyut"
                    value={spec.spec_key}
                    onChange={(e) => updateSpecRow(index, e.target.value, spec.spec_value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Örn: 316L Çelik"
                    value={spec.spec_value}
                    onChange={(e) => updateSpecRow(index, spec.spec_key, e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="text-stone-400 hover:text-rose-600 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variants Builder */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Renk / Model Varyantları</span>
                </h2>
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

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 items-center">
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Varyant Türü</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariantRow(index, 'name', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Değer</label>
                    <input
                      type="text"
                      value={variant.value}
                      onChange={(e) => updateVariantRow(index, 'value', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Stok</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariantRow(index, 'stock', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(index)}
                      className="text-stone-400 hover:text-rose-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Publishing Status Toggle */}
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

          {/* Pricing & Stock */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Fiyat & Depo Stoğu
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Perakende Satış Fiyatı (₺) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-base font-bold p-3 bg-brand-50 text-brand-900 border border-brand-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Toptan Satış Fiyatı (₺ - Opsiyonel)
              </label>
              <input
                type="number"
                min="0"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Örn: 220"
                className="w-full text-sm font-semibold p-2.5 bg-stone-50 text-stone-800 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Toplam Depo Stoğu *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-brand-600" />
                  <span>Barkod / Stok Kodu</span>
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
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-700"
              />
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="font-semibold text-stone-700">⭐ Çok Satan / Öne Çıkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="font-semibold text-stone-700">✨ Yeni Koleksiyon</span>
              </label>
            </div>
          </div>

          {/* Product Images (Supabase Storage) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span>Ürün Fotoğrafları ({images.length})</span>
              </h2>
            </div>

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
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 hover:bg-brand-50 text-brand-800 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer disabled:opacity-60"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  <span>Supabase&apos;e Yükleniyor...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 text-brand-600" />
                  <span>📁 Cihazdan Yeni Fotoğraf Yükle</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Veya URL yapıştırın..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg"
              >
                Ekle
              </button>
            </div>

            {images.length > 0 && (
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
                          img.is_cover ? 'bg-amber-400 text-stone-900' : 'bg-white/80 text-stone-800'
                        }`}
                        title="Kapak Yap"
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {img.is_cover && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-stone-900 text-[9px] font-black px-1.5 py-0.5 rounded">
                        KAPAK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </form>
  );
}
