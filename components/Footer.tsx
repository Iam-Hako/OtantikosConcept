'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Truck, 
  Award, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Headphones, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Youtube,
  Lock,
  Sparkles
} from 'lucide-react';
import { DataService } from '@/lib/data/store-data';
import { Category } from '@/lib/types/ecommerce';
import Logo from '@/components/Logo';

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-white text-stone-700 pt-10 sm:pt-14 pb-0 border-t border-stone-200">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP VALUE PROPOSITIONS & TRUST BADGES (6 RED OUTLINE ICONS - IMAGE 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pb-10 border-b border-stone-100 text-center">
          
          {/* Badge 1 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Aynı Gün Hızlı Kargo</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Hafta içi 15:00'e kadar verilen siparişler aynı gün kargoda.
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Memnuniyet Garantisi</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                İade ve değişim süreçlerinde koşulsuz müşteri memnuniyeti.
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Orijinal Ürün Garantisi</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Satılan tüm ürünler %100 orijinal ve kalite garantilidir.
              </p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Kolay İade</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Satın aldığınız ürünü 14 gün içinde kolayca iade edebilirsiniz.
              </p>
            </div>
          </div>

          {/* Badge 5 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Güvenli Alışveriş</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                256 Bit SSL ve iyzico altyapısı ile güvenli ödeme yapın.
              </p>
            </div>
          </div>

          {/* Badge 6 */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6 stroke-[1.6]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-[13px] text-stone-900">Kesintisiz İletişim</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Destek ekibimize WhatsApp ve çağrı merkezi üzerinden ulaşın.
              </p>
            </div>
          </div>

        </div>

        {/* MAIN CORPORATE & STORE COLUMNS (IMAGE 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-10 text-xs">
          
          {/* Col 1: Brand, Logo & Social */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="md" />
            </Link>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-stone-500">Bizi Takip Edin</p>
              <div className="flex items-center gap-2 text-stone-600">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-[#e60012] hover:text-white flex items-center justify-center transition"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-[#e60012] hover:text-white flex items-center justify-center transition"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-[#e60012] hover:text-white flex items-center justify-center transition"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 pt-2">
              Otantikos 2026 | Concept Store
            </p>
          </div>

          {/* Col 2: Kurumsal */}
          <div>
            <h4 className="font-black text-xs text-[#e60012] uppercase tracking-wider mb-3">
              Kurumsal
            </h4>
            <ul className="space-y-2 text-stone-600 font-medium">
              <li>
                <Link href="/hakkimizda" className="hover:text-[#e60012] transition">
                  Hakkımızda & Hikayemiz
                </Link>
              </li>
              <li>
                <Link href="/toptan-satis" className="hover:text-[#e60012] transition flex items-center gap-1 text-amber-700 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Tahtakale Toptan Satış</span>
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#e60012] transition">
                  Eminönü Mağazamız
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="hover:text-[#e60012] transition">
                  Marka Felsefemiz
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#e60012] transition">
                  İletişim & Konum
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Yardım */}
          <div>
            <h4 className="font-black text-xs text-[#e60012] uppercase tracking-wider mb-3">
              Yardım
            </h4>
            <ul className="space-y-2 text-stone-600 font-medium">
              <li>
                <Link href="/siparis-takip" className="hover:text-[#e60012] transition">
                  Müşteri Hizmetleri
                </Link>
              </li>
              <li>
                <Link href="/siparis-takip" className="hover:text-[#e60012] transition">
                  Sipariş & Kargo Takibi
                </Link>
              </li>
              <li>
                <Link href="/iade-ve-teslimat" className="hover:text-[#e60012] transition">
                  İade ve Değişim Rehberi
                </Link>
              </li>
              <li>
                <Link href="/giris" className="hover:text-[#e60012] transition">
                  Giriş Yap / Kayıt Ol
                </Link>
              </li>
              <li>
                <Link href="/hesabim" className="hover:text-[#e60012] transition">
                  Alışveriş Sepetim
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Alışveriş & Yasal */}
          <div>
            <h4 className="font-black text-xs text-[#e60012] uppercase tracking-wider mb-3">
              Alışveriş & Yasal
            </h4>
            <ul className="space-y-2 text-stone-600 font-medium">
              <li>
                <Link href="/iade-ve-teslimat" className="hover:text-[#e60012] transition">
                  İptal ve İade Koşulları
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[#e60012] transition">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/on-bilgilendirme-formu" className="hover:text-[#e60012] transition">
                  Ön Bilgilendirme Formu
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-[#e60012] transition">
                  Gizlilik ve Güvenlik
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-[#e60012] transition">
                  Kişisel Verilerin Korunması (KVKK)
                </Link>
              </li>
              <li>
                <Link href="/cerez-politikasi" className="hover:text-[#e60012] transition">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Popüler Kategoriler */}
          <div>
            <h4 className="font-black text-xs text-[#e60012] uppercase tracking-wider mb-3">
              Popüler Kategoriler
            </h4>
            <ul className="space-y-2 text-stone-600 font-medium">
              <li>
                <Link href="/kategori/tum-urunler" className="hover:text-[#e60012] transition">
                  Tüm Koleksiyon
                </Link>
              </li>
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/kategori/${c.slug}`} className="hover:text-[#e60012] transition flex items-center gap-1.5">
                    {c.icon && <span>{c.icon}</span>}
                    <span>{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 6: İletişim Bilgileri */}
          <div>
            <h4 className="font-black text-xs text-[#e60012] uppercase tracking-wider mb-3">
              İletişim Bilgileri
            </h4>
            <div className="space-y-2.5 text-stone-600">
              <p className="font-bold text-stone-900 leading-tight">
                Otantikos Hediyelik Eşya Oyuncak Tic. Ltd. Şti.
              </p>
              
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e60012] shrink-0" />
                <a href="tel:+905077737777" className="hover:text-[#e60012] transition font-bold text-stone-800">
                  0507 773 77 77
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#e60012] shrink-0" />
                <a href="mailto:aylindurmus54@gmail.com" className="hover:text-[#e60012] transition font-medium truncate">
                  aylindurmus54@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-1.5 pt-1 text-[11px] leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#e60012] shrink-0 mt-0.5" />
                <span>Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL</span>
              </div>

              <p className="text-[10px] text-stone-400 pt-1">
                Hocapaşa V.D. | VKN: 6491340351 | MERSİS: 0649134035100001
              </p>
            </div>
          </div>

        </div>

        {/* PAYMENT SECURITY & IYZICO ROW */}
        <div className="py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Güvenli Alışveriş
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              3D Secure ile Korunan Ödeme
            </span>
          </div>

          <div className="relative h-7 w-60 sm:w-72">
            <Image
              src="/images/iyzico/logo_band_white.svg"
              alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
              fill
              className="object-contain object-center sm:object-right invert"
            />
          </div>
        </div>

      </div>

      {/* BOTTOM PANORAMIC CHARACTER STRIP */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none mt-4 pb-14 sm:pb-0">
        <img
          src="/images/footer_otantikos_characters_v2.png?v=20260909_2"
          alt="Otantikos Sevimli Karakterler"
          className="w-full h-auto max-h-[140px] sm:max-h-[200px] object-cover object-bottom block"
          loading="eager"
        />
      </div>
    </footer>
  );
}
