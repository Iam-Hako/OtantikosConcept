'use client';

import React, { useState } from 'react';
import { Sparkles, Phone, MapPin, User, CheckCircle2, MessageSquare } from 'lucide-react';
import { DataService } from '@/lib/data/store-data';
import { toast } from 'sonner';

export default function WholesalePage() {
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Lütfen isim, telefon ve adres alanlarını doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await DataService.addWholesaleRequest({
        contact_name: contactName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        company_name: contactName.trim(),
        city: address.trim(),
        email: '',
      });
      setIsSubmitted(true);
      toast.success('Toptan teklif talebiniz başarıyla alındı!');
    } catch {
      toast.error('Talep gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-10 pb-24 lg:pb-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-amber-100 text-amber-800 rounded-2xl shadow-2xs">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
          Toptan Teklif Alma Masası
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Hediyelik eşya, oyuncak, squishy ve trend ürünler için doğrudan toptan fiyat ve ürün teklifi alın.
        </p>
      </div>

      {/* Form or Confirmation */}
      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-10 text-center space-y-4 max-w-lg mx-auto shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-950">Toptan Teklif Talebiniz Alındı</h2>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Toptan satış temsilcimiz, ilettiğiniz bilgiler doğrultusunda en kısa sürede <strong>{phone}</strong> numaranız üzerinden sizinle iletişime geçecektir.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-2xs max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* İsim Soyisim */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>İsim Soyisim *</span>
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
            </div>

            {/* Telefon Numarası */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>Telefon Numarası *</span>
              </label>
              <input
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
            </div>

            {/* Adres */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Teslimat Adresi / İl - İlçe *</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
            </div>

            {/* Notlar / Talep Detayı */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>İlgilendiğiniz Ürünler / Talep Notunuz</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Gönderiliyor...' : 'Toptan Teklif Talebini Gönder'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
