'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Store, 
  Gift, 
  MapPin, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Order } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatPrice, formatDate } from '@/lib/utils/format';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams?.get('order_number') || searchParams?.get('siparis') || '';
  const initialEmail = searchParams?.get('email') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
      const json = await res.json();
      if (res.ok && json.success && json.order) {
        setOrder(json.order);
      } else {
        const found = await DataService.getOrderByNumber(orderNumber, email);
        setOrder(found);
      }
    } catch {
      const found = await DataService.getOrderByNumber(orderNumber, email);
      setOrder(found);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch();
    }
  }, [initialOrderNumber]);

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'siparis_alindi':
        return 0;
      case 'hazirlaniyor':
        return 1;
      case 'kargoya_verildi':
        return 2;
      case 'teslim_edildi':
        return 3;
      case 'iptal_edildi':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-100 text-amber-800 rounded-2xl mb-1 shadow-2xs">
          <Truck className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
          Canlı Kargo & Sipariş Takibi
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Sipariş numaranız (OTN-2026-XXXXX) ile siparişinizin Tahtakale depomuzdan teslimatına kadar olan sürecini canlı izleyin.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              Sipariş Takip Numarası *
            </label>
            <input
              type="text"
              required
              autoCapitalize="characters"
              placeholder="Örn: OT-20260824-001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-mono text-stone-900 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              E-Posta Adresi veya Alıcı Adı (Doğrulama için)
            </label>
            <input
              type="text"
              placeholder="ahmet@ornek.com veya Ahmet Yılmaz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Sorgulanıyor...' : 'Siparişi Canlı Sorgula'}</span>
          </button>
        </form>
      </div>

      {hasSearched && (
        <>
          {!order ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">Sipariş Bulunamadı</h3>
              <p className="text-xs text-stone-600 mt-1">
                Girdiğiniz sipariş numarası veya e-posta adresi eşleşmedi. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-10 shadow-2xs space-y-6 sm:space-y-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Sipariş No:</span>
                    <strong className="font-mono text-sm sm:text-base text-stone-900">{order.order_number}</strong>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Sipariş Tarihi: {formatDate(order.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Mevcut Durum:</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Responsive Progress Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-2xs ${
                      currentStep >= 0 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {currentStep > 0 ? '✓' : '1'}
                  </div>
                  <div className="font-bold text-stone-900 text-xs">Sipariş Alındı</div>
                  <div className="text-[10px] text-stone-400">Ödeme onaylandı</div>
                </div>

                <div className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-2xs ${
                      currentStep >= 1 ? 'bg-amber-600 text-white animate-pulse' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {currentStep > 1 ? '✓' : '2'}
                  </div>
                  <div className="font-bold text-amber-800 text-xs">Hazırlanıyor</div>
                  <div className="text-[10px] text-stone-400">Tahtakale depomuzda</div>
                </div>

                <div className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-2xs ${
                      currentStep >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {currentStep > 2 ? '✓' : '3'}
                  </div>
                  <div className="font-bold text-stone-900 text-xs">
                    {order.delivery_type === 'magaza_teslim' || order.delivery_type === 'pickup' ? 'Mağazada Hazır' : 'Kargoya Verildi'}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {order.tracking_number || 'Takip No Bekleniyor'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-2xs ${
                      currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {currentStep >= 3 ? '✓' : '4'}
                  </div>
                  <div className="font-bold text-stone-900 text-xs">Teslim Edildi</div>
                  <div className="text-[10px] text-stone-400">Alıcıya ulaştı</div>
                </div>
              </div>

              {order.tracking_number && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        {order.tracking_carrier || 'Yurtiçi Kargo'} ile Sevk Edildi
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Kargo Takip No: <strong className="font-mono">{order.tracking_number}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                    Teslimat & Adres Bilgileri
                  </h4>
                  <div className="p-4 rounded-xl bg-stone-50 space-y-1 text-stone-600">
                    <div className="font-semibold text-stone-900">
                      {order.shipping_address?.full_name ? (
                        order.shipping_address.full_name.split(' ').map(w => w.length > 2 ? w.slice(0, 2) + '***' : w).join(' ')
                      ) : 'Müşteri'}
                    </div>
                    <div>{order.shipping_address?.province} / {order.shipping_address?.district}</div>
                    <div className="text-stone-500">
                      {order.shipping_address?.full_address ? (
                        order.shipping_address.full_address.split(' ').map((w, idx) => idx > 1 && w.length > 2 ? w.slice(0, 2) + '***' : w).join(' ')
                      ) : ''}
                    </div>
                    {order.shipping_address?.courier_note && (
                      <div className="text-stone-500 italic mt-1">Kurye Notu: "{order.shipping_address.courier_note.slice(0, 30)}..."</div>
                    )}
                  </div>

                  {order.has_gift_wrap && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <Gift className="w-3.5 h-3.5" />
                        <span>Özel Hediye Paketi Talebi Mevcut</span>
                      </div>
                      {order.gift_note && (
                        <p className="text-[11px] italic">Not: "{order.gift_note}"</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                    Sipariş Edilen Ürünler
                  </h4>
                  <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl p-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-stone-900">{item.product_name}</div>
                          {item.variant_name && (
                            <div className="text-[10px] text-stone-500">Seçenek: {item.variant_name}</div>
                          )}
                          <div className="text-[10px] text-stone-400">{item.quantity} Adet x {formatPrice(item.unit_price || item.price)}</div>
                        </div>
                        <span className="font-bold text-stone-900">{formatPrice(item.total_price || item.total)}</span>
                      </div>
                    ))}

                    <div className="pt-2 flex justify-between font-bold text-stone-900">
                      <span>Toplam Tutar (KDV Dahil):</span>
                      <span className="text-amber-700">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Sipariş takip masası yükleniyor...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
