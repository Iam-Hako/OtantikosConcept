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
  Loader2
} from 'lucide-react';
import { Category, ProductSpecification, ProductVariant, ProductImage } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
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
  const [stock, setStock] = useState<number | string>('');
  const [sku, setSku] = useState('');
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

  // Specifications Builder (Starts completely empty)
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);

  // Variants Builder (Starts completely empty)
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Images (Starts completely empty)
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

  // Image Gallery & Upload Helpers
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
      toast.success(`${successCount} fotoğraf başarıyla yüklendi!`);
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

    const newProd = await DataService.saveProduct({
      name,
      slug: slug || slugify(name),
      category_id: categoryId,
      price: Number(price),
      stock: Number(stock),
      sku,
      short_description: shortDescription,
      description,
      video_url: convertGoogleDriveVideoUrl(videoUrl) || null,
      is_featured: isFeatured,
      is_new: isNew,
      specifications: specs.filter((s) => s.spec_key.trim() && s.spec_value.trim()),
      variants: variants.filter((v) => v.value.trim()),
      images: images.length > 0 ? images : [],
    });

    toast.success(`"${newProd.name}" başarıyla oluşturuldu!`, {
      description: 'Ürün Vercel derlemesine ihtiyaç duymadan anında canlı sitede yayında.',
    });
    router.push('/admin/urunler');
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
              + Yeni Ürün & Özellik Tanımla
            </h1>
            <p className="text-xs text-stone-500">Dinamik özellik tablosu, varyantlar ve medya yönetimi</p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Ürünü Canlıya Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info & Specs (2 Cols) */}
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
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-medium"
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
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Ürün Özellik Tablosu (Opsiyonel)</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Ürün sayfasındaki bilgi tablosuna özellik ekleyin (Örn: Malzeme, Ölçü, Garanti). İstemiyorsanız boş bırakabilirsiniz.
                </p>
              </div>

              <button
                type="button"
                onClick={addSpecRow}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300 transition flex items-center gap-1"
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

            {/* Specs Rows */}
            <div className="space-y-2.5">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="Örn: Malzeme / Boyut"
                    value={spec.spec_key}
                    onChange={(e) => updateSpecRow(index, e.target.value, spec.spec_value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Örn: 316L Çelik / 45 cm"
                    value={spec.spec_value}
                    onChange={(e) => updateSpecRow(index, spec.spec_key, e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
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
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Renk / Beden / Model Seçenekleri (Opsiyonel)</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Farklı renk veya beden seçenekleri varsa ekleyin. Tek model ürünler için boş bırakabilirsiniz.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariantRow}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300 transition flex items-center gap-1"
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

        {/* Right Column: Pricing, Images, Video & Badges (1 Col) */}
        <div className="space-y-6">
          
          {/* Pricing & Main Stock */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Fiyat & Toplam Stok
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Doğrudan Net Fiyat (₺) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-sm font-black p-3 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Toplam Stok Adedi *</label>
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">SKU / Stok Kodu *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            {/* Badges */}
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-semibold text-stone-800">Vitrin Ürünü Olarak Göster</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-semibold text-stone-800">Yeni Gelenler Rozeti Ekle</span>
              </label>
            </div>
          </div>

          {/* Media & Multi-Image Gallery */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Görsel Galerisi & Kapak</span>
              </h2>
              <span className="text-[11px] text-stone-400 font-semibold">{images.length} Fotoğraf</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Direct File Upload Button / Dropzone */}
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition flex flex-col items-center justify-center gap-1.5 text-stone-700 cursor-pointer disabled:opacity-50"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                  <span className="text-xs font-bold text-amber-900">Fotoğraflar Yükleniyor...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-amber-600" />
                  <span className="text-xs font-bold text-stone-900">Bilgisayardan Fotoğraf Yükle</span>
                  <span className="text-[10px] text-stone-500">Tıklayın veya fotoğrafları buraya seçin (Çoklu seçim desteklenir)</span>
                </>
              )}
            </button>

            {/* Or Add Image by URL */}
            <div className="pt-2 border-t border-stone-100">
              <label className="text-[10px] text-stone-400 font-bold block mb-1">veya Bağlantı / Link ile Ekle</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Görsel bağlantısı yapıştırın..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg"
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Gallery list */}
            <div className="space-y-2 pt-2">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="relative w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                    <Image src={img.image_url} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="truncate text-stone-600 text-[10px]">{img.image_url}</div>
                    {img.is_cover ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        ★ Kapak Görseli
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverImage(i)}
                        className="text-[10px] text-stone-500 hover:text-amber-700 underline"
                      >
                        Kapak Yap
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Promotional Video */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-600" />
              <span>Tanıtım Videosu</span>
            </h2>

            {/* Hidden Video File Input */}
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoFileUpload}
              accept="video/*"
              className="hidden"
            />

            {/* Direct Video File Upload Button */}
            <button
              type="button"
              disabled={isUploadingVideo}
              onClick={() => videoInputRef.current?.click()}
              className="w-full p-3 rounded-xl border border-stone-300 hover:bg-stone-50 transition flex items-center justify-center gap-2 text-xs font-bold text-stone-700 disabled:opacity-50"
            >
              {isUploadingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Video Yükleniyor...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Bilgisayardan Video Yükle (MP4 / WebM)</span>
                </>
              )}
            </button>

            <div>
              <label className="text-[10px] text-stone-400 font-bold block mb-1">veya YouTube / Video Linki</label>
              <input
                type="text"
                placeholder="YouTube video linki veya video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-stone-400">
              Ürün sayfasında video oynatıcı olarak doğrudan oynatılır.
            </p>
          </div>

        </div>

      </div>

    </form>
  );
}
