'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { WholesaleRequest } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';

export default function AdminWholesaleRequestsPage() {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);

  useEffect(() => {
    DataService.getWholesaleRequests().then(setRequests);
  }, []);

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <span>Tahtakale Toptan & B2B Teklif Talepleri</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Gelen kurumsal toptan alım ve distribütörlük taleplerini listeleyin.
        </p>
      </div>

      {/* Mobile Cards List (< md) */}
      <div className="md:hidden space-y-3">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            Toptan teklif talebi bulunmuyor.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <div className="font-bold text-stone-900 text-sm">{r.company_name}</div>
                  <div className="text-[10px] text-stone-400">{r.contact_name} • {formatDate(r.created_at)}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {r.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-stone-700">
                <div><strong>Şehir:</strong> {r.city}</div>
                <div><strong>Tahmini Hacim:</strong> {r.estimated_volume || '-'}</div>
                {r.notes && <div className="text-stone-600 italic">"{r.notes}"</div>}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <a
                  href={`tel:${r.phone}`}
                  className="py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 min-h-[40px] shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Telefon</span>
                </a>
                <a
                  href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 min-h-[40px] shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Firma & Yetkili</th>
                <th className="py-3.5 px-4">İletişim</th>
                <th className="py-3.5 px-4">Şehir</th>
                <th className="py-3.5 px-4">Tahmini Hacim</th>
                <th className="py-3.5 px-4">Notlar</th>
                <th className="py-3.5 px-4">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4 text-stone-400">{formatDate(r.created_at)}</td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    <div>{r.company_name}</div>
                    <div className="text-[10px] text-stone-500 font-normal">{r.contact_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{r.email}</div>
                    <div className="text-stone-500 font-bold">{r.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-stone-700">{r.city}</td>
                  <td className="py-3 px-4 font-semibold text-amber-800">{r.estimated_volume || '-'}</td>
                  <td className="py-3 px-4 max-w-xs text-stone-600">{r.notes}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {r.status.toUpperCase()}
                    </span>
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
