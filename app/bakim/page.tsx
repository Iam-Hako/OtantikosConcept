import type { Metadata } from 'next';
import Image from 'next/image';
import { Wrench, MessageCircle, Phone, Mail, MapPin, Clock, Store } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bakım Çalışması | Otantikos Concept',
  description:
    'Otantikos Concept online mağazamız geçici olarak bakım ve altyapı güncelleme aşamasındadır.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  const whatsappText = encodeURIComponent(
    'Merhaba Otantikos Concept, web siteniz bakım aşamasındayken ürün bilgisi veya sipariş hakkında ulaşmak istiyorum.'
  );

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900 flex flex-col justify-between">
      {/* Subtle Top Brand Accent Line */}
      <div className="h-1 w-full bg-[#e60012]" />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200">
                <Image
                  src="/logo.webp"
                  alt="Otantikos Concept"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <div className="font-sans font-black text-lg text-stone-900 tracking-tight leading-none">
                  Otantikos
                </div>
                <div className="text-[10px] font-extrabold text-stone-600 tracking-[0.2em] uppercase mt-1">
                  CONCEPT • TAHTAKALE
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-700 stroke-[1.75]" />
              <span>Geçici Bakım Modu</span>
            </div>
          </div>

          {/* Primary Focal Message */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-[#e60012] flex items-center justify-center">
              <Wrench className="w-6 h-6 stroke-[1.75]" />
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Sitemiz Şu Anda Bakım Aşamasındadır
            </h1>

            <p className="text-[15px] sm:text-base text-stone-600 leading-relaxed">
              Sizlere daha hızlı ve kesintisiz bir alışveriş deneyimi sunabilmek için sunucu ve medya altyapımızda planlı bakım çalışması gerçekleştiriyoruz. Çalışmamız tamamlandığında mağazamız yeniden yayına açılacaktır.
            </p>
          </div>

          {/* Direct Customer Contact Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`https://wa.me/905374676590?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 transition active:scale-[0.99] min-h-[44px]"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition">
                  WhatsApp Sipariş & Bilgi Hattı
                </div>
                <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5 tabular-nums">
                  0537 467 65 90
                </div>
                <div className="text-xs text-stone-600 mt-1">
                  Perakende ve toptan talepleriniz için hemen yazın.
                </div>
              </div>
            </a>

            <a
              href="tel:+905374676590"
              className="group flex items-start gap-3.5 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition active:scale-[0.99] min-h-[44px]"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900">
                  Müşteri Hizmetleri
                </div>
                <div className="text-sm font-mono font-bold text-stone-900 mt-0.5 tabular-nums">
                  0537 467 65 90
                </div>
                <div className="text-xs text-stone-600 mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">info@otantikosconcept.com</span>
                </div>
              </div>
            </a>
          </div>

          {/* Physical Store Information */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3 text-xs sm:text-sm text-stone-600">
            <Store className="w-5 h-5 text-[#e60012] shrink-0 mt-0.5 stroke-[1.75]" />
            <div className="space-y-1">
              <div className="font-bold text-stone-900">
                Eminönü Tahtakale Mağazamız Açık
              </div>
              <p className="leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G, Fatih / İstanbul
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 px-4 text-center text-xs text-stone-500 border-t border-stone-200/70 bg-white">
        Otantikos Hediyelik Eşya Oyuncak Tic. Ltd. Şti. • Anlayışınız için teşekkür ederiz.
      </footer>
    </div>
  );
}
