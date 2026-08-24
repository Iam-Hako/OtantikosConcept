'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { ReturnRequest } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [activeReturn, setActiveReturn] = useState<ReturnRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    const list = await DataService.getReturns();
    setReturns(list);
  };

  const handleUpdateStatus = async (id: string, newStatus: ReturnRequest['status']) => {
    await DataService.updateReturnStatus(id, newStatus, adminResponse);
    toast.success(`İade talebi durumu "${newStatus.toUpperCase()}" olarak güncellendi.`);
    setActiveReturn(null);
    setAdminResponse('');
    loadReturns();
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-amber-600" />
          <span>Müşteri İade & Değişim Masası (RMA)</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Müşterilerin oluşturduğu iade ve değişim taleplerini inceleyin, onaylayın veya yanıtlayın.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Talep No & Tarih</th>
                <th className="py-3.5 px-4">Sipariş No</th>
                <th className="py-3.5 px-4">Neden</th>
                <th className="py-3.5 px-4">Müşteri Açıklaması</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {ret.id}
                    <div className="text-[10px] text-stone-400 font-normal">{formatDate(ret.created_at)}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-800">
                    {ret.order?.order_number || ret.order_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900">{ret.reason}</td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs truncate">{ret.details || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ret.status === 'onaylandi' ? 'bg-emerald-100 text-emerald-800' :
                      ret.status === 'reddedildi' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {ret.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveReturn(ret);
                        setAdminResponse(ret.admin_response || '');
                      }}
                      className="px-3 py-1 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition"
                    >
                      İncele / Yanıtla
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Respond Modal */}
      {activeReturn && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-slide-up text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900">İade Talebi #{activeReturn.id}</h3>
              <button onClick={() => setActiveReturn(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
              <div><strong>Neden:</strong> {activeReturn.reason}</div>
              <div><strong>Müşteri Notu:</strong> {activeReturn.details || 'Belirtilmedi'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Yönetici Yanıtı / Kargo Kodu</label>
              <textarea
                rows={3}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Örn: Talebiniz onaylandı. Lütfen Yurtiçi Kargo 123456 anlaşma kodumuzla karşı ödemeli gönderiniz."
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => handleUpdateStatus(activeReturn.id, 'reddedildi')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              >
                Talebi Reddet
              </button>
              <button
                onClick={() => handleUpdateStatus(activeReturn.id, 'onaylandi')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
              >
                Talebi Onayla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
