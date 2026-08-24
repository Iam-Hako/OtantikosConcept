'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Layers, Plus, Trash2, Edit3, Save, Sparkles, UploadCloud, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { slugify, convertGoogleDriveUrl } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const list = await DataService.getCategories();
    setCategories(list);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800');
    setDisplayOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImageUrl(c.image_url || '');
    setDisplayOrder(c.display_order);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Yükleme başarısız');
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        toast.success('Kategori görseli yüklendi!');
      }
    } catch {
      toast.error('Görsel yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await DataService.saveCategory({
      id: editingId || undefined,
      name,
      slug: slug || slugify(name),
      description,
      image_url: convertGoogleDriveUrl(imageUrl),
      display_order: Number(displayOrder),
      is_active: true,
    });

    toast.success(editingId ? 'Kategori güncellendi!' : 'Yeni kategori eklendi!', {
      description: 'Menüde ve filtrelerde anında canlıya yansıdı.',
    });
    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`"${catName}" kategorisini silmek istediğinize emin misiniz?`)) {
      await DataService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Kategori silindi.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-600" />
            <span>Dinamik Kategori Yöneticisi</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            E-ticaret mağazasındaki ana menü ve filtre kategorilerini anında düzenleyin.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative h-36 bg-stone-100">
              {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600 px-2 py-0.5 rounded">
                  Sıra: {c.display_order}
                </span>
                <h3 className="font-bold text-sm mt-1">{c.name}</h3>
              </div>
            </div>

            <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-stone-400 font-mono">Slug: /kategori/{c.slug}</div>
                <p className="text-stone-600 line-clamp-2 mt-1">{c.description || 'Açıklama girilmemiş.'}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-xs transition flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1 text-stone-400 hover:text-rose-600 transition"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-4 animate-slide-up max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">
                {editingId ? 'Kategori Düzenle' : '+ Yeni Kategori Ekle'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) setSlug(slugify(e.target.value));
                  }}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Kategori Görseli</label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/60 hover:bg-amber-50 transition flex items-center justify-center gap-2 text-xs font-bold text-stone-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                        <span>Görsel Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-amber-600" />
                        <span>Bilgisayardan Fotoğraf Yükle</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="veya Görsel URL'si yapıştırın..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 text-base sm:text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 transition focus:outline-none"
                    />
                    {imageUrl && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                        <Image src={imageUrl} alt="" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Sıra No</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition min-h-[44px]"
              >
                Kategoriyi Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
