'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Printer, 
  Tag, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  Trash2,
  Truck,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { Order } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionCancelOrder, actionDeleteOrder, actionClearAllOrders } from '@/app/actions/ecommerce-actions';
import {
  formatPrice,
  formatDate,
  formatOrderPaymentSummary,
  formatOrderStatusLabel,
  buildCargoTrackingExternalUrl
} from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminOrdersClientView({
  initialOrders = [],
}: {
  initialOrders?: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [restockOnCancel, setRestockOnCancel] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Deletion Modal State
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear All Modal State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [creatingDhlOrderId, setCreatingDhlOrderId] = useState<string | null>(null);

  const handleQuickCreateDhl = async (ord: Order) => {
    setCreatingDhlOrderId(ord.id);
    try {
      const response = await fetch('/api/dhl/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: ord.id,
          order_number: ord.order_number,
          weight_kg: ord.total_desi || 1,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.tracking_number) {
        throw new Error(data.error || 'DHL kargo kodu oluşturulamadı.');
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === ord.id
            ? {
                ...o,
                status: 'kargoya_verildi',
                tracking_number: data.tracking_number,
                tracking_carrier: 'DHL Kargo',
              }
            : o
        )
      );
      toast.success(`#${ord.order_number} için DHL Takip No oluşturuldu!`, {
        description: `Takip No: ${data.tracking_number}`,
      });
    } catch (err: any) {
      toast.error(err.message || 'DHL kargo gönderisi oluşturulamadı.');
    } finally {
      setCreatingDhlOrderId(null);
    }
  };

  useEffect(() => {
    DataService.getOrders().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setOrders(list);
      }
    });
  }, []);

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      const res = await actionDeleteOrder(deletingOrder.id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
        toast.success(`Sipariş #${deletingOrder.order_number} kalıcı olarak silindi.`);
        setDeletingOrder(null);
      } else {
        toast.error((res as any).error || 'Sipariş silinemedi.');
      }
    } catch {
      toast.error('Silme işlemi sırasında hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClearAllOrders = async () => {
    setIsClearingAll(true);
    try {
      const res = await actionClearAllOrders();
      if (res.success) {
        setOrders([]);
        toast.success('Tüm siparişler başarıyla temizlendi.');
        setIsClearAllModalOpen(false);
      } else {
        toast.error((res as any).error || 'Siparişler temizlenemedi.');
      }
    } catch {
      toast.error('Siparişleri temizleme sırasında hata oluştu.');
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const res = await actionCancelOrder(cancellingOrder.id, cancelReason, restockOnCancel);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancellingOrder.id
              ? {
                  ...o,
                  status: 'iptal_edildi',
                  payment_status: 'refunded',
                  admin_notes: cancelReason
                    ? `${o.admin_notes ? o.admin_notes + ' | ' : ''}İptal Nedeni: ${cancelReason}`
                    : o.admin_notes,
                }
              : o
          )
        );
        toast.success(`Sipariş #${cancellingOrder.order_number} başarıyla iptal edildi!`, {
          description: restockOnCancel ? 'Ürün stokları depoya otomatik olarak geri yüklendi.' : undefined,
        });
        setCancellingOrder(null);
        setCancelReason('');
      } else {
        toast.error((res as any).error || (res as any).message || 'Sipariş iptal edilemedi.');
      }
    } catch {
      toast.error('İptal işlemi sırasında bir hata oluştu.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    const numMatch = normalizeTurkish(o.order_number).includes(q);
    const nameMatch = normalizeTurkish(o.shipping_address?.full_name || '').includes(q);
    const emailMatch = normalizeTurkish(o.guest_email || '').includes(q);
    const trackMatch = normalizeTurkish(o.tracking_number || '').includes(q);
    return numMatch || nameMatch || emailMatch || trackMatch;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#e60012]" />
            <span>Sipariş & Sevkiyat Yönetim Masası</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Sipariş durumlarını güncelleyin, kargo takip numarası atayın, satışları iptal edin veya koli fişi yazdırın.
          </p>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => setIsClearAllModalOpen(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Tüm Siparişleri Temizle ({orders.length})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Sipariş No (OTN-2026...) veya müşteri adı..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-500">Durum:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-semibold focus:outline-none"
          >
            <option value="all">Tüm Siparişler ({orders.length})</option>
            <option value="siparis_alindi">Sipariş Alındı</option>
            <option value="hazirlaniyor">Hazırlanıyor</option>
            <option value="kargoya_verildi">Kargoya Verildi</option>
            <option value="teslim_edildi">Teslim Edildi</option>
            <option value="iptal_edildi">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            Kriterlere uygun sipariş bulunamadı.
          </div>
        ) : (
          filtered.map((ord) => {
            const paymentInfo = formatOrderPaymentSummary(ord.payment_method, ord.payment_status);
            return (
            <div key={ord.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 text-xs">
                <div>
                  <div className="font-mono font-black text-stone-900 text-sm">{ord.order_number}</div>
                  <div className="text-[10px] text-stone-400">{formatDate(ord.created_at)}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    ord.status === 'iptal_edildi'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : ord.status === 'teslim_edildi'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-orange-50 text-orange-800 border-orange-200'
                  }`}
                >
                  {formatOrderStatusLabel(ord.status)}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-400">Müşteri:</span>
                  <strong className="text-stone-900">{ord.shipping_address?.full_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Telefon:</span>
                  <span>{ord.shipping_address?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Teslimat:</span>
                  <span>{ord.delivery_type === 'magaza_teslim' || ord.delivery_type === 'pickup' ? '🏪 Mağaza Teslim' : `🚚 ${ord.shipping_address?.province || ''}`}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-stone-400">Ödeme:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentInfo.badgeClass}`}>
                    {paymentInfo.label}
                  </span>
                </div>
                {Array.isArray(ord.items) && ord.items.length > 0 && (
                  <div className="pt-1 border-t border-stone-100 space-y-1">
                    <span className="text-stone-400 text-[10px] font-bold uppercase block">Sipariş Ürünleri:</span>
                    <div className="flex flex-col gap-1">
                      {ord.items.map((it, idx) => {
                        const slug = it.product_slug || it.product?.slug;
                        const href = slug
                          ? `/urun/${slug}`
                          : `/kategori/tum-urunler?ara=${encodeURIComponent(it.product_name)}`;
                        return (
                          <a
                            key={idx}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-between gap-1 text-[11px] font-semibold text-stone-800 hover:text-[#e60012] hover:underline"
                          >
                            <span className="truncate">{it.quantity}× {it.product_name}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-stone-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-400">Kargo Takip No:</span>
                  {ord.tracking_number ? (
                    <a
                      href={buildCargoTrackingExternalUrl(ord.tracking_number, ord.tracking_carrier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-stone-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] hover:underline"
                    >
                      {ord.tracking_carrier || 'DHL Kargo'}: {ord.tracking_number} ↗
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      {ord.delivery_type !== 'magaza_teslim' && ord.status !== 'iptal_edildi' && (
                        <button
                          type="button"
                          onClick={() => handleQuickCreateDhl(ord)}
                          disabled={creatingDhlOrderId === ord.id}
                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] rounded transition cursor-pointer"
                        >
                          {creatingDhlOrderId === ord.id ? 'Oluşturuluyor...' : 'DHL Kodu Al'}
                        </button>
                      )}
                      <Link
                        href={`/admin/siparisler/${ord.id}`}
                        className="text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        + Manuel Gir
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-stone-100 text-stone-900">
                  <span>Toplam Tutar:</span>
                  <span className="text-orange-700">{formatPrice(ord.total_amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Link
                  href={`/admin/kargo-etiketi?alici=${encodeURIComponent(ord.shipping_address?.full_name || '')}&tel=${encodeURIComponent(ord.shipping_address?.phone || '')}&adres=${encodeURIComponent((ord.shipping_address?.full_address || `${ord.shipping_address?.district || ''} / ${ord.shipping_address?.province || ''}`).trim())}&order=${encodeURIComponent(ord.order_number)}`}
                  className="py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px] shadow-2xs"
                  title="Kargo Etiketi"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Etiket</span>
                </Link>

                <Link
                  href={`/admin/siparisler/${ord.id}`}
                  className="py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px] shadow-2xs"
                  title="Koli Fişi & Detay"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Fiş</span>
                </Link>

                {ord.status !== 'iptal_edildi' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCancellingOrder(ord);
                      setCancelReason('');
                      setRestockOnCancel(true);
                    }}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px] shadow-2xs cursor-pointer"
                    title="Siparişi İptal Et"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-[11px]">İptal</span>
                  </button>
                ) : (
                  <div className="py-2.5 bg-stone-100 text-stone-400 font-bold rounded-xl text-[11px] flex items-center justify-center min-h-[40px]">
                    İptal Edildi
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(ord)}
                  className="text-stone-400 hover:text-rose-600 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Siparişi Sil</span>
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Desktop Orders Table (md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Sipariş No & Tarih</th>
                <th className="py-3.5 px-4">Müşteri & Ürünler</th>
                <th className="py-3.5 px-4">Teslimat Türü</th>
                <th className="py-3.5 px-4">Tutar & Ödeme</th>
                <th className="py-3.5 px-4">Kargo / Takip</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ord) => {
                const paymentInfo = formatOrderPaymentSummary(ord.payment_method, ord.payment_status);
                return (
                <tr key={ord.id} className="hover:bg-stone-50 transition">
                  
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-stone-900">{ord.order_number}</div>
                    <div className="text-[10px] text-stone-400">{formatDate(ord.created_at)}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-[260px]">
                    <div className="font-semibold text-stone-900">{ord.shipping_address?.full_name}</div>
                    <div className="text-[10px] text-stone-500">{ord.shipping_address?.phone}</div>
                    {Array.isArray(ord.items) && ord.items.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-0.5">
                        {ord.items.slice(0, 3).map((it, idx) => {
                          const slug = it.product_slug || it.product?.slug;
                          const href = slug
                            ? `/urun/${slug}`
                            : `/kategori/tum-urunler?ara=${encodeURIComponent(it.product_name)}`;
                          return (
                            <a
                              key={idx}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-[#e60012] hover:underline truncate"
                              title="Ürünü ayrı sekmede aç"
                            >
                              <span className="truncate">{it.quantity}× {it.product_name}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          );
                        })}
                        {ord.items.length > 3 && (
                          <Link href={`/admin/siparisler/${ord.id}`} className="text-[10px] text-stone-400 hover:underline">
                            +{ord.items.length - 3} ürün daha...
                          </Link>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {ord.delivery_type === 'magaza_teslim' || ord.delivery_type === 'pickup' ? (
                      <span className="text-orange-800 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-[10px]">
                        🏪 Tahtakale Mağaza
                      </span>
                    ) : (
                      <span className="text-stone-600 text-[11px]">
                        🚚 {ord.shipping_address?.province} / {ord.shipping_address?.district}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-orange-700">{formatPrice(ord.total_amount)}</div>
                    <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentInfo.badgeClass}`}>
                      <CreditCard className="w-2.5 h-2.5 shrink-0" />
                      <span>{paymentInfo.shortLabel}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {ord.tracking_number ? (
                      <div className="inline-flex flex-col gap-0.5 bg-amber-50/80 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px]">
                        <span className="text-[10px] font-semibold text-amber-900">{ord.tracking_carrier || 'DHL Kargo'}</span>
                        <a
                          href={buildCargoTrackingExternalUrl(ord.tracking_number, ord.tracking_carrier)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-stone-900 hover:text-[#e60012] hover:underline select-all"
                        >
                          {ord.tracking_number} ↗
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        {ord.delivery_type !== 'magaza_teslim' && ord.status !== 'iptal_edildi' && (
                          <button
                            type="button"
                            onClick={() => handleQuickCreateDhl(ord)}
                            disabled={creatingDhlOrderId === ord.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                          >
                            <Truck className="w-3 h-3" />
                            <span>{creatingDhlOrderId === ord.id ? 'Oluşturuluyor...' : 'DHL Kodu Al'}</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/siparisler/${ord.id}`}
                          className="text-[11px] font-semibold text-stone-500 hover:text-amber-800 hover:underline"
                        >
                          + Manuel Takip No
                        </Link>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        ord.status === 'iptal_edildi'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : ord.status === 'teslim_edildi'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-orange-50 text-orange-800 border-orange-200'
                      }`}
                    >
                      {formatOrderStatusLabel(ord.status)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/kargo-etiketi?alici=${encodeURIComponent(ord.shipping_address?.full_name || '')}&tel=${encodeURIComponent(ord.shipping_address?.phone || '')}&adres=${encodeURIComponent((ord.shipping_address?.full_address || `${ord.shipping_address?.district || ''} / ${ord.shipping_address?.province || ''}`).trim())}&order=${encodeURIComponent(ord.order_number)}`}
                        className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-bold rounded-lg text-xs transition inline-flex items-center gap-1 shadow-2xs"
                        title="Termal Kargo Etiketi Oluştur / Yazdır"
                      >
                        <Tag className="w-3.5 h-3.5 text-orange-700" />
                        <span>Kargo Etiketi</span>
                      </Link>

                      <Link
                        href={`/admin/siparisler/${ord.id}`}
                        className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1 shadow-2xs"
                        title="Koli Fişi & Sipariş Yönetimi"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Fiş & Detay</span>
                      </Link>

                      {ord.status !== 'iptal_edildi' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(ord);
                            setCancelReason('');
                            setRestockOnCancel(true);
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Siparişi İptal Et"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>İptal Et</span>
                        </button>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                          İptal Edildi
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeletingOrder(ord)}
                        className="p-2 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Siparişi Kalıcı Olarak Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </td>

                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="font-black text-sm text-stone-900">Siparişi İptal Et</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-400">Sipariş No:</span>
                <strong className="font-mono text-stone-900">{cancellingOrder.order_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Müşteri:</span>
                <span className="font-semibold text-stone-900">{cancellingOrder.shipping_address?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Tutar:</span>
                <strong className="text-orange-700">{formatPrice(cancellingOrder.total_amount)}</strong>
              </div>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-stone-700">İptal Nedeni</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Müşteri Talebi / Vazgeçti',
                  'Yönetici Test Siparişi',
                  'Hatalı Sipariş',
                  'Stok Yetersizliği',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCancelReason(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                      cancelReason === preset
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Özel iptal açıklaması yazabilirsiniz..."
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            {/* Restock Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="restockCheckbox"
                checked={restockOnCancel}
                onChange={(e) => setRestockOnCancel(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="restockCheckbox" className="text-xs font-semibold text-stone-800 cursor-pointer select-none">
                Siparişteki ürün adetlerini depoya otomatik geri yükle (Stok İadesi)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="w-1/3 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{isCancelling ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Clear All Orders Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-base">Tüm Siparişleri Sil</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Sistemdeki mevcut <strong className="text-stone-800">{orders.length} adet</strong> sipariş ve bu siparişlere ait tüm kalemler veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="w-1/2 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={handleConfirmClearAllOrders}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isClearingAll ? 'Siliniyor...' : 'Evet, Tümünü Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Order Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-base">Siparişi Sil</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  <strong className="text-stone-900">#{deletingOrder.order_number}</strong> numaralı sipariş ve detayları veritabanından kalıcı olarak silinecektir. Emin misiniz?
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="w-1/2 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteOrder}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Siliniyor...' : 'Evet, Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
