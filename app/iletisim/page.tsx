'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    toast.success('Mesajınız başarıyla iletildi!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Bize Ulaşın</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
          İletişim & Eminönü Mağaza Konumu
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Sorularınız, toptan talepleriniz veya mağazadan teslimat için bize dilediğiniz zaman ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
            
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Açık Adresimiz</h4>
                <p className="text-stone-600 mt-1 leading-relaxed">
                  Tahtakale Mah. Marpuççular Cad. No:18 Eminönü / Fatih / İSTANBUL
                </p>
                <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                  (Mısır Çarşısı ve Rüstem Paşa Camii Yanı)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Telefon & WhatsApp</h4>
                <p className="text-stone-600 mt-1">+90 (212) 522 34 56</p>
                <p className="text-stone-600">+90 (532) 555 00 12 (WhatsApp Destek)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">E-Posta</h4>
                <p className="text-stone-600 mt-1">destek@otantikosconcept.com</p>
                <p className="text-stone-600">toptan@otantikosconcept.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Çalışma Saatlerimiz</h4>
                <p className="text-stone-600 mt-1">Hafta İçi: 09:00 - 18:30</p>
                <p className="text-stone-600">Cumartesi: 09:30 - 17:00 | Pazar: Kapalı</p>
              </div>
            </div>

          </div>

          {/* Legal Tax Imprint */}
          <div className="p-5 bg-stone-900 text-white rounded-3xl text-xs space-y-1">
            <h4 className="font-bold text-amber-400">Resmi Şirket Künyesi</h4>
            <div className="text-stone-300">Otantikos Concept Hediyelik ve Takı San. Tic. Ltd. Şti.</div>
            <div className="text-stone-400 text-[11px]">Fatih Vergi Dairesi - VKN: 6490382910</div>
            <div className="text-stone-400 text-[11px]">Mersis No: 0649038291000001</div>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs">
          {isSent ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">Mesajınız Bize Ulaştı</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Tahtakale müşteri destek ekibimiz en kısa sürede sizinle iletişime geçecektir.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-stone-900 mb-2">Bize Mesaj Gönderin</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">E-Posta Adresiniz *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Konu Başlığı</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sipariş / Ürün / Toptan Alım vb."
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mesajınız *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı buraya yazabilirsiniz..."
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Mesajı Gönder</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
