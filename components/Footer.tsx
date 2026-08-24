'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/lib/data/initial-seed';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-24 lg:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. VALUE PROPOSITIONS & TRUST BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Doğrudan Tahtakale Sevkiyatı</h4>
              <p className="text-stone-400 mt-0.5">Eminönü merkezli hızlı kargo & mağazadan teslim</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Net & Şeffaf Fiyat</h4>
              <p className="text-stone-400 mt-0.5">Kupon oyunu yok, doğrudan net dürüst fiyatlar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">14 Gün Kolay İade Masası</h4>
              <p className="text-stone-400 mt-0.5">Online panelden tek tıkla iade/değişim talebi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">256-Bit SSL Güvenli Ödeme</h4>
              <p className="text-stone-400 mt-0.5">3D Secure ve sanal POS ile korumalı alışveriş</p>
            </div>
          </div>
        </div>

        {/* 2. MAIN FOOTER LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-stone-800">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 p-1 flex items-center justify-center">
                <Image
                  src="/images/logo.webp"
                  alt="Otantikos Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl text-white tracking-tight">
                  OTANTİKOS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
                  CONCEPT
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed pr-4">
              İstanbul Eminönü Tahtakale'nin köklü ticaret ve zanaat kültürünü modern tasarımlarla buluşturuyoruz. 316L kararmaz çelik takılar, el yapımı mozaik lambalar, trend mekanik oyuncaklar ve özel hediyelik koleksiyonlarımızı net ve dürüst fiyatlarla sunuyoruz.
            </p>

            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Tahtakale Mah. Marpuççular Cad. No:18 Eminönü / Fatih / İSTANBUL</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+90 (212) 522 34 56 (Hafta İçi 09:00 - 18:30)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>destek@otantikosconcept.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Kategoriler
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/kategori/tum-urunler" className="hover:text-amber-400 transition">
                  Tüm Koleksiyon
                </Link>
              </li>
              {INITIAL_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/kategori/${c.slug}`} className="hover:text-amber-400 transition">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/toptan-satis" className="text-amber-400 hover:underline transition flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Toptan & B2B Sipariş</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Müşteri Hizmetleri
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/siparis-takip" className="hover:text-amber-400 transition">
                  Kargo & Sipariş Takibi
                </Link>
              </li>
              <li>
                <Link href="/hesabim" className="hover:text-amber-400 transition">
                  Hesabım & Siparişlerim
                </Link>
              </li>
              <li>
                <Link href="/iade-ve-teslimat" className="hover:text-amber-400 transition">
                  İade ve Teslimat Şartları
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="hover:text-amber-400 transition">
                  Hakkımızda & Hikayemiz
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-amber-400 transition">
                  İletişim & Mağaza Konumu
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Pages */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Yasal & Kurumsal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/kvkk" className="hover:text-amber-400 transition">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-amber-400 transition">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/on-bilgilendirme-formu" className="hover:text-amber-400 transition">
                  Ön Bilgilendirme Koşulları
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-amber-400 transition">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/cerez-politikasi" className="hover:text-amber-400 transition">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. LEGAL IMPRINT & COPYRIGHT */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            <p>
              © 2026 Otantikos Concept. Tüm hakları saklıdır. Tahtakale / Eminönü / İstanbul.
            </p>
            <p className="mt-0.5 text-stone-600">
              Fatih Vergi Dairesi - VKN: 6490382910 | Mersis No: 0649038291000001
            </p>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-3 text-stone-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Güvenli Ödeme:</span>
            <div className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-stone-300">
              3D Secure
            </div>
            <div className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-stone-300">
              Mastercard
            </div>
            <div className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-stone-300">
              VISA
            </div>
            <div className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-stone-300">
              Troy
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
