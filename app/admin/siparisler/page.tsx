'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Printer, Truck, Check, Eye } from 'lucide-react';
import { Order } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { formatPrice, formatDate } from '@/lib/utils/format';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    DataService.getOrders().then(setOrders);
  }, []);

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = normalizeTurkish(searchQuery);
    const numMatch = normalizeTurkish(o.order_number).includes(q);
    const nameMatch = normalizeTurkish(o.shipping_address?.full_name || '').includes(q);
    const emailMatch = normalizeTurkish(o.guest_email || '').includes(q);
    return numMatch || nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            <span>Sipariş & Sevkiyat Yönetim Masası</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Sipariş durumlarını güncelleyin, kargo takip numarası atayın ve tek tıkla koli fişi yazdırın.
          </p>
        </div>
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

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Sipariş No & Tarih</th>
                <th className="py-3.5 px-4">Müşteri & İletişim</th>
                <th className="py-3.5 px-4">Teslimat Türü</th>
                <th className="py-3.5 px-4">Tutar</th>
                <th className="py-3.5 px-4">Kargo / Takip</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50 transition">
                  
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-stone-900">{ord.order_number}</div>
                    <div className="text-[10px] text-stone-400">{formatDate(ord.created_at)}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{ord.shipping_address.full_name}</div>
                    <div className="text-[10px] text-stone-500">{ord.shipping_address.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    {ord.delivery_type === 'magaza_teslim' ? (
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                        🏪 Tahtakale Mağaza
                      </span>
                    ) : (
                      <span className="text-stone-600 text-[11px]">
                        🚚 {ord.shipping_address.province} / {ord.shipping_address.district}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-amber-700">
                    {formatPrice(ord.total_amount)}
                  </td>

                  <td className="py-3.5 px-4">
                    {ord.tracking_number ? (
                      <div className="text-[11px]">
                        <span className="text-stone-500">{ord.tracking_carrier}:</span>
                        <strong className="font-mono text-stone-900 ml-1">{ord.tracking_number}</strong>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">Henüz Girilmedi</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/siparisler/${ord.id}`}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Fiş & Yönet</span>
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
