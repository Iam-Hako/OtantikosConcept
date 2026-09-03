'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Store, 
  Truck, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Bell, 
  CheckCircle2, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ComingSoonPage() {
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim() || !notifyEmail.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    setIsNotified(true);
    toast.success('Bildirim kaydınız alındı! Satışlar başladığında ilk size haber vereceğiz.');
  };

  const whatsappMessage = encodeURIComponent(
    'Merhaba Otantikos Concept, web sitenizdeki ürünler hakkında bilgi ve sipariş vermek istiyorum.'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 pb-24 lg:pb-16 text-center">
      
      {/* Brand Icon */}
      <div className="space-y-4">
        <div className="relative w-20 h-20 mx-auto bg-stone-950 rounded-3xl p-3 border border-stone-800 shadow-xl">
          <Image src="/images/logo.webp" alt="Otantikos Concept" fill className="object-contain p-1.5" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Geri Sayım Başladı • Altyapı Hazırlanıyor</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black text-stone-900 leading-tight max-w-2xl mx-auto">
          Online Satışlarımız Çok Yakında Başlıyor!
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Otantikos Concept Eminönü Tahtakale koleksiyonumuz için <strong>iyzico Sanal POS</strong> ve 3D Secure güvenli ödeme altyapısı entegrasyonu tamamlanmaktadır. Çok yakında tüm Türkiye genelinde doğrudan kredi kartı ve taksit seçenekleriyle online sipariş alımına başlıyoruz.
        </p>
      </div>

      {/* Trust & iyzico Logo Band */}
      <div className="p-5 sm:p-6 bg-stone-50 rounded-3xl border border-stone-200 shadow-2xs max-w-xl mx-auto space-y-3">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          Resmi BDDK Lisanslı Sanal POS Altyapısı
        </span>
        <div className="relative h-8 w-64 mx-auto opacity-90">
          <Image
            src="/images/iyzico/logo_band_colored.svg"
            alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-[11px] text-stone-500">
          256-Bit SSL Sertifikası • 3D Secure SMS Koruması • Tüm Banka Kartlarına Peşin Fiyatına Taksit
        </p>
      </div>

      {/* Alternative Immediate Ordering Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
        
        {/* WhatsApp Channel */}
        <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">WhatsApp ile Hemen Sipariş Verin</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Online kartla ödeme açılana kadar beğendiğiniz tüm ürünleri toptan veya perakende olarak doğrudan WhatsApp hattımızdan sipariş edebilirsiniz.
            </p>
          </div>

          <a
            href={`https://wa.me/905077737777?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Sipariş Hattı (+90 507 773 77 77)</span>
          </a>
        </div>

        {/* Physical Store Channel */}
        <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Tahtakale Mağazamıza Bekleriz</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Eminönü Süleymaniye'deki mağazamızdan ürünleri bizzat inceleyebilir, elden nakit veya POS ile anında teslim alabilirsiniz.
            </p>
          </div>

          <Link
            href="/iletisim"
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Mağaza Konumu & Bilgileri</span>
          </Link>
        </div>

      </div>

      {/* Notify Form */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-2xs max-w-xl mx-auto space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-stone-900">Satışlar Başladığında İlk Size Haber Verelim</h3>
          <p className="text-xs text-stone-500">
            Kredi kartı ile online satışlar ve açılışa özel fırsatlar aktif olduğunda bildirim alın.
          </p>
        </div>

        {isNotified ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>E-posta adresiniz kaydedildi. Açılış anında bilgilendirileceksiniz!</span>
          </div>
        ) : (
          <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="E-posta adresinizi giriniz..."
              className="flex-1 text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Haber Ver</span>
            </button>
          </form>
        )}
      </div>

      {/* Continue Browsing */}
      <div>
        <Link
          href="/kategori/tum-urunler"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
        >
          <span>Ürünlerimizi ve Kataloğu İncelemeye Devam Et</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
