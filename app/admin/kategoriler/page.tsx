'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { actionSaveCategory, actionDeleteCategory } from '@/app/actions/ecommerce-actions';
import { slugify } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIcon('🎁');
    setImageUrl('');
    setDisplayOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIcon(c.icon || '');
    setImageUrl(c.image_url || '');
    setDisplayOrder(c.display_order);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { uploadMediaFile } = await import('@/lib/utils/upload');
      const url = await uploadMediaFile(file);
      setImageUrl(url);
      toast.success('Kategori görseli yüklendi!');
    } catch (err: any) {
      toast.error('Görsel yüklenirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await actionSaveCategory({
      id: editingId || undefined,
      name,
      slug: slug || slugify(name),
      description,
      icon: icon || null,
      image_url: imageUrl || '',
      display_order: Number(displayOrder),
      is_active: true,
    });

    if (res.success) {
      toast.success(editingId ? 'Kategori güncellendi!' : 'Yeni kategori eklendi!', {
        description: 'Menüde, kaydırılabilir listelerde ve filtrelerde canlıya yansıdı.',
      });
      setIsModalOpen(false);
      loadCategories();
    } else {
      toast.error(res.error || 'Kategori kaydedilemedi.');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`"${catName}" kategorisini silmek istediğinize emin misiniz?`)) {
      const res = await actionDeleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
        toast.success('Kategori silindi.');
        await loadCategories();
      } else {
        toast.error(res.error || 'Kategori silinemedi.');
      }
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
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-2xl overflow-hidden shadow-xs">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : c.icon ? (
                    <span>{c.icon}</span>
                  ) : (
                    <Layers className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {c.icon && (
                    <span className="text-sm bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-lg" title="Emoji İkonu">
                      {c.icon}
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg">
                    Sıra: {c.display_order}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
                  {c.icon && <span>{c.icon}</span>}
                  <span>{c.name}</span>
                </h3>
                <div className="text-[11px] text-amber-800 font-mono mt-0.5">/kategori/{c.slug}</div>
              </div>

              <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                {c.description || 'Açıklama girilmemiş.'}
              </p>

              {c.image_url && (
                <div className="mt-2 rounded-xl overflow-hidden border border-stone-100 h-24 bg-stone-50 relative">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-mono">
                    Görsel aktif
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-xs transition flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => handleDelete(c.id, c.name)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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

              {/* Emoji / Icon Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Kategori Emojisi / İkonu (Menüde & Mobilde Görünür)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {icon || '—'}
                  </div>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji yazın veya seçin (örn: 🧸)"
                    className="flex-1 text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                  />
                  {icon && (
                    <button
                      type="button"
                      onClick={() => setIcon('')}
                      className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  {['🧸', '🎒', '✏️', '🎁', '🎀', '🏠', '🎧', '📦', '💄', '⭐', '👗', '🐾', '🌸', '⚡', '☕', '🎮', '🏷️', '🛍️', '💍', '🎨', '🧁', '🐱', '✨', '📚'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-8 h-8 text-base rounded-lg flex items-center justify-center transition ${
                        icon === emoji ? 'bg-amber-600 text-white shadow-xs scale-110' : 'hover:bg-stone-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Kategori Görseli (Mobil Çekmece Menü & Vitrin Kartları İçin)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... veya dosya yükleyin"
                      className="flex-1 text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition font-mono text-[11px]"
                    />
                    <label className={`px-3.5 py-3 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1.5 ${
                      isUploading ? 'bg-stone-200 text-stone-500' : 'bg-stone-900 hover:bg-black text-white active:scale-95'
                    }`}>
                      <span>{isUploading ? 'Yükleniyor...' : '📁 Dosya Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 h-28 bg-stone-50 w-full group">
                      <img src={imageUrl} alt="Önizleme" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm"
                      >
                        Kaldır
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Menü Sıra No</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kategori hakkında kısa açıklama..."
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 transition focus:outline-none focus:border-amber-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition min-h-[44px]"
              >
                {editingId ? 'Değişiklikleri Kaydet' : 'Kategoriyi Oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
