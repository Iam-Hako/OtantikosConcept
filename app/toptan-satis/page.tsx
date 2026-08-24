'use client';

import React, { useState } from 'react';
import { Sparkles, Building2, Phone, Mail, CheckCircle2, ShieldCheck, MessageCircle } from 'lucide-react';
import { DataService } from '@/lib/data/store-data';
import { toast } from 'sonner';

export default function WholesalePage() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [estimatedVolume, setEstimatedVolume] = useState('100 - 500 Adet');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.addWholesaleRequest({
      company_name: companyName,
      contact_name: contactName,
      email,
      phone,
      city,
      estimated_volume: estimatedVolume,
      notes,
    });
    setIsSubmitted(true);
    toast.success('Toptan teklif talebiniz alındı!');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-10 pb-24 lg:pb-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-amber-100 text-amber-800 rounded-2xl shadow-2xs">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
          Eminönü Tahtakale Toptan & B2B Satış Masası
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Bijüteri mağazaları, hediyelik eşya butikleri, e-ticaret satıcıları ve kurumsal hediye alımları için Tahtakale atölyelerimizden doğrudan toptan fiyat teklifi alın.
        </p>

        {/* Quick WhatsApp Quote Pill */}
        <div className="pt-2">
          <a
            href="https://wa.me/905077737777?text=Merhaba,%20Otantikos%20Concept%20toptan%20b2b%20fiyat%20listesi%20ve%20ürün%20kataloğu%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-sm transition min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hızlı WhatsApp B2B Teklifi Al (Anında Yanıt)</span>
          </a>
        </div>
      </div>

      {/* Form or Confirmation */}
      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-10 text-center space-y-4 max-w-lg mx-auto shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-950">Talebiniz B2B Masamıza İletildi</h2>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Tahtakale toptan satış temsilcimiz, ilettiğiniz bilgiler doğrultusunda özel toptan ürün kataloğumuz ve fiyat listemiz ile birlikte gün içinde <strong>{email}</strong> veya <strong>{phone}</strong> üzerinden sizinle iletişime geçecektir.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-10 shadow-2xs max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Firma / Mağaza Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Anadolu Butik"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Yetkili Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Örn: Mehmet Bey"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="iletisim@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="0532 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Bulunduğunuz Şehir *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İzmir"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Tahmini Aylık Alım Adedi</label>
                <select
                  value={estimatedVolume}
                  onChange={(e) => setEstimatedVolume(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                >
                  <option value="50 - 100 Adet">50 - 100 Adet</option>
                  <option value="100 - 500 Adet">100 - 500 Adet</option>
                  <option value="500 - 1.000 Adet">500 - 1.000 Adet</option>
                  <option value="1.000+ Adet (Koli/Palet)">1.000+ Adet (Koli / Palet)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">İlgilendiğiniz Ürün Grupları ve Notlarınız *</label>
              <textarea
                required
                rows={3}
                placeholder="Örn: 316L Çelik İtalyan ezme kolyeler ve el yapımı mozaik lambalar için toptan numune ve fiyat listesi talep ediyoruz..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition min-h-[48px]"
            >
              Toptan Teklif Talebini Gönder
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
