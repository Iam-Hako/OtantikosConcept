'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Grid3X3, 
  ShoppingBag, 
  RotateCcw, 
  HelpCircle, 
  Star, 
  MessageCircle, 
  Sparkles, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Zap,
  Menu,
  X,
  Printer,
  Users,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [audioAlerts, setAudioAlerts] = useState(true);

  const menuItems = [
    { href: '/admin', label: 'Genel Bakış (Dashboard)', icon: LayoutDashboard },
    { href: '/admin/kar-zarar', label: 'Kâr / Zarar & Alış-Satış', icon: Calculator, badge: 'Muhasebe' },
    { href: '/admin/kullanicilar', label: 'Kullanıcılar & Yetkiler', icon: Users, badge: 'RBAC' },
    { href: '/admin/urunler', label: 'Ürün & Dinamik Özellikler', icon: Package },
    { href: '/admin/hizli-stok', label: 'Hızlı Stok & Fiyat Izgarası', icon: Zap, badge: 'Hızlı' },
    { href: '/admin/kategoriler', label: 'Kategori Yöneticisi', icon: Layers },
    { href: '/admin/siparisler', label: 'Siparişler & Koli Fişi', icon: ShoppingBag },
    { href: '/admin/kargo-etiketi', label: 'Kargo Etiketi (Termal)', icon: Printer, badge: '90mm' },
    { href: '/admin/iadeler', label: 'İade Masası (RMA)', icon: RotateCcw },
    { href: '/admin/soru-cevap', label: 'Soru-Cevap Moderasyonu', icon: HelpCircle },
    { href: '/admin/yorumlar', label: 'Yorum Moderasyonu', icon: Star },
    { href: '/admin/canli-destek', label: 'Canlı Destek Masası', icon: MessageCircle, badge: 'Canlı' },
    { href: '/admin/toptan-talepler', label: 'Toptan Teklif Talepleri', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col print:bg-white">
      
      {/* Admin Topbar */}
      <header className="bg-stone-900 text-white border-b border-stone-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 p-1 flex items-center justify-center">
              <Image src="/images/logo.webp" alt="Otantikos Admin" fill className="object-contain p-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm text-white tracking-wide">OTANTİKOS</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400">Yönetim Merkezi</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setAudioAlerts(!audioAlerts)}
            className={`p-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              audioAlerts ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title="Sipariş ve Canlı Destek Sesli Uyarısı"
          >
            {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-semibold">Sesli Uyarı: {audioAlerts ? 'Açık' : 'Kapalı'}</span>
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mağazaya Dön</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-800">
            <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="text-[11px]">
              <div className="font-bold text-white leading-tight">{user?.full_name || 'Admin'}</div>
              <div className="text-amber-400 text-[10px]">Yetkili Yönetici</div>
            </div>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex">
        
        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-64 bg-stone-900 text-stone-300 border-r border-stone-800 p-4 space-y-1.5 shrink-0 z-40 print:hidden overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-24 ${
            isSidebarOpen ? 'fixed inset-y-0 left-0 top-14 block' : 'hidden lg:block'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 py-2">
            Yönetim Modülleri
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-8 overflow-x-hidden print:p-0 print:overflow-visible">
          {children}
        </main>

      </div>

    </div>
  );
}
