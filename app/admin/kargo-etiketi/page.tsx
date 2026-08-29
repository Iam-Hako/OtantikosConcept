'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Printer, 
  Save, 
  Trash2, 
  Search, 
  ShoppingBag, 
  Truck, 
  Database,
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { DataService } from '@/lib/data/store-data';
import { Order } from '@/lib/types/ecommerce';
import { 
  actionGetCargoLabels, 
  actionSaveCargoLabel, 
  actionDeleteCargoLabel, 
  actionClearAllCargoLabels,
  CargoLabelData 
} from '@/app/actions/ecommerce-actions';

const SQL_SETUP_SCRIPT = `-- ==============================================================================
-- OTANTİKOS CONCEPT: KARGO ETİKETLERİ VE ADRES DEFTERİ TABLOSU
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cargo_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_name TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    order_number TEXT,
    print_count INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hızlı Arama ve Sıralama İndeksleri
CREATE INDEX IF NOT EXISTS idx_cargo_labels_recipient ON public.cargo_labels(recipient_name);
CREATE INDEX IF NOT EXISTS idx_cargo_labels_created_at ON public.cargo_labels(created_at DESC);

-- RLS (Satır Bazlı Güvenlik)
ALTER TABLE public.cargo_labels ENABLE ROW LEVEL SECURITY;

-- Yalnızca Yetkili Yöneticiler (Admin) Erişebilir
CREATE POLICY "Admins full access to cargo_labels"
ON public.cargo_labels FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Canlı Güncellemeler için Realtime Yayını
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cargo_labels;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;`;

function KargoEtiketiContent() {
  const searchParams = useSearchParams();
  const paramAlici = searchParams?.get('alici') || '';
  const paramTel = searchParams?.get('tel') || '';
  const paramAdres = searchParams?.get('adres') || '';
  const paramOrder = searchParams?.get('order') || '';

  // Form State
  const [alici, setAlici] = useState(paramAlici);
  const [tel, setTel] = useState(paramTel);
  const [adres, setAdres] = useState(paramAdres);
  const [kopya, setKopya] = useState<number>(1);
  const [secilenSiparis, setSecilenSiparis] = useState(paramOrder);
  const [isSaving, setIsSaving] = useState(false);

  // Data & List State
  const [kayitlar, setKayitlar] = useState<CargoLabelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [tableNeedsCreation, setTableNeedsCreation] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const [aramaKelimesi, setAramaKelimesi] = useState('');
  const [siparisler, setSiparisler] = useState<Order[]>([]);

  // Print Queue State
  const [baskiListesi, setBaskiListesi] = useState<{ alici: string; tel: string; adres: string; kopya: number }[]>([]);

  // 1. Fetch labels from Supabase on mount
  const loadCargoLabels = async () => {
    setIsLoading(true);
    try {
      const res = await actionGetCargoLabels();
      if (res.success) {
        setKayitlar(res.data);
        setIsSupabaseConnected(true);
        setTableNeedsCreation(false);
      } else if (res.error === 'TABLE_NOT_FOUND') {
        setTableNeedsCreation(true);
        setIsSupabaseConnected(false);
        // Fallback to local cache if table is not created yet
        const stored = localStorage.getItem('otantikos_kargo_cache');
        if (stored) {
          try {
            setKayitlar(JSON.parse(stored));
          } catch {}
        }
      } else {
        toast.error('Kargo etiketleri yüklenirken hata oluştu: ' + res.error);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCargoLabels();

    // Load recent orders from DataService for quick auto-fill
    DataService.getOrders()
      .then((data) => setSiparisler(data))
      .catch(() => {});
  }, []);

  // Update from URL params if present
  useEffect(() => {
    if (paramAlici || paramAdres) {
      setAlici(paramAlici.toUpperCase());
      setTel(paramTel);
      setAdres(paramAdres.toUpperCase());
      if (paramOrder) {
        setSecilenSiparis(paramOrder);
      }
      toast.info(`Sipariş #${paramOrder || ''} bilgileri yüklendi.`);
    }
  }, [paramAlici, paramTel, paramAdres, paramOrder]);

  // Formu Temizle
  const formuTemizle = () => {
    setAlici('');
    setTel('');
    setAdres('');
    setKopya(1);
    setSecilenSiparis('');
  };

  // Siparişten aktar
  const handleSiparisSec = (orderNumber: string) => {
    setSecilenSiparis(orderNumber);
    if (!orderNumber) return;

    const ord = siparisler.find((o) => o.order_number === orderNumber);
    if (!ord || !ord.shipping_address) return;

    const addr = ord.shipping_address;
    const tamAdres = (addr.full_address || `${addr.district || ''} / ${addr.province || ''}`).trim().toUpperCase();
    
    setAlici((addr.full_name || '').toUpperCase());
    setTel(addr.phone || '');
    setAdres(tamAdres);
    toast.success(`Sipariş #${ord.order_number} (${addr.full_name}) aktarıldı.`);
  };

  // 1. Sadece Supabase'e Kaydet
  const sadeceKaydet = async () => {
    const cleanAlici = alici.trim().toUpperCase();
    const cleanTel = tel.trim();
    const cleanAdres = adres.trim().toUpperCase();

    if (!cleanAlici || !cleanAdres) {
      toast.error('Lütfen en azından Alıcı Adı ve Adres alanlarını doldurun.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await actionSaveCargoLabel({
        recipient_name: cleanAlici,
        phone: cleanTel,
        address: cleanAdres,
        order_number: secilenSiparis || undefined,
        print_count: Math.max(1, kopya || 1)
      });

      if (res.success) {
        toast.success('Adres Supabase veritabanına başarıyla kaydedildi.');
        if (res.data) {
          setKayitlar((prev) => [res.data!, ...prev.filter((p) => p.id !== res.data!.id)]);
        } else {
          loadCargoLabels();
        }
        formuTemizle();
      } else {
        toast.error('Kayıt başarısız: ' + (res.error || 'Bilinmeyen hata'));
      }
    } catch {
      toast.error('Sunucu bağlantı hatası oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Genel Yazdırma Fonksiyonu (DOM'a anında yazar ve Xprinter/termal pencereyi açar)
  const tetikleYazdir = (hedefAlici: string, hedefTel: string, hedefAdres: string, hedefKopya = 1) => {
    const kopyalar = Math.max(1, hedefKopya || 1);
    const container = document.getElementById('print-container');
    const telefonGoster = hedefTel ? hedefTel : '-';

    if (container) {
      container.innerHTML = '';
      for (let c = 0; c < kopyalar; c++) {
        const page = document.createElement('div');
        page.className = 'label-page';
        page.innerHTML = `
          <div class="label-box">
            <div class="info-row"><div class="title">ALICI:</div><div class="content">${hedefAlici}</div></div>
            <div class="info-row"><div class="title">TEL:</div><div class="content">${telefonGoster}</div></div>
            <div class="info-row"><div class="title">ADRES:</div><div class="content">${hedefAdres}</div></div>
            <div class="divider"></div>
            <div class="sender-box">
              <div class="sender-title">GÖNDEREN</div>
              <div class="sender-name">OTANTİKOS CONCEPT</div>
            </div>
          </div>
        `;
        container.appendChild(page);
      }
    }

    setBaskiListesi([{
      alici: hedefAlici,
      tel: hedefTel,
      adres: hedefAdres,
      kopya: kopyalar
    }]);

    window.print();
  };

  // 2. Kaydet ve 90mm Yazdır
  const yazdirVeKaydet = async () => {
    const cleanAlici = alici.trim().toUpperCase();
    const cleanTel = tel.trim();
    const cleanAdres = adres.trim().toUpperCase();
    const kopyaAdet = Math.max(1, kopya || 1);

    if (!cleanAlici || !cleanAdres) {
      toast.error('Lütfen Alıcı Adı ve Adres alanlarını doldurun.');
      return;
    }

    // Supabase arka plan kaydı
    setIsSaving(true);
    actionSaveCargoLabel({
      recipient_name: cleanAlici,
      phone: cleanTel,
      address: cleanAdres,
      order_number: secilenSiparis || undefined,
      print_count: kopyaAdet
    }).then((res) => {
      setIsSaving(false);
      if (res.success && res.data) {
        setKayitlar((prev) => [res.data!, ...prev.filter((p) => p.id !== res.data!.id)]);
        toast.success('Adres kaydedildi.');
      }
    }).catch(() => {
      setIsSaving(false);
    });

    // Anında termal çıktıyı bas
    tetikleYazdir(cleanAlici, cleanTel, cleanAdres, kopyaAdet);
  };

  // 3. Tablodan Direkt Yazdır
  const direktYazdir = (hedefAlici: string, hedefTel: string, hedefAdres: string, hedefKopya = 1) => {
    tetikleYazdir(hedefAlici.toUpperCase(), hedefTel, hedefAdres.toUpperCase(), hedefKopya);
  };

  // 4. Supabase'den Kayıt Sil
  const kayitSil = async (id?: string) => {
    if (!id) return;
    if (confirm('Bu kargo adresini Supabase veritabanından kalıcı olarak silmek istediğinize emin misiniz?')) {
      // Optimistic update
      setKayitlar((prev) => prev.filter((k) => k.id !== id));
      const res = await actionDeleteCargoLabel(id);
      if (res.success) {
        toast.info('Adres kaydı Supabase\'den silindi.');
      } else {
        toast.error('Silinemedi: ' + res.error);
        loadCargoLabels();
      }
    }
  };

  // 5. Tüm Listeyi Temizle
  const tumunuTemizle = async () => {
    if (kayitlar.length === 0) return;
    if (confirm('Tüm kayıtlı kargo adres defterini Supabase veritabanından temizlemek istediğinize emin misiniz?')) {
      setKayitlar([]);
      const res = await actionClearAllCargoLabels();
      if (res.success) {
        toast.info('Kargo adres defteri Supabase\'den temizlendi.');
      } else {
        toast.error('Temizlenemedi: ' + res.error);
        loadCargoLabels();
      }
    }
  };

  // SQL Script Kopyalama
  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setHasCopiedSql(true);
    toast.success('Supabase SQL kodu panoya kopyalandı! Supabase SQL Editor\'e yapıştırıp Run diyebilirsiniz.');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // Arama filtreleme
  const filtrelenmisKayitlar = useMemo(() => {
    if (!aramaKelimesi.trim()) return kayitlar;
    const q = aramaKelimesi.trim().toUpperCase();
    return kayitlar.filter(
      (k) =>
        k.recipient_name.toUpperCase().includes(q) ||
        k.address.toUpperCase().includes(q) ||
        (k.phone && k.phone.includes(q)) ||
        (k.order_number && k.order_number.toUpperCase().includes(q))
    );
  }, [kayitlar, aramaKelimesi]);

  return (
    <div className="space-y-6">
      
      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="no-print space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-serif font-black text-stone-900">
                  Kargo Etiketi & Adres Masası
                </h1>
                {isSupabaseConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Supabase Canlı Veritabanı</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Database className="w-3 h-3 text-amber-600" />
                    <span>Supabase Tablosu Bekleniyor</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Termal yazıcılar (90mm standart) ve A4 kargo çıktıları için Supabase senkronize etiket sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCargoLabels}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin/siparisler"
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
              <span>Siparişler Listesi</span>
            </Link>
          </div>
        </div>

        {/* SUPABASE SQL CREATION BANNER (Visible if table needs creation) */}
        {tableNeedsCreation && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900 space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-stone-900">
                  Supabase'de <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono font-bold">cargo_labels</code> Tablosu Henüz Oluşturulmamış
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Adreslerin tüm cihazlarınızda (depo bilgisayarı, ofis, cep telefonu) ortak ve kalıcı olarak Supabase veritabanında saklanabilmesi için aşağıdaki SQL komutunu Supabase panelinizdeki <strong>SQL Editor</strong> alanına yapıştırıp <strong>Run</strong> demeniz yeterlidir.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 pl-11">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                {hasCopiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedSql ? 'SQL Kodu Kopyalandı!' : '1-Tıkla Supabase SQL Kodunu Kopyala'}</span>
              </button>

              <button
                type="button"
                onClick={loadCargoLabels}
                className="px-3 py-2 bg-white border border-amber-300 text-amber-900 font-semibold text-xs rounded-xl hover:bg-amber-100/60 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tabloyu Kontrol Et</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Grid: Form + Address Book */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT FORM AREA (5 COLS) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Kargo Etiketi Oluştur</span>
              </h2>
              <button
                type="button"
                onClick={formuTemizle}
                className="text-[11px] text-stone-400 hover:text-stone-700 font-medium"
              >
                Formu Temizle
              </button>
            </div>

            {/* Quick Order Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Sistemdeki Siparişten Otomatik Yükle
              </label>
              <select
                value={secilenSiparis}
                onChange={(e) => handleSiparisSec(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
              >
                <option value="">-- Listeden Sipariş Seçin (İsteğe Bağlı) --</option>
                {siparisler.map((s) => (
                  <option key={s.id} value={s.order_number}>
                    #{s.order_number} - {s.shipping_address?.full_name} ({s.shipping_address?.province || 'Şehir Yok'})
                  </option>
                ))}
              </select>
            </div>

            {/* Form inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Alıcı Adı Soyadı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={alici}
                  onChange={(e) => setAlici(e.target.value)}
                  placeholder="ÖRN: AHMET YILMAZ"
                  className="w-full uppercase bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Kargo Açık Adresi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={adres}
                  onChange={(e) => setAdres(e.target.value)}
                  placeholder="MAHALLE, SOKAK, KAPI NO, İLÇE / İL"
                  className="w-full uppercase bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Kopya Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={kopya}
                    onChange={(e) => setKopya(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-blue-600 font-bold text-center focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>
                <div className="text-[11px] text-stone-400 pt-4">
                  Termal veya normal yazıcı için kopya adedi belirleyin.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={yazdirVeKaydet}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet ve Yazdır'}</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={sadeceKaydet}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Sadece Kaydet</span>
              </button>
            </div>

            {/* Sender Info Notice */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Gönderen Notu:</strong> Etiketin altında otomatik olarak kesikli çizgi ve resmi gönderici olarak <strong>OTANTİKOS CONCEPT</strong> basılacaktır.
            </div>

          </div>

          {/* RIGHT LIST AREA (7 COLS) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Supabase Kayıtlı Adres Defteri
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-bold text-[10px]">
                  {kayitlar.length} Adres
                </span>
              </div>

              {kayitlar.length > 0 && (
                <button
                  type="button"
                  onClick={tumunuTemizle}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Listeyi Temizle</span>
                </button>
              )}
            </div>

            {/* Live Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aramaKelimesi}
                onChange={(e) => setAramaKelimesi(e.target.value)}
                placeholder="Alıcı adı, telefon veya adres arayın..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-stone-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 sticky top-0 border-b border-stone-200 z-10">
                  <tr className="text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3.5">Alıcı</th>
                    <th className="py-3 px-3.5">Telefon</th>
                    <th className="py-3 px-3.5">Adres</th>
                    <th className="py-3 px-3.5 text-right w-28">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400 text-xs">
                        Supabase'den kargo adresleri yükleniyor...
                      </td>
                    </tr>
                  ) : filtrelenmisKayitlar.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400 text-xs">
                        {aramaKelimesi ? 'Aramanıza uygun kayıt bulunamadı.' : 'Henüz kayıtlı kargo etiketi bulunmuyor.'}
                      </td>
                    </tr>
                  ) : (
                    filtrelenmisKayitlar.map((k) => (
                      <tr key={k.id || k.recipient_name} className="hover:bg-stone-50/80 transition group">
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-stone-900">{k.recipient_name}</div>
                          {k.order_number && (
                            <span className="inline-block text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 rounded mt-0.5">
                              #{k.order_number}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-stone-600 whitespace-nowrap">
                          {k.phone || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-stone-600 max-w-xs break-words">
                          {k.address}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => direktYazdir(k.recipient_name, k.phone || '', k.address, 1)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-2xs"
                              title="1 Adet Yazdır"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Yazdır</span>
                            </button>
                            {k.id && (
                              <button
                                type="button"
                                onClick={() => kayitSil(k.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                                title="Supabase'den Sil"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="pt-2 flex justify-between items-center text-[11px] text-stone-400">
              <span>Tüm kargo etiketleri Supabase PostgreSQL veritabanında saklanır.</span>
              <button
                type="button"
                onClick={() => {
                  setAlici('AHMET YILMAZ');
                  setTel('0555 123 45 67');
                  setAdres('TAHTAKALE MAH. UZUNÇARŞI CAD. NO:187 FATİH / İSTANBUL');
                  setKopya(1);
                }}
                className="text-amber-700 hover:underline font-semibold"
              >
                Örnek Doldur
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* PRINT-ONLY CONTAINER (90mm EXACT THERMAL LABEL TEMPLATE) */}
      <div id="print-container" className="print-area">
        {baskiListesi.map((item, idx) => {
          const kopyalar = Array.from({ length: item.kopya });
          return (
            <React.Fragment key={idx}>
              {kopyalar.map((_, cIdx) => (
                <div key={cIdx} className="label-page">
                  <div className="label-box">
                    <div className="info-row">
                      <div className="title">ALICI:</div>
                      <div className="content">{item.alici}</div>
                    </div>
                    <div className="info-row">
                      <div className="title">TEL:</div>
                      <div className="content">{item.tel ? item.tel : '-'}</div>
                    </div>
                    <div className="info-row">
                      <div className="title">ADRES:</div>
                      <div className="content">{item.adres}</div>
                    </div>
                    <div className="divider" />
                    <div className="sender-box">
                      <div className="sender-title">GÖNDEREN</div>
                      <div className="sender-name">OTANTİKOS CONCEPT</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media screen {
              #print-container, .print-area {
                display: none !important;
              }
            }
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
              }
              .no-print {
                display: none !important;
              }
              #print-container, .print-area {
                display: block !important;
                visibility: visible !important;
              }
              #print-container *, .print-area * {
                visibility: visible !important;
              }
              .label-page {
                width: 90mm !important;
                margin: 3mm auto 5mm auto !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                color: #000 !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .label-box {
                border: 2.5px solid #000 !important;
                padding: 16px !important;
                border-radius: 6px !important;
                background: #fff !important;
              }
              .info-row {
                display: flex !important;
                margin-bottom: 9px !important;
                font-size: 15px !important;
                line-height: 1.35 !important;
              }
              .title {
                font-weight: 800 !important;
                width: 75px !important;
                flex-shrink: 0 !important;
                letter-spacing: 0.5px !important;
              }
              .content {
                font-weight: 700 !important;
                word-break: break-word !important;
              }
              .divider {
                border-top: 2px dashed #000 !important;
                margin: 16px 0 12px 0 !important;
              }
              .sender-box {
                text-align: center !important;
              }
              .sender-title {
                font-size: 11px !important;
                text-transform: uppercase !important;
                letter-spacing: 1.5px !important;
                margin-bottom: 2px !important;
                color: #222 !important;
                font-weight: bold !important;
              }
              .sender-name {
                font-size: 17px !important;
                font-weight: 800 !important;
                letter-spacing: 0.5px !important;
              }
            }
          `,
        }}
      />

    </div>
  );
}

export default function KargoEtiketiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Yükleniyor...</div>}>
      <KargoEtiketiContent />
    </Suspense>
  );
}
