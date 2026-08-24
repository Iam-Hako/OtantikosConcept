'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  X, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Send,
  MessageSquare,
  Filter
} from 'lucide-react';
import { WholesaleRequest } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminWholesaleRequestsPage() {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const list = await DataService.getWholesaleRequests();
      setRequests(list);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 4000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await DataService.updateWholesaleStatus(id, newStatus);
      toast.success('Talep durumu güncellendi');
      await loadRequests();
    } catch {
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`"${company}" firmasına ait toptan teklif talebini silmek istiyor musunuz?`)) {
      try {
        await DataService.deleteWholesaleRequest(id);
        toast.success('Talep silindi');
        await loadRequests();
      } catch {
        toast.error('Talep silinirken hata oluştu');
      }
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = normalizeTurkish(searchQuery.trim().toLowerCase());
        const companyMatch = normalizeTurkish((r.company_name || '').toLowerCase()).includes(q);
        const contactMatch = normalizeTurkish((r.contact_name || '').toLowerCase()).includes(q);
        const cityMatch = normalizeTurkish((r.city || '').toLowerCase()).includes(q);
        const emailMatch = normalizeTurkish((r.email || '').toLowerCase()).includes(q);
        const phoneMatch = (r.phone || '').includes(q);
        const notesMatch = normalizeTurkish((r.notes || '').toLowerCase()).includes(q);

        if (!companyMatch && !contactMatch && !cityMatch && !emailMatch && !phoneMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [requests, filterStatus, searchQuery]);

  const pendingCount = requests.filter(r => r.status === 'beklemede').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span>Tahtakale Toptan & B2B Teklif Talepleri</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Gelen kurumsal toptan alım, mağaza ve distribütörlük taleplerini anlık yönetin.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Yeni Yanıt Bekleyen Talep</span>
          </span>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Firma, yetkili, şehir, telefon veya not ara..."
            className="w-full text-base sm:text-xs pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tümü', count: requests.length },
            { id: 'beklemede', label: 'Beklemede', count: pendingCount },
            { id: 'iletisime_gecildi', label: 'İletişimde', count: requests.filter(r => r.status === 'iletisime_gecildi').length },
            { id: 'teklif_verildi', label: 'Teklif Verildi', count: requests.filter(r => r.status === 'teklif_verildi').length },
            { id: 'anlasildi', label: 'Anlaşıldı', count: requests.filter(r => r.status === 'anlasildi').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards List (< md) */}
      <div className="md:hidden space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="p-10 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200 shadow-2xs">
            {searchQuery ? 'Aramaya uygun toptan teklif talebi bulunamadı.' : 'Bu kategoride toptan teklif talebi bulunmuyor.'}
          </div>
        ) : (
          filteredRequests.map((r) => (
            <div key={r.id} className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-3.5 text-xs">
              
              <div className="flex items-start justify-between border-b border-stone-100 pb-3 gap-2">
                <div>
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{r.company_name}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 font-medium">
                    {r.contact_name} • {formatDate(r.created_at)}
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none transition ${
                    r.status === 'beklemede'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : r.status === 'anlasildi'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : r.status === 'teklif_verildi'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-stone-100 text-stone-800 border-stone-300'
                  }`}
                >
                  <option value="beklemede">Beklemede</option>
                  <option value="iletisime_gecildi">İletişime Geçildi</option>
                  <option value="teklif_verildi">Teklif Verildi</option>
                  <option value="anlasildi">Anlaşıldı</option>
                  <option value="reddedildi">Reddedildi</option>
                </select>
              </div>

              <div className="space-y-1.5 text-stone-700 bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span><strong>Şehir:</strong> {r.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Tahmini Alım:</strong> <span className="font-bold text-amber-900">{r.estimated_volume || '-'}</span></span>
                </div>
                {r.notes && (
                  <div className="text-stone-600 italic pt-1 border-t border-stone-200/60 mt-1">
                    "{r.notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`tel:${r.phone}`}
                  className="py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px] shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>
                <a
                  href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}?text=Merhaba%20${encodeURIComponent(r.contact_name)},%20Otantikos%20Concept%20toptan%20b2b%20talebiniz%20ile%20ilgili%20yazıyoruz.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px] shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${r.email}?subject=Otantikos%20Concept%20Toptan%20B2B%20Teklifi&body=Merhaba%20${encodeURIComponent(r.contact_name)},%0A%0A${encodeURIComponent(r.company_name)}%20için%20hazırladığımız%20toptan%20fiyat%20kataloğu%20ektedir.`}
                  className="py-2.5 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px] shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-Posta</span>
                </a>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleDelete(r.id, r.company_name)}
                  className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold flex items-center gap-1 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Talebi Sil</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
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
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-stone-400">
                    {searchQuery ? 'Aramaya uygun toptan teklif talebi bulunamadı.' : 'Bu kategoride toptan teklif talebi bulunmuyor.'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-4 px-4 text-stone-400 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900 text-xs">{r.company_name}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{r.contact_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-amber-800 font-medium">{r.email}</div>
                      <div className="text-stone-600 font-bold">{r.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-stone-700 font-medium">{r.city}</td>
                    <td className="py-4 px-4 font-bold text-amber-900">{r.estimated_volume || '-'}</td>
                    <td className="py-4 px-4 max-w-xs text-stone-600 text-[11px]">{r.notes || '-'}</td>
                    <td className="py-4 px-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${
                          r.status === 'beklemede'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : r.status === 'anlasildi'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : r.status === 'teklif_verildi'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="beklemede">Beklemede</option>
                        <option value="iletisime_gecildi">İletişime Geçildi</option>
                        <option value="teklif_verildi">Teklif Verildi</option>
                        <option value="anlasildi">Anlaşıldı</option>
                        <option value="reddedildi">Reddedildi</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${r.phone}`}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                          title="Telefonla Ara"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}?text=Merhaba%20${encodeURIComponent(r.contact_name)},%20Otantikos%20Concept%20toptan%20b2b%20talebiniz%20ile%20ilgili%20yazıyoruz.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                          title="WhatsApp Mesajı Gönder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`mailto:${r.email}?subject=Otantikos%20Concept%20Toptan%20B2B%20Teklifi&body=Merhaba%20${encodeURIComponent(r.contact_name)},%0A%0A${encodeURIComponent(r.company_name)}%20için%20hazırladığımız%20toptan%20fiyat%20kataloğu%20ektedir.`}
                          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
                          title="E-Posta Gönder"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(r.id, r.company_name)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="Talebi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
