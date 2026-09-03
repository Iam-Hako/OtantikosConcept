'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  Sparkles,
  Building2
} from 'lucide-react';
import { DataService } from '@/lib/data/store-data';
import { Category } from '@/lib/types/ecommerce';

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 sm:pt-16 pb-24 lg:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VALUE PROPOSITIONS & TRUST BADGES - 2x2 on Mobile, 4-col on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pb-12 border-b border-stone-800 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">DHL Kargo Sevkiyatı</h4>
              <p className="text-stone-400 text-[11px] sm:text-xs mt-0.5">1-3 iş gününde kargo</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Net & Şeffaf Fiyat</h4>
              <p className="text-stone-400 text-[11px] sm:text-xs mt-0.5">Dürüst net fiyatlar</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">14 Gün Kolay İade</h4>
              <p className="text-stone-400 text-[11px] sm:text-xs mt-0.5">DHL Kargo RMA masası</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">256-Bit SSL Güvenli</h4>
              <p className="text-stone-400 text-[11px] sm:text-xs mt-0.5">3D Secure korumalı</p>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-stone-800">
          
          {/* Column 1: Brand & Corporate Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 p-1 flex items-center justify-center">
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

            <p className="text-xs text-stone-400 leading-relaxed">
              Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi
            </p>

            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="tel:+905077737777" className="hover:text-amber-400 transition font-medium">
                  +90 (507) 773 77 77 (10:00 - 17:00)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:aylindurmus54@gmail.com" className="hover:text-amber-400 transition font-medium">
                  aylindurmus54@gmail.com
                </a>
              </div>
              <div className="pt-1 text-[11px] text-stone-400">
                <span>Hocapaşa V.D. | VKN: 6491340351 | MERSİS: 0649134035100001</span>
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
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/kategori/${c.slug}`} className="hover:text-amber-400 transition">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/toptan-satis" className="text-amber-400 hover:underline transition flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Toptan Teklif & Satış</span>
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
                <Link href="/iade-ve-teslimat" className="hover:text-amber-400 transition">
                  Cayma Hakkı & İade Şartları
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-amber-400 transition">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-amber-400 transition">
                  Gizlilik ve Güvenlik
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

        {/* LEGAL IMPRINT & OFFICIAL IYZICO PAYMENT SECURITY BADGES */}
        <div className="pt-8 border-t border-stone-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <p className="text-xs text-stone-400 font-medium">
                © 2026 Otantikos Hediyelik Eşya Oyuncak Ticaret Limited Şirketi. Tüm hakları saklıdır.
              </p>
              <p className="text-[10px] text-stone-400">
                Vergi Dairesi: Hocapaşa V.D. | VKN: 6491340351 | MERSİS: 0649134035100001 | Ticaret Sicil No: 1146371
              </p>
            </div>

            {/* Official iyzico, Visa, Mastercard, Troy Logo Band */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <div className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 font-bold text-amber-400 flex items-center gap-1.5 shadow-2xs">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>256-Bit SSL</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 font-bold text-stone-300 flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>3D Secure</span>
                </div>
              </div>

              {/* Official iyzico logo band SVG */}
              <div className="relative h-8 w-64 sm:w-80 opacity-90 hover:opacity-100 transition-opacity">
                <Image
                  src="/images/iyzico/logo_band_white.svg"
                  alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
                  fill
                  className="object-contain object-center sm:object-right"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
