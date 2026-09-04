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
  const [displayOrder, setDisplayOrder] = useState<number>(1);
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
    setDisplayOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setDisplayOrder(c.display_order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await actionSaveCategory({
      id: editingId || undefined,
      name,
      slug: slug || slugify(name),
      description,
      display_order: Number(displayOrder),
      is_active: true,
    });

    if (res.success) {
      toast.success(editingId ? 'Kategori güncellendi!' : 'Yeni kategori eklendi!', {
        description: 'Menüde ve filtrelerde anında canlıya yansıdı.',
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
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                  <Layers className="w-5 h-5 text-amber-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg">
                  Sıra: {c.display_order}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-stone-900">{c.name}</h3>
                <div className="text-[11px] text-amber-800 font-mono mt-0.5">/kategori/{c.slug}</div>
              </div>

              <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                {c.description || 'Açıklama girilmemiş.'}
              </p>
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
                  rows={3}
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
