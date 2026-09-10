'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Upload, 
  ExternalLink, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  RefreshCw,
  Layers
} from 'lucide-react';
import { HomeBanner } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { uploadMediaFile } from '@/lib/utils/upload';
import { toast } from 'sonner';

const GRADIENT_PRESETS = [
  {
    name: 'Miniso Gökyüzü (Mavi / Gül / Krem)',
    value: 'from-sky-200/60 via-rose-100/50 to-amber-100/60',
    preview: 'bg-gradient-to-r from-sky-300 via-rose-200 to-amber-200',
  },
  {
    name: 'Pudra Pembe & Şeftali',
    value: 'from-pink-100 via-rose-50 to-orange-50',
    preview: 'bg-gradient-to-r from-pink-200 via-rose-100 to-orange-100',
  },
  {
    name: 'Lavanta & Leylak',
    value: 'from-purple-100 via-violet-50 to-indigo-50',
    preview: 'bg-gradient-to-r from-purple-200 via-violet-100 to-indigo-100',
  },
  {
    name: 'Güneş Sarısı & Bal',
    value: 'from-amber-100 via-yellow-50 to-orange-100',
    preview: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200',
  },
  {
    name: 'Nane Yeşili & Ferah',
    value: 'from-emerald-100 via-teal-50 to-cyan-100',
    preview: 'bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-100',
  },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Hemen Keşfet');
  const [buttonUrl, setButtonUrl] = useState('/kategori/tum-urunler');
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await DataService.getAllAdminBanners();
      setBanners(data);
    } catch {
      toast.error('Afişler yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openNewBannerModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadgeText('YENİ SEZON');
    setImageUrl('/images/miniso_otantikos_banner.jpg');
    setMobileImageUrl('/images/miniso_otantikos_banner_mobile.jpg?v=20260909_1');
    setButtonText('Hemen Keşfet');
    setButtonUrl('/kategori/tum-urunler');
    setBgGradient(GRADIENT_PRESETS[0].value);
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditBannerModal = (banner: HomeBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setBadgeText(banner.badge_text || '');
    setImageUrl(banner.image_url);
    setMobileImageUrl(banner.mobile_image_url || '');
    setButtonText(banner.button_text || 'Hemen Keşfet');
    setButtonUrl(banner.button_url || '/kategori/tum-urunler');
    setBgGradient(banner.bg_gradient || GRADIENT_PRESETS[0].value);
    setDisplayOrder(banner.display_order);
    setIsActive(banner.is_active);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Görsel Supabase Storage sunucusuna yükleniyor...');
    try {
      const uploadedUrl = await uploadMediaFile(file);
      setImageUrl(uploadedUrl);
      toast.success('Masaüstü görseli başarıyla yüklendi!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Görsel yüklenemedi.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMobileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Mobil görsel yükleniyor...');
    try {
      const uploadedUrl = await uploadMediaFile(file);
      setMobileImageUrl(uploadedUrl);
      toast.success('Mobil görsel başarıyla yüklendi!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Mobil görsel yüklenemedi.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Lütfen afiş başlığı girin.');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Lütfen bir görsel yükleyin veya URL girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      await DataService.saveBanner({
        id: editingBanner ? editingBanner.id : undefined,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge_text: badgeText.trim() || null,
        image_url: imageUrl.trim(),
        mobile_image_url: mobileImageUrl.trim() || null,
        button_text: buttonText.trim() || 'Hemen Keşfet',
        button_url: buttonUrl.trim() || '/kategori/tum-urunler',
        bg_gradient: bgGradient,
        display_order: Number(displayOrder) || 1,
        is_active: isActive,
      });

      toast.success(editingBanner ? 'Afiş güncellendi!' : 'Yeni afiş başarıyla eklendi!');
      setIsModalOpen(false);
      await loadBanners();
    } catch {
      toast.error('Afiş kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string, bannerTitle: string) => {
    if (!confirm(`"${bannerTitle}" başlıklı afişi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await DataService.deleteBanner(id);
      toast.success('Afiş başarıyla silindi.');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch {
      toast.error('Afiş silinemedi.');
    }
  };

  const handleToggleActive = async (banner: HomeBanner) => {
    const nextStatus = !banner.is_active;
    try {
      await DataService.toggleBannerActive(banner.id, nextStatus);
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: nextStatus } : b));
      toast.success(nextStatus ? 'Afiş vitrine alındı (Aktif).' : 'Afiş gizlendi (Pasif).');
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  };

  const handleResetDefaults = async () => {
    setIsLoading(true);
    try {
      const defs = await DataService.resetDefaultBanners();
      setBanners(defs);
      toast.success('Varsayılan Miniso afişleri başarıyla geri getirildi!');
    } catch {
      toast.error('Afişler geri getirilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Ana Sayfa Vitrini</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
            Afiş & Banner Yöneticisi
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Miniso tarzı ana sayfa slider afişlerini buradan ekleyebilir, görsellerini değiştirebilir, sıralayabilir ve dilediğiniz zaman aktif/pasif yapabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={loadBanners}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>

          <button
            onClick={handleResetDefaults}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Varsayılan Afişleri Geri Getir"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Afişleri Geri Getir</span>
          </button>

          <button
            onClick={openNewBannerModal}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Banner Ekle</span>
          </button>
        </div>
      </div>

      {/* Banner List Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-bold text-stone-900">
              Kayıtlı Afişler ({banners.length})
            </h2>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            Sıralama alanına göre ana sayfada gösterilir
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium">Afişler yükleniyor...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Henüz Afiş Bulunmuyor</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Ana sayfa slider&apos;ında gösterilecek ilk Miniso tarzı afişinizi ekleyebilir veya varsayılan afişleri tek tıkla geri getirebilirsiniz.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Varsayılan Afişleri Geri Getir</span>
              </button>
              <button
                onClick={openNewBannerModal}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Yeni Afiş Ekle
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  !banner.is_active ? 'bg-stone-50/70 opacity-60' : 'hover:bg-orange-50/20'
                }`}
              >
                {/* Left: Thumbnail & Banner Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Order Badge */}
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-black text-xs shrink-0">
                    #{banner.display_order}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 h-16 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs">
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 112px, 144px"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {banner.badge_text && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider">
                          {banner.badge_text}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        banner.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {banner.is_active ? 'Yayında (Aktif)' : 'Gizli (Pasif)'}
                      </span>
                      {banner.mobile_image_url && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                          📱 Özel Mobil Görsel
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {banner.title}
                    </h3>

                    {banner.subtitle && (
                      <p className="text-xs text-stone-500 truncate max-w-md">
                        {banner.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-0.5">
                      <span>Buton: <strong>{banner.button_text || 'Hemen Keşfet'}</strong></span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">Hedef: <code>{banner.button_url || '/'}</code></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2 rounded-xl border transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                      banner.is_active
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
                    }`}
                    title={banner.is_active ? 'Pasife Al' : 'Aktife Al'}
                  >
                    {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{banner.is_active ? 'Aktif' : 'Pasif'}</span>
                  </button>

                  <button
                    onClick={() => openEditBannerModal(banner)}
                    className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-orange-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Düzenle</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(banner.id, banner.title)}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-serif font-black text-stone-900">
                  {editingBanner ? 'Afişi Düzenle' : 'Yeni Ana Sayfa Bannerı Ekle'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Miniso tarzı renkli ve dikkat çekici vitrin afişi oluşturun.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBanner} className="space-y-4">
              
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Afiş Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Yeni Dönemde Tarzını Yansıt!"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Rozet / Etiket
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Örn: YENİ SEZON"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alt Başlık / Kampanya Açıklaması
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Örn: Okul ve ofis için en sevimli kırtasiye & tasarım koleksiyonları"
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  Banner Görseli * (16:9 Geniş Format Önerilir)
                </label>

                {/* Image Preview Box */}
                {imageUrl && (
                  <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner group">
                    <Image
                      src={imageUrl}
                      alt="Banner Önizleme"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/95 text-stone-900 rounded-xl text-xs font-bold hover:bg-white shadow-md cursor-pointer"
                      >
                        Görseli Değiştir
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Görsel URL'si veya aşağıdaki butonla yükleyin"
                    className="flex-1 text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition font-mono"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
                  >
                    <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span>{isUploading ? 'Yükleniyor...' : 'Bilgisayardan Yükle'}</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    ✨ Hazır Miniso Tarzı Örnek Banner Görsellerinden Seç:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('/images/miniso_otantikos_banner.jpg');
                        setMobileImageUrl('/images/miniso_otantikos_banner_mobile.jpg?v=20260909_1');
                        if (!title) setTitle('Yeni Dönemde Tarzını Yansıt!');
                        if (!subtitle) setSubtitle('Eminönü Tahtakale vitrinimizden sevimli kırtasiye koleksiyonları');
                        setBadgeText('YENİ DÖNEM');
                      }}
                      className="p-2 border border-stone-200 rounded-xl hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 text-left transition flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-stone-200">
                        <img src="/images/miniso_otantikos_banner.jpg" alt="1" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[11px] font-bold text-stone-800 leading-tight">
                        🎒 Kırtasiye & Okul
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('/images/banner_sanrio_blindbox.jpg');
                        setMobileImageUrl('/images/banner_sanrio_blindbox_mobile.jpg?v=20260909_1');
                        if (!title) setTitle('Sevimli Sürpriz Figür & Blind Box');
                        if (!subtitle) setSubtitle('En trend sevimli figürler, anime karakterleri ve sürpriz kutular');
                        setBadgeText('SÜRPRİZ KUTU');
                      }}
                      className="p-2 border border-stone-200 rounded-xl hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 text-left transition flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-stone-200">
                        <img src="/images/banner_sanrio_blindbox.jpg" alt="2" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[11px] font-bold text-stone-800 leading-tight">
                        🧸 Blind Box & Figür
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('/images/banner_cute_plush_toys.jpg');
                        setMobileImageUrl('/images/banner_cute_plush_toys_mobile.jpg?v=20260909_1');
                        if (!title) setTitle('Yumuşacık Peluş & Sevimli Hediyelikler');
                        if (!subtitle) setSubtitle('Özel peluş ayıcıklar, sevimli minderler ve çalışma masası ürünleri');
                        setBadgeText('ÖZEL KOLEKSİYON');
                      }}
                      className="p-2 border border-stone-200 rounded-xl hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 text-left transition flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-stone-200">
                        <img src="/images/banner_cute_plush_toys.jpg" alt="3" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[11px] font-bold text-stone-800 leading-tight">
                        🐻 Peluş & Hediyelik
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Image Upload & URL */}
              <div className="space-y-2 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    📱 Mobil Banner Görseli (4:5 Dikey Format Önerilir)
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">Girilmezse masaüstü görseli kullanılır</span>
                </div>

                {/* Mobile Preview Box */}
                {mobileImageUrl && (
                  <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner group">
                    <Image
                      src={mobileImageUrl}
                      alt="Mobil Banner Önizleme"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => mobileFileInputRef.current?.click()}
                        className="px-2 py-1 bg-white/95 text-stone-900 rounded-lg text-[9px] font-bold hover:bg-white shadow-md cursor-pointer"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={mobileImageUrl}
                    onChange={(e) => setMobileImageUrl(e.target.value)}
                    placeholder="Mobil görsel URL'si veya aşağıdaki butonla yükleyin"
                    className="flex-1 text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition font-mono"
                  />

                  <input
                    type="file"
                    ref={mobileFileInputRef}
                    accept="image/*"
                    onChange={handleMobileFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
                  >
                    <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span>{isUploading ? 'Yükleniyor...' : 'Mobil Görsel Yükle'}</span>
                  </button>
                </div>
              </div>

              {/* Button Text & Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Buton Üzerindeki Yazı
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Örn: Hemen Keşfet"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tıklanınca Açılacak Sayfa (Link)
                  </label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="Örn: /kategori/tum-urunler"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                  />
                </div>
              </div>

              {/* Color Gradient Theme Preset */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Afiş Zemin Gradyanı
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setBgGradient(p.value)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                        bgGradient === p.value
                          ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${p.preview} shrink-0 shadow-2xs border border-white`} />
                      <span className="text-[11px] font-bold text-stone-800 line-clamp-1">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Görüntülenme Sırası
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-900 transition"
                  />
                </div>

                <div className="flex items-center gap-2.5 sm:pt-5">
                  <input
                    type="checkbox"
                    id="bannerActiveSwitch"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="bannerActiveSwitch" className="text-xs font-bold text-stone-800 cursor-pointer select-none">
                    Afiş Ana Sayfada Aktif Olsun
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>{editingBanner ? 'Değişiklikleri Kaydet' : 'Afişi Yayınla'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
