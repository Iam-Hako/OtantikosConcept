'use client';

import React, { useState, useEffect } from 'react';
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
  Layers 
} from 'lucide-react';
import { Category, ProductSpecification, ProductVariant, ProductImage, Product } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { slugify } from '@/lib/utils/format';
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
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [sku, setSku] = useState('');
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

  useEffect(() => {
    async function loadData() {
      const [cats, prod] = await Promise.all([
        DataService.getCategories(),
        DataService.getProductById(productId),
      ]);
      setCategories(cats);
      if (prod) {
        setProduct(prod);
        setName(prod.name);
        setSlug(prod.slug);
        setCategoryId(prod.category_id || (cats[0]?.id || ''));
        setPrice(prod.price);
        setStock(prod.stock);
        setSku(prod.sku);
        setShortDescription(prod.short_description || '');
        setDescription(prod.description || '');
        setVideoUrl(prod.video_url || '');
        setIsFeatured(prod.is_featured);
        setIsNew(prod.is_new);
        setSpecs(prod.specifications || []);
        setVariants(prod.variants || []);
        setImages(prod.images || []);
      }
    }
    if (productId) {
      loadData();
    }
  }, [productId]);

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

  // Variant Helpers
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

  // Gallery Helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        image_url: newImageUrl.trim(),
        is_cover: prev.length === 0,
        display_order: prev.length + 1,
        alt_text: name,
      }
    ]);
    setNewImageUrl('');
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
    if (!name.trim()) return;

    await DataService.saveProduct({
      id: productId,
      name,
      slug: slug || slugify(name),
      category_id: categoryId,
      price: Number(price),
      stock: Number(stock),
      sku,
      short_description: shortDescription,
      description,
      video_url: videoUrl || null,
      is_featured: isFeatured,
      is_new: isNew,
      specifications: specs.filter((s) => s.spec_key.trim() && s.spec_value.trim()),
      variants: variants.filter((v) => v.value.trim()),
      images: images.length > 0 ? images : [{ image_url: '/images/logo.webp', is_cover: true, display_order: 1 }],
    });

    toast.success(`"${name}" güncellendi!`, {
      description: 'Değişiklikler derleme gerektirmeden anında canlı sitede güncellendi.',
    });
    router.push('/admin/urunler');
  };

  if (!product) {
    return <div className="p-8 text-center text-xs text-stone-500">Ürün bilgileri yükleniyor...</div>;
  }

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/urunler" className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
              Ürün Düzenle: {product.name}
            </h1>
            <p className="text-xs text-stone-500">Dinamik özellik tablosunu ve stokları güncelleyin</p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Değişiklikleri Canlıya Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Temel Bilgiler
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Ürün Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-bold"
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
                  className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kısa Tanıtım Vurgusu</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Açıklama</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Spec Builder */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Dinamik Teknik Özellikler (Spec Builder)</span>
                </h2>
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

            <div className="space-y-2.5">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="Özellik Başlığı (Örn: Maden Türü)"
                    value={spec.spec_key}
                    onChange={(e) => updateSpecRow(index, e.target.value, spec.spec_value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Özellik Değeri (Örn: 316L Çelik)"
                    value={spec.spec_value}
                    onChange={(e) => updateSpecRow(index, spec.spec_key, e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Variants */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Varyantlar & Stok</span>
              </h2>
              <button
                type="button"
                onClick={addVariantRow}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Varyant Ekle</span>
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
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Seçenek Adı</label>
                    <input
                      type="text"
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 1 Col Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
              Fiyat & Stok
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">SKU Kodu</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-semibold text-stone-800">Vitrin Ürünü</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-semibold text-stone-800">Yeni Ürün</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Görseller & Kapak</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Görsel URL..."
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

            <div className="space-y-2">
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

          {/* Video */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-600" />
              <span>Tanıtım Videosu</span>
            </h2>
            <input
              type="text"
              placeholder="YouTube Embed URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
            />
          </div>

        </div>

      </div>

    </form>
  );
}
