'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Printer, 
  Save, 
  Truck, 
  Package, 
  Gift, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Order } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order['status']>('siparis_alindi');
  const [trackingCarrier, setTrackingCarrier] = useState('Yurtiçi Kargo');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const orders = await DataService.getOrders();
      const found = orders.find((o) => o.id === orderId || o.order_number === orderId);
      if (found) {
        setOrder(found);
        setStatus(found.status);
        setTrackingCarrier(found.tracking_carrier || 'Yurtiçi Kargo');
        setTrackingNumber(found.tracking_number || '');
        setAdminNotes(found.admin_notes || '');
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSaving(true);
    await DataService.updateOrderStatus(
      order.id,
      status,
      trackingNumber,
      trackingCarrier,
      adminNotes
    );
    setIsSaving(false);

    toast.success('Sipariş ve kargo bilgileri güncellendi!', {
      description: 'Müşteri canlı sipariş takip çizelgesinde anında görüntülenecektir.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return <div className="p-8 text-center text-xs text-stone-500">Sipariş yükleniyor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/admin/siparisler" className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-black text-stone-900">
                Sipariş #{order.order_number}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 capitalize">
                {status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-500">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Tek Tıkla Koli Fişi Yazdır</span>
        </button>
      </div>

      {/* Admin Order Control Form (hidden on print) */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 no-print">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2">
          Sipariş Durumu & Kargo Takip Yönetimi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Sipariş Durumu</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold"
            >
              <option value="siparis_alindi">1. Sipariş Alındı (Ödeme Onaylı)</option>
              <option value="hazirlaniyor">2. Hazırlanıyor / Paketleniyor</option>
              <option value="kargoya_verildi">3. Kargoya Verildi (Takip No ile)</option>
              <option value="teslim_edildi">4. Teslim Edildi</option>
              <option value="iptal_edildi">İptal Edildi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Kargo Firması</label>
            <select
              value={trackingCarrier}
              onChange={(e) => setTrackingCarrier(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
            >
              <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
              <option value="Aras Kargo">Aras Kargo</option>
              <option value="MNG Kargo">MNG Kargo</option>
              <option value="PTT Kargo">PTT Kargo</option>
              <option value="Eminönü Kurye">Eminönü Özel Kurye</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Kargo Takip Numarası</label>
            <input
              type="text"
              placeholder="Örn: TK-987654321"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Yönetici İç Operasyon Notu</label>
          <input
            type="text"
            placeholder="Örn: Müşteri hediye paketi istedi, hediye kartı eklendi."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Kaydediliyor...' : 'Durumu Güncelle'}</span>
          </button>
        </div>
      </form>

      {/* ========================================================= */}
      {/* 2. PRINTABLE PACKING SLIP (KOLİ / SİPARİŞ FİŞİ) */}
      {/* ========================================================= */}
      <div id="printable-slip" className="bg-white p-8 rounded-3xl border-2 border-dashed border-stone-300 shadow-sm space-y-6">
        
        {/* Slip Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-stone-900 rounded-xl p-1 flex items-center justify-center">
              <Image src="/images/logo.webp" alt="Otantikos" width={44} height={44} className="object-contain" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-stone-900 tracking-tight">
                OTANTİKOS CONCEPT
              </h2>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">
                Eminönü Tahtakale Sevkiyat & Koli Fişi
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono font-black text-lg text-stone-900">{order.order_number}</div>
            <div className="text-[11px] text-stone-500">{formatDate(order.created_at)}</div>
          </div>
        </div>

        {/* Sender & Recipient Columns */}
        <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
          
          {/* Sender */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Gönderici Firma</span>
            <div className="font-bold text-stone-900">Otantikos Concept Ltd. Şti.</div>
            <div className="text-stone-600">Tahtakale Mah. Marpuççular Cad. No:18</div>
            <div className="text-stone-600">Eminönü / Fatih / İSTANBUL</div>
            <div className="text-stone-500">Tel: +90 (212) 522 34 56</div>
          </div>

          {/* Recipient */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Alıcı Müşteri & Teslimat</span>
            <div className="font-bold text-stone-900 text-sm">{order.shipping_address.full_name}</div>
            <div className="text-stone-700 font-medium">
              {order.shipping_address.province} / {order.shipping_address.district}
            </div>
            <div className="text-stone-600">{order.shipping_address.full_address}</div>
            <div className="text-stone-900 font-bold">Tel: {order.shipping_address.phone}</div>
          </div>

        </div>

        {/* Packing Itemized List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
            Paket İçeriği & Ürün Listesi
          </h3>
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold text-[11px] border-b border-stone-200">
              <tr>
                <th className="p-2.5">Sıra</th>
                <th className="p-2.5">Ürün Adı</th>
                <th className="p-2.5">Varyant / Seçenek</th>
                <th className="p-2.5 text-center">Adet</th>
                <th className="p-2.5 text-right">Birim Fiyat</th>
                <th className="p-2.5 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 text-stone-500">{idx + 1}</td>
                  <td className="p-2.5 font-semibold text-stone-900">{item.product_name}</td>
                  <td className="p-2.5 text-stone-600">{item.variant_name || '-'}</td>
                  <td className="p-2.5 text-center font-bold text-stone-900">{item.quantity}</td>
                  <td className="p-2.5 text-right text-stone-600">{formatPrice(item.price)}</td>
                  <td className="p-2.5 text-right font-bold text-stone-900">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-stone-50 font-bold text-xs border-t border-stone-200">
              <tr>
                <td colSpan={5} className="p-2.5 text-right">Genel Toplam (KDV Dahil):</td>
                <td className="p-2.5 text-right text-sm text-stone-900">{formatPrice(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Gift Note Banner on Packing Slip */}
        {order.has_gift_wrap && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <Gift className="w-4 h-4 text-amber-700" />
              <span>DİKKAT: ÖZEL HEDİYE PAKETİ YAPILACAK</span>
            </div>
            {order.gift_note && (
              <p className="italic text-stone-700 bg-white p-2 rounded border border-amber-200">
                "{order.gift_note}"
              </p>
            )}
          </div>
        )}

        {/* Packing Sign-off Footer */}
        <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-[11px] text-stone-500">
          <div>
            <span>Paketleyen Yetkili: __________________</span>
          </div>
          <div>
            <span>Kontrol / İmza: __________________</span>
          </div>
          <div>
            <span>Otantikos Tahtakale Depo</span>
          </div>
        </div>

      </div>

    </div>
  );
}
