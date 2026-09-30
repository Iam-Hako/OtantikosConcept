'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Bell, 
  Send, 
  Users, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  ExternalLink,
  RefreshCw,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationStats {
  totalSubscribers: number;
  iosCount: number;
  androidCount: number;
  desktopCount: number;
  history: Array<{
    id: string;
    title: string;
    body: string;
    url?: string;
    sent_count: number;
    failure_count: number;
    created_at: string;
  }>;
}

export default function AdminPushNotificationsPage() {
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscribers: 0,
    iosCount: 0,
    androidCount: 0,
    desktopCount: 0,
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [title, setTitle] = useState('🔥 Flaş Squishy İndirimi Başladı!');
  const [message, setMessage] = useState('En çok satan sevimli squishy modellerinde sepette sürpriz fırsatı kaçırmayın!');
  const [targetUrl, setTargetUrl] = useState('/kategori/tum-urunler');
  const [imageUrl, setImageUrl] = useState('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/notifications/stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('[Fetch Stats Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Lütfen başlık ve bildirim mesajı giriniz.');
      return;
    }

    if (stats.totalSubscribers === 0) {
      const confirmSend = window.confirm(
        'Şu an kayıtlı bildirim abonesi bulunmuyor (henüz kullanıcılar bildirim izni vermemiş olabilir). Yine de test olarak göndermek istiyor musunuz?'
      );
      if (!confirmSend) return;
    } else {
      const confirmSend = window.confirm(
        `Bu bildirim kayıtlı ${stats.totalSubscribers} abonenin telefon ve bilgisayarlarına ANINDA gönderilecektir. Onaylıyor musunuz?`
      );
      if (!confirmSend) return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          url: targetUrl,
          image_url: imageUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bildirim gönderilemedi.');
      }

      toast.success('Bildirim Başarıyla Gönderildi! 🎉', {
        description: data.message || `${data.result?.sent || 0} aktif cihaza anında iletildi.`,
      });

      // Refresh history & stats
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Gönderim sırasında hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const applyQuickTemplate = (tplTitle: string, tplMsg: string, tplUrl: string) => {
    setTitle(tplTitle);
    setMessage(tplMsg);
    setTargetUrl(tplUrl);
    toast.info('Şablon forma uygulandı.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-[#e60012] uppercase tracking-wide">
              Kendi Altyapımız (0 TL Masraf)
            </span>
            <span className="text-xs text-stone-500 font-medium">• Web Push & PWA</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-stone-900 mt-1">
            Anlık Push Bildirim Merkezi
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Abone olan müşterilerin telefon kilit ekranlarına ve bilgisayarlarına anında canlı kampanya bildirimi gönderin.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* 1. SUBSCRIBER STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Subscribers */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Toplam Abone</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#e60012] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-3">
            {stats.totalSubscribers}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ✓ Bildirim Almaya Açık Cihaz
          </p>
        </div>

        {/* iPhone (iOS) */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">iPhone (iOS 16.4+)</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-3">
            {stats.iosCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Apple Web Push Altyapısı
          </p>
        </div>

        {/* Android */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Android Cihazlar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-3">
            {stats.androidCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Google Chrome & Samsung Browser
          </p>
        </div>

        {/* Desktop */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Masaüstü (PC/Mac)</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-3">
            {stats.desktopCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Chrome, Edge, Safari & Firefox
          </p>
        </div>

      </div>

      {/* 2. COMPOSER & LIVE PHONE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Compose Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#e60012]" />
              <span>Yeni Bildirim Oluştur ve Yayınla</span>
            </h2>
          </div>

          {/* Quick Template Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-500 block">Hızlı Hazır Şablonlar:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyQuickTemplate('🔥 Flaş Squishy İndirimi Başladı!', 'Sevimli bardak ve meyve squishy modellerinde sürpriz indirimler başladı! Stoklar tükenmeden yakalayın.', '/kategori/tum-urunler')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                🧸 Flaş İndirim
              </button>
              <button
                type="button"
                onClick={() => applyQuickTemplate('🧸 Viral Ayıcık Bardak Squishy Yeniden Stokta!', 'Çok sorulan viral ayıcık squishy modelimizin yeni partisi mağazamızda yayında.', '/urun/viral-ay-c-k-bardak-squishy')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                ✨ Yeni Stok Haberi
              </button>
              <button
                type="button"
                onClick={() => applyQuickTemplate('🎁 Hafta Sonuna Özel Hediye Kuponu!', 'Tüm Tahtakale hediyelik siparişlerinizde geçerli özel indirim avantajını kaçırmayın.', '/kategori/tum-urunler')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                🎉 Hafta Sonu Sürprizi
              </button>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Bildirim Başlığı *
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 🔥 Flaş İndirim Başladı!"
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#e60012] bg-stone-50 focus:bg-white font-medium"
              />
              <span className="text-[10px] text-stone-400 block mt-1 text-right">{title.length}/80</span>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Bildirim Mesajı (Açıklama) *
              </label>
              <textarea
                required
                rows={3}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kullanıcının kilit ekranında okuyacağı kısa ve etkileyici mesaj..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#e60012] bg-stone-50 focus:bg-white font-medium resize-none"
              />
              <span className="text-[10px] text-stone-400 block mt-1 text-right">{message.length}/200</span>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Tıklandığında Açılacak Sayfa (Link)
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/kategori/tum-urunler veya https://..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#e60012] bg-stone-50 focus:bg-white font-mono text-[11px]"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Müşteri bildirime dokunduğunda doğrudan bu sayfaya yönlendirilir.
              </p>
            </div>

            {/* Optional Banner Image URL */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Büyük Kampanya Görseli URL (İsteğe Bağlı)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (Görseli olan bildirimler kilit ekranında büyük afiş olarak açılır)"
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#e60012] bg-stone-50 focus:bg-white font-mono text-[11px]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 bg-[#e60012] hover:bg-[#c90010] active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
                <span>
                  {isSending ? 'Bildirimler İletiliyor...' : `Tüm Abonelere Canlı Gönder (${stats.totalSubscribers} Cihaz)`}
                </span>
              </button>
              <p className="text-center text-[11px] text-stone-500 mt-2">
                🔒 VAPID kriptografik anahtarları ile imzalanarak doğrudan Google/Apple sunucularına iletilir.
              </p>
            </div>

          </form>
        </div>

        {/* Right: Realistic Phone Lock Screen Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Eye className="w-4 h-4 text-[#e60012]" />
            <span>Müşterinin Telefonunda Nasıl Görünecek? (Canlı Önizleme)</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-sm mx-auto bg-stone-900 rounded-[44px] p-4 shadow-2xl border-4 border-stone-800 relative">
            
            {/* Phone Screen Mockup */}
            <div className="w-full bg-cover bg-center rounded-[32px] overflow-hidden min-h-[440px] flex flex-col justify-between p-4 relative"
                 style={{ backgroundColor: '#1C1917', backgroundImage: 'radial-gradient(ellipse at top, #292524, #0c0a09)' }}>
              
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-white text-[11px] font-semibold px-2 pt-1 opacity-80">
                <span>14:30</span>
                <div className="w-20 h-4 bg-black rounded-full mx-auto" />
                <span>5G %100</span>
              </div>

              {/* Notification Banner Overlay */}
              <div className="my-auto space-y-3">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-white/20 text-stone-900 animate-in fade-in duration-200">
                  
                  {/* Notification App Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md overflow-hidden relative border border-stone-200 bg-red-600">
                        <Image src="/icons/icon-192.png" alt="Otantikos" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-800">OTANTİKOS CONCEPT</span>
                    </div>
                    <span className="text-[9px] text-stone-400">şimdi</span>
                  </div>

                  {/* Notification Content */}
                  <div className="pt-2 space-y-1">
                    <h4 className="text-xs font-black text-stone-950 leading-tight">
                      {title || 'Bildirim Başlığı'}
                    </h4>
                    <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                      {message || 'Bildirim mesajınız buraya gelecek...'}
                    </p>
                  </div>

                  {/* Optional Preview Image */}
                  {imageUrl && (
                    <div className="mt-2.5 relative w-full h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-end gap-2 text-[10px] font-bold text-[#e60012]">
                    <span>Hemen İncele 🛍️</span>
                  </div>

                </div>

                <div className="text-center text-[10px] text-stone-400 opacity-60">
                  Kilit ekranı bildirim görünümü
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mb-1" />

            </div>

          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <span className="font-bold text-stone-900 block">💡 İpucu:</span>
            <p className="text-[11px] leading-relaxed">
              Müşteriler bildirim izni verdikten sonra tarayıcıyı kapatsalar bile bu bildirim doğrudan telefonlarının ekranına sesli ve titreşimli olarak düşer.
            </p>
          </div>

        </div>

      </div>

      {/* 3. NOTIFICATION HISTORY */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <History className="w-4 h-4 text-stone-600" />
          <span>Gönderim Geçmişi</span>
        </h2>

        {stats.history.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-stone-300" />
            <p>Henüz gönderilmiş bir bildirim bulunmuyor.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 overflow-x-auto">
            {stats.history.map((h) => (
              <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-stone-900 truncate">{h.title}</div>
                  <div className="text-stone-500 text-[11px] truncate max-w-xl">{h.body}</div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {new Date(h.created_at).toLocaleString('tr-TR')} • Hedef: {h.url || '/'}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                    ✓ {h.sent_count} Başarılı
                  </span>
                  {h.failure_count > 0 && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px]">
                      {h.failure_count} Ulaşılamadı
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
