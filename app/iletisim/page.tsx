'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-12 pb-24 lg:pb-12">
      
      <div className="text-center space-y-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
          Bize Ulaşın
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
          İletişim & Eminönü Mağaza Konumu
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Sorularınız, toptan sipariş talepleriniz veya mağazadan teslimat için bize dilediğiniz zaman ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Contact Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4 text-xs">
            
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Açık Adresimiz</h4>
                <p className="text-stone-600 mt-1 leading-relaxed font-medium">
                  Tahtakale Tanburacı Han
                </p>
                <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                  Eminönü / Fatih / İSTANBUL
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 text-sm">Telefon & WhatsApp</h4>
                <div>
                  <a href="tel:+905077737777" className="text-stone-700 hover:text-amber-700 font-bold block py-0.5 text-sm">
                    +90 (507) 773 77 77
                  </a>
                </div>
                <div>
                  <a
                    href="https://wa.me/905077737777?text=Merhaba,%20Otantikos%20Concept%20hakkında%20bilgi%20almak%20istiyorum."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp İle İletişime Geç</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Online İşlem Saatlerimiz</h4>
                <p className="text-stone-600 mt-1 font-semibold">10:00 - 17:00</p>
                <p className="text-stone-500 text-[11px] mt-0.5">Hafta içi tüm online işlemler ve siparişler bu saatler arasında işleme alınır.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Message Form & Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
            {isSent ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-stone-900">Mesajınız Bize Ulaştı</h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Tahtakale müşteri destek ekibimiz en kısa sürede sizinle iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-2">Bize Mesaj Gönderin</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">E-Posta Adresiniz *</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ahmet@ornek.com"
                      className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Konu Başlığı</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sipariş / Ürün / Toptan Alım vb."
                    className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Mesajınız *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı buraya yazabilirsiniz..."
                    className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Mesajı Gönder</span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Maps for Tahtakale */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>Eminönü Tahtakale Mağazamızı Haritada Görün</span>
              </div>
              <a
                href="https://maps.google.com/?q=Tahtakale+Marpuccular+Caddesi+Fatih+Istanbul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-700 hover:underline font-bold"
              >
                Haritada Aç ↗
              </a>
            </div>
            <div className="w-full h-64 bg-stone-100">
              <iframe
                title="Otantikos Eminönü Konumu"
                src="https://maps.google.com/maps?q=Tahtakale,Marpu%C3%A7cular%20Cd.%20No:18,Fatih,Istanbul&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
