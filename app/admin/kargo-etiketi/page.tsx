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
  RotateCcw, 
  FileText, 
  Plus, 
  Check, 
  Copy, 
  ExternalLink,
  Truck,
  ArrowLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { DataService } from '@/lib/data/store-data';
import { Order } from '@/lib/types/ecommerce';

interface KargoKaydi {
  id: number;
  alici: string;
  tel: string;
  adres: string;
  orderNumber?: string;
  createdAt?: string;
}

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

  // Data & List State
  const [kayitlar, setKayitlar] = useState<KargoKaydi[]>([]);
  const [aramaKelimesi, setAramaKelimesi] = useState('');
  const [siparisler, setSiparisler] = useState<Order[]>([]);
  const [isLoadingSiparisler, setIsLoadingSiparisler] = useState(true);

  // Print Queue State
  const [baskiListesi, setBaskiListesi] = useState<{ alici: string; tel: string; adres: string; kopya: number }[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('otantikos_kargo');
      if (stored) {
        setKayitlar(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Load recent orders from DataService for quick auto-fill
    DataService.getOrders()
      .then((data) => {
        setSiparisler(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingSiparisler(false));
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
      toast.info(`Sipariş #${paramOrder || ''} bilgileri kargo etiket formuna yüklendi.`);
    }
  }, [paramAlici, paramTel, paramAdres, paramOrder]);

  // Save list to localStorage
  const kayitlariGuncelle = (yeniListe: KargoKaydi[]) => {
    setKayitlar(yeniListe);
    try {
      localStorage.setItem('otantikos_kargo', JSON.stringify(yeniListe));
    } catch {
      // ignore
    }
  };

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

  // 1. Sadece Listeye Kaydet
  const sadeceKaydet = () => {
    const cleanAlici = alici.trim().toUpperCase();
    const cleanTel = tel.trim();
    const cleanAdres = adres.trim().toUpperCase();

    if (!cleanAlici || !cleanAdres) {
      toast.error('Lütfen en azından Alıcı Adı ve Adres alanlarını doldurun.');
      return;
    }

    const varMi = kayitlar.some(
      (k) => k.alici === cleanAlici && k.adres === cleanAdres
    );

    if (varMi) {
      toast.warning('Bu adres zaten listenizde kayıtlı.');
      return;
    }

    const yeniKayit: KargoKaydi = {
      id: Date.now(),
      alici: cleanAlici,
      tel: cleanTel,
      adres: cleanAdres,
      orderNumber: secilenSiparis || undefined,
      createdAt: new Date().toLocaleDateString('tr-TR')
    };

    kayitlariGuncelle([yeniKayit, ...kayitlar]);
    toast.success('Adres başarıyla listeye kaydedildi.');
    formuTemizle();
  };

  // 2. Kaydet ve Yazdır (Hem listeye kaydeder hem de belirtilen kopya sayısı kadar 90mm basar)
  const yazdirVeKaydet = () => {
    const cleanAlici = alici.trim().toUpperCase();
    const cleanTel = tel.trim();
    const cleanAdres = adres.trim().toUpperCase();
    const kopyaAdet = Math.max(1, kopya || 1);

    if (!cleanAlici || !cleanAdres) {
      toast.error('Lütfen Alıcı Adı ve Adres alanlarını doldurun.');
      return;
    }

    // Listeye ekle (varsa tekrar eklemez)
    const varMi = kayitlar.some(
      (k) => k.alici === cleanAlici && k.adres === cleanAdres
    );

    if (!varMi) {
      const yeniKayit: KargoKaydi = {
        id: Date.now(),
        alici: cleanAlici,
        tel: cleanTel,
        adres: cleanAdres,
        orderNumber: secilenSiparis || undefined,
        createdAt: new Date().toLocaleDateString('tr-TR')
      };
      kayitlariGuncelle([yeniKayit, ...kayitlar]);
    }

    // Baskı listesini hazırla ve yazdırmayı tetikle
    setBaskiListesi([{
      alici: cleanAlici,
      tel: cleanTel,
      adres: cleanAdres,
      kopya: kopyaAdet
    }]);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  // 3. Tablodan Direkt Yazdır (1 Adet veya özel kopya)
  const direktYazdir = (hedefAlici: string, hedefTel: string, hedefAdres: string, hedefKopya = 1) => {
    setBaskiListesi([{
      alici: hedefAlici.toUpperCase(),
      tel: hedefTel,
      adres: hedefAdres.toUpperCase(),
      kopya: hedefKopya
    }]);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  // 4. Kayıt Sil
  const kayitSil = (id: number) => {
    if (confirm('Bu adresi listeden silmek istediğinize emin misiniz?')) {
      const filtrelenmis = kayitlar.filter((k) => k.id !== id);
      kayitlariGuncelle(filtrelenmis);
      toast.info('Adres kaydı silindi.');
    }
  };

  // 5. Tüm Listeyi Temizle
  const tumunuTemizle = () => {
    if (kayitlar.length === 0) return;
    if (confirm('Tüm kayıtlı kargo adres defterini temizlemek istediğinize emin misiniz?')) {
      kayitlariGuncelle([]);
      toast.info('Kargo adres defteri temizlendi.');
    }
  };

  // Arama filtreleme
  const filtrelenmisKayitlar = useMemo(() => {
    if (!aramaKelimesi.trim()) return kayitlar;
    const q = aramaKelimesi.trim().toUpperCase();
    return kayitlar.filter(
      (k) =>
        k.alici.toUpperCase().includes(q) ||
        k.adres.toUpperCase().includes(q) ||
        (k.tel && k.tel.includes(q)) ||
        (k.orderNumber && k.orderNumber.toUpperCase().includes(q))
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
              <h1 className="text-lg sm:text-xl font-serif font-black text-stone-900">
                Kargo Etiketi & Adres Masası
              </h1>
              <p className="text-xs text-stone-500">
                Termal yazıcılar (90mm standart) veya A4 çıktıları için hızlı kargo gönderi etiketi basma sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/siparisler"
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
              <span>Siparişler Listesi</span>
            </Link>
          </div>
        </div>

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
                  Birden fazla koli veya poşet için kopya adedi belirleyebilirsiniz.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={yazdirVeKaydet}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                <span>Kaydet ve Yazdır</span>
              </button>

              <button
                type="button"
                onClick={sadeceKaydet}
                className="w-full py-2.5 bg-stone-700 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Sadece Listeye Kaydet</span>
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
                  Kayıtlı Kargo Adres Listesi
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
                  {filtrelenmisKayitlar.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400 text-xs">
                        {aramaKelimesi ? 'Aramanıza uygun kayıt bulunamadı.' : 'Henüz kayıtlı kargo etiketi bulunmuyor.'}
                      </td>
                    </tr>
                  ) : (
                    filtrelenmisKayitlar.map((k) => (
                      <tr key={k.id} className="hover:bg-stone-50/80 transition group">
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-stone-900">{k.alici}</div>
                          {k.orderNumber && (
                            <span className="inline-block text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 rounded mt-0.5">
                              #{k.orderNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-stone-600 whitespace-nowrap">
                          {k.tel || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-stone-600 max-w-xs break-words">
                          {k.adres}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => direktYazdir(k.alici, k.tel, k.adres, 1)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-2xs"
                              title="1 Adet Yazdır"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Yazdır</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => kayitSil(k.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                              title="Sil"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
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
              <span>Etiketler tarayıcınızın hafızasında (localStorage) saklanır.</span>
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

      {/* INJECT PRINT STYLES */}
      <style jsx global>{`
        @media screen {
          .print-area {
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
          .print-area {
            display: block !important;
          }
          .label-page {
            width: 90mm;
            margin: 4mm auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #000;
            page-break-after: always;
          }
          .label-box {
            border: 2.5px solid #000;
            padding: 16px;
            border-radius: 6px;
            background: #fff;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 15px;
            line-height: 1.4;
          }
          .title {
            font-weight: 800;
            width: 75px;
            flex-shrink: 0;
            letter-spacing: 0.5px;
          }
          .content {
            font-weight: 600;
            word-break: break-word;
          }
          .divider {
            border-top: 2px dashed #000;
            margin: 18px 0 14px 0;
          }
          .sender-box {
            text-align: center;
          }
          .sender-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 3px;
            color: #333;
            font-weight: bold;
          }
          .sender-name {
            font-size: 17px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
        }
      `}</style>

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
