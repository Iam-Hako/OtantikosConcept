'use client';

import React, { useState, useEffect } from 'react';
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

  // Auto-fill from localStorage if customer previously saved phone
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('otantikos_customer_phone');
      if (saved && !phone) {
        handlePhoneChange(saved);
      }
    }
  }, []);

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (!raw) {
      setPhone('');
      return;
    }
    const digits = raw.startsWith('0') ? raw.slice(0, 11) : ('0' + raw).slice(0, 11);
    if (digits.length <= 4) {
      setPhone(digits);
    } else if (digits.length <= 7) {
      setPhone(`${digits.slice(0, 4)} ${digits.slice(4)}`);
    } else if (digits.length <= 9) {
      setPhone(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
    } else {
      setPhone(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`);
      if (typeof window !== 'undefined' && digits.length === 11) {
        localStorage.setItem('otantikos_customer_phone', digits);
      }
    }
  };

  const cleanPhoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhoneDigits.length === 11 && cleanPhoneDigits.startsWith('05');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Lütfen isim, telefon ve adres alanlarını doldurunuz.');
      return;
    }

    if (!isPhoneValid) {
      toast.error('Lütfen geçerli bir cep telefonu numarası giriniz (05XX XXX XX XX formatında 11 hane olmalıdır).');
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
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-10 pb-24 lg:pb-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-red-50 text-[#e60012] border border-red-200 rounded-2xl shadow-2xs">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#e60012]" />
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-10 text-center space-y-5 max-w-lg mx-auto shadow-2xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-emerald-950">Toptan Teklif Talebiniz Alındı!</h2>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Toptan satış temsilcimiz, ilettiğiniz bilgiler doğrultusunda en kısa sürede <strong>{phone}</strong> numaranız üzerinden sizinle iletişime geçecektir.
              </p>
            </div>

            <div className="pt-3 border-t border-emerald-200/80">
              <p className="text-[11px] text-emerald-900 font-medium mb-3">
                Vaktiniz kısıtlı mı? Beklemeden doğrudan WhatsApp hattımızdan toptan fiyat listesini hemen talep edebilirsiniz:
              </p>
              <a
                href={`https://wa.me/905077737777?text=Merhaba,%20Otantikos%20Concept%20web%20sitenizden%20toptan%20fiyat%20teklifi%20talebinde%20bulundum.%20İsmim:%20${encodeURIComponent(contactName)}.%20Toptan%20ürün%20kataloğu%20ve%20fiyat%20listesini%20paylaşabilir%20misiniz?`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Sipariş Hattı (+90 507 773 77 77)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-2xs max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* İsim Soyisim */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#e60012]" />
                  <span>İsim Soyisim *</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Adınız Soyadınız"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] text-stone-900 transition"
                />
              </div>

              {/* Telefon Numarası */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#e60012]" />
                    <span>Cep Telefonu Numarası *</span>
                  </label>
                  {isPhoneValid ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Geçerli Numara
                    </span>
                  ) : phone ? (
                    <span className="text-[10px] font-semibold text-amber-700">
                      05XX XXX XX XX (11 hane)
                    </span>
                  ) : null}
                </div>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full text-base sm:text-xs p-3 bg-stone-50 border rounded-xl focus:bg-white focus:outline-none font-mono text-stone-900 transition ${
                    isPhoneValid 
                      ? 'border-emerald-500 focus:border-emerald-600 bg-emerald-50/20' 
                      : phone.length > 0 
                      ? 'border-amber-400 focus:border-amber-500' 
                      : 'border-stone-300 focus:border-[#e60012]'
                  }`}
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Örn: 05XX XXX XX XX (Teklif ve ürün kataloğu WhatsApp / telefon üzerinden bu numaraya iletilir).
                </p>
              </div>

              {/* Adres */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#e60012]" />
                  <span>Teslimat Adresi / İl - İlçe *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İstanbul, Kadıköy veya mağaza/şirket açık adresiniz"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] text-stone-900 transition"
                />
              </div>

              {/* Notlar / Talep Detayı */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#e60012]" />
                  <span>İlgilendiğiniz Ürünler / Talep Notunuz</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Hangi squishy veya hediyelik ürünlerden kaç adet talep etmek istediğinizi belirtebilirsiniz..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] text-stone-900 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[48px] cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Gönderiliyor...' : 'Toptan Teklif Talebini Gönder'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
