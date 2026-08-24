'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  User, 
  Phone, 
  MapPin, 
  Search, 
  X, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Save,
  Check
} from 'lucide-react';
import { WholesaleRequest } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminWholesaleRequestsPage() {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  const loadRequests = useCallback(async () => {
    try {
      const list = await DataService.getWholesaleRequests();
      setRequests(list);
      // Initialize note editing state
      const noteMap: Record<string, string> = {};
      list.forEach((r) => {
        noteMap[r.id] = r.admin_notes || '';
      });
      setEditingNotes((prev) => ({ ...noteMap, ...prev }));
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 4000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await DataService.updateWholesaleStatus(id, newStatus, editingNotes[id]);
      toast.success('Talep durumu güncellendi.');
      await loadRequests();
    } catch {
      toast.error('Durum güncellenirken hata oluştu.');
    }
  };

  const handleSaveNote = async (reqItem: WholesaleRequest) => {
    const noteText = editingNotes[reqItem.id] || '';
    setSavingNotes((prev) => ({ ...prev, [reqItem.id]: true }));
    try {
      await DataService.updateWholesaleStatus(reqItem.id, reqItem.status as any, noteText);
      toast.success('Görüşme notu kaydedildi.');
      await loadRequests();
    } catch {
      toast.error('Not kaydedilemedi.');
    } finally {
      setSavingNotes((prev) => ({ ...prev, [reqItem.id]: false }));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" müşterisine ait toptan teklif talebini silmek istiyor musunuz?`)) {
      try {
        await DataService.deleteWholesaleRequest(id);
        toast.success('Talep silindi.');
        await loadRequests();
      } catch {
        toast.error('Talep silinirken hata oluştu.');
      }
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = normalizeTurkish(searchQuery.trim().toLowerCase());
        const contactMatch = normalizeTurkish((r.contact_name || '').toLowerCase()).includes(q);
        const addressMatch = normalizeTurkish((r.address || r.city || '').toLowerCase()).includes(q);
        const phoneMatch = (r.phone || '').includes(q);
        const notesMatch = normalizeTurkish((r.notes || '').toLowerCase()).includes(q);
        const adminNotesMatch = normalizeTurkish((r.admin_notes || '').toLowerCase()).includes(q);

        if (!contactMatch && !addressMatch && !phoneMatch && !notesMatch && !adminNotesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [requests, filterStatus, searchQuery]);

  const pendingCount = requests.filter((r) => r.status === 'beklemede').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span>Toptan Teklif Talepleri & Müşteri Masası</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Müşterilerin ilettiği toptan teklif taleplerini inceleyin, telefon veya WhatsApp ile görüşün ve notlarınızı kaydedin.
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
            placeholder="İsim, telefon, adres veya talep notu ara..."
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
            { id: 'iletisime_gecildi', label: 'İletişimde', count: requests.filter((r) => r.status === 'iletisime_gecildi').length },
            { id: 'teklif_verildi', label: 'Teklif Verildi', count: requests.filter((r) => r.status === 'teklif_verildi').length },
            { id: 'anlasildi', label: 'Anlaşıldı', count: requests.filter((r) => r.status === 'anlasildi').length },
          ].map((tab) => (
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

      {/* Cards List for All Devices (Ergonomic Wholesale Desk) */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200 shadow-2xs">
            {searchQuery ? 'Aramaya uygun toptan teklif talebi bulunamadı.' : 'Bu filtrede toptan teklif talebi bulunmuyor.'}
          </div>
        ) : (
          filteredRequests.map((r) => {
            const customerAddress = r.address || r.city || 'Belirtilmedi';
            const cleanPhoneDigits = r.phone ? r.phone.replace(/[^0-9]/g, '') : '';
            const isNoteSaving = Boolean(savingNotes[r.id]);

            return (
              <div key={r.id} className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-4 text-xs transition hover:border-amber-300">
                
                {/* Header: Customer Name & Status Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm sm:text-base">
                        {r.contact_name}
                      </div>
                      <div className="text-[11px] text-stone-400 font-medium">
                        Talep Tarihi: {formatDate(r.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Delete */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition cursor-pointer ${
                        r.status === 'beklemede'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : r.status === 'anlasildi'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : r.status === 'teklif_verildi'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : r.status === 'iletisime_gecildi'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-stone-100 text-stone-800 border-stone-300'
                      }`}
                    >
                      <option value="beklemede">1. Beklemede (Yeni)</option>
                      <option value="iletisime_gecildi">2. İletişime Geçildi</option>
                      <option value="teklif_verildi">3. Teklif Verildi</option>
                      <option value="anlasildi">4. Anlaşıldı / Satış Yapıldı</option>
                      <option value="reddedildi">5. İptal / Reddedildi</option>
                    </select>

                    <button
                      onClick={() => handleDelete(r.id, r.contact_name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                      title="Talebi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: Contact Info & Address */}
                  <div className="space-y-2.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-bold text-stone-900 text-sm">{r.phone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-semibold text-stone-500 block">Teslimat / Şehir Adresi:</span>
                        <span className="text-stone-800 font-medium">{customerAddress}</span>
                      </div>
                    </div>

                    {r.notes && (
                      <div className="pt-2 border-t border-stone-200/70">
                        <span className="text-[11px] font-semibold text-stone-500 block">Müşteri Notu / Talep Detayı:</span>
                        <p className="text-stone-800 italic mt-0.5 bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                          "{r.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Admin Notes / Follow-up Desk */}
                  <div className="space-y-2 bg-amber-50/40 p-4 rounded-2xl border border-amber-200 flex flex-col justify-between">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>Admin Masası Görüşme & Takip Notu:</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Müşteriyle yapılan görüşme detayları, teklif edilen fiyat veya sipariş notlarını buraya yazın..."
                        value={editingNotes[r.id] ?? ''}
                        onChange={(e) => setEditingNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-stone-400">
                        {r.updated_at ? `Son Güncelleme: ${formatDate(r.updated_at)}` : ''}
                      </span>
                      <button
                        type="button"
                        disabled={isNoteSaving}
                        onClick={() => handleSaveNote(r)}
                        className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 min-h-[36px]"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isNoteSaving ? 'Kaydediliyor...' : 'Notu Kaydet'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Bottom Action Buttons: Direct Call & Direct WhatsApp */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`tel:${r.phone}`}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Müşteriyi Telefonla Ara</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanPhoneDigits}?text=Merhaba%20${encodeURIComponent(r.contact_name)},%20Otantikos%20Concept%20toptan%20teklif%20talebiniz%20ile%20ilgili%20yazıyoruz.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Mesajı Başlat</span>
                  </a>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
