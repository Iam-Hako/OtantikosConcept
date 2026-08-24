'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Package, 
  RotateCcw, 
  MapPin, 
  LogOut, 
  ShieldCheck, 
  Truck, 
  ExternalLink,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { Order, ReturnRequest } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'returns' | 'profile'>('orders');

  // RMA Return Request Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Beden/Ölçü Uygunsuzluğu');
  const [returnDetails, setReturnDetails] = useState('');

  useEffect(() => {
    async function loadUserData() {
      const [orderList, returnList] = await Promise.all([
        DataService.getOrders(),
        DataService.getReturns(),
      ]);
      setOrders(orderList);
      setReturns(returnList);
    }
    loadUserData();
  }, []);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    const newRet = await DataService.createReturn({
      order_id: selectedOrderForReturn.id,
      user_id: user?.id || null,
      reason: returnReason,
      details: returnDetails,
    });

    setReturns((prev) => [newRet, ...prev]);
    setIsReturnModalOpen(false);
    setReturnDetails('');
    toast.success('İade / Değişim talebiniz başarıyla oluşturuldu!', {
      description: 'Talebiniz Otantikos yetkililerimizce incelenip yanıtlanacaktır.',
    });
    setActiveTab('returns');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg sm:text-xl shadow-2xs">
            {user?.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 leading-tight">
              {user?.full_name || 'Müşteri Hesabım'}
            </h1>
            <p className="text-xs text-stone-500">{user?.email || 'Giriş yapılmadı'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xs transition min-h-[40px] flex items-center"
            >
              ⚙️ Admin Paneli
            </Link>
          )}
          {user && (
            <button
              onClick={logout}
              className="px-3.5 py-2.5 border border-stone-300 text-stone-700 hover:text-rose-600 hover:bg-rose-50 active:scale-95 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 min-h-[40px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs with Horizontal Scroll for Mobile */}
      <div className="flex gap-2 border-b border-stone-200 overflow-x-auto scrollbar-none whitespace-nowrap -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Siparişlerim ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'returns'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>İade & Değişim Masası ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'profile'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil ve Bilgilerim</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">Kayıtlı Siparişiniz Bulunmuyor</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">Tahtakale koleksiyonumuzdan ilk siparişinizi verin.</p>
              <Link href="/kategori/tum-urunler" className="inline-flex px-5 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl transition min-h-[44px] items-center">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400">Sipariş No: </span>
                    <strong className="font-mono text-stone-900">{ord.order_number}</strong>
                    <span className="text-stone-400 ml-2 sm:ml-3">{formatDate(ord.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 font-bold rounded-full capitalize text-[11px] border border-amber-200">
                      {ord.status.replace('_', ' ')}
                    </span>
                    <Link
                      href={`/siparis-takip?order_number=${ord.order_number}`}
                      className="text-amber-700 font-bold hover:underline flex items-center gap-1 min-h-[36px] items-center"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Kargo İzle</span>
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{item.product_name}</div>
                        <div className="text-[11px] text-stone-500">
                          {item.quantity} Adet {item.variant_name ? `(${item.variant_name})` : ''} • Adet: {formatPrice(item.unit_price || item.price)}
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">{formatPrice(item.total_price || item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-stone-600">
                    Teslimat: <strong>{ord.delivery_type === 'pickup' ? 'Tahtakale Mağaza Teslim' : `${ord.shipping_address?.province || ''} / ${ord.shipping_address?.district || ''}`}</strong>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div>
                      <span className="text-stone-400">Toplam: </span>
                      <strong className="text-sm sm:text-base font-black text-amber-700">{formatPrice(ord.total_amount)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderForReturn(ord);
                        setIsReturnModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold rounded-xl text-xs transition min-h-[40px]"
                    >
                      İade Talebi Aç
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. RETURNS (RMA) TAB */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs">
              <RotateCcw className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">Aktif İade/Değişim Talebiniz Yok</h3>
              <p className="text-xs text-stone-500 mt-1">Siparişlerim sekmesinden dilediğiniz sipariş için 14 gün yasal iade talebi oluşturabilirsiniz.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">Talep #{ret.id}</span>
                    <span className="text-stone-400 ml-2">Tarih: {formatDate(ret.created_at)}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    ret.status === 'onaylandi' ? 'bg-emerald-100 text-emerald-800' :
                    ret.status === 'reddedildi' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {ret.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <div><strong>Neden:</strong> {ret.reason}</div>
                  {ret.details && <div><strong>Açıklama:</strong> {ret.details}</div>}
                </div>

                {ret.admin_response && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <strong>Yönetici Yanıtı:</strong> {ret.admin_response}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 max-w-lg space-y-4 text-xs shadow-2xs">
          <h3 className="text-sm font-bold text-stone-900">Kullanıcı Bilgileri</h3>
          <div className="space-y-2 text-stone-700">
            <div><strong>Ad Soyad:</strong> {user?.full_name || 'Tanımlanmamış'}</div>
            <div><strong>E-Posta:</strong> {user?.email}</div>
            <div><strong>Hesap Türü:</strong> {user?.role === 'admin' ? 'Yönetici (Admin)' : 'Standart Müşteri'}</div>
          </div>
        </div>
      )}

      {/* RMA RETURN REQUEST MODAL */}
      {isReturnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>İade & Değişim Talebi</span>
              </h3>
              <button 
                onClick={() => setIsReturnModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              <strong>{selectedOrderForReturn.order_number}</strong> numaralı siparişiniz için 14 gün koşulsuz iade/değişim talebi oluşturuyorsunuz.
            </p>

            <form onSubmit={handleCreateReturn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Talep Nedeni *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                >
                  <option value="Beden/Ölçü Uygunsuzluğu">Beden / Ölçü Uygunsuzluğu (Farklı model ile değişim)</option>
                  <option value="Vazgeçtim / Cayma Hakkı">Vazgeçtim / 14 Gün Yasal Cayma Hakkı</option>
                  <option value="Kargo Hasarlı / Kusurlu Ürün">Kargo Hasarlı veya Kusurlu Ürün</option>
                  <option value="Yanlış Ürün Gönderimi">Yanlış Ürün Gönderimi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Açıklama ve Talebiniz *</label>
                <textarea
                  rows={3}
                  required
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="İade veya değişim ile ilgili detaylı notunuzu yazınız..."
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition min-h-[48px]"
              >
                Talebi Gönder
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
