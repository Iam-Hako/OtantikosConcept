'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Zap,
  Printer,
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import { Product, Order, ProfitSummary } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatPrice, formatDate } from '@/lib/utils/format';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [pList, oList, pSummary] = await Promise.all([
          DataService.getAllAdminProducts(),
          DataService.getOrders(),
          DataService.getProfitSummary(),
        ]);
        setProducts(pList);
        setOrders(oList);
        setProfitSummary(pSummary);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalRevenue = profitSummary?.totalRevenue ?? orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'hazirlaniyor' || o.status === 'siparis_alindi');
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
            Yönetim Kontrol Masası (Dashboard)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Eminönü Tahtakale mağazası ve e-ticaret platformu anlık operasyon özeti.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/kar-zarar"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-300" />
            <span>Kâr / Zarar Masası</span>
          </Link>
          <Link
            href="/admin/hizli-stok"
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hızlı Stok/Fiyat</span>
          </Link>
          <Link
            href="/admin/urunler/yeni"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Yeni Ürün</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Toplam Satış Cirosu</span>
            <span className="text-xl sm:text-2xl font-black text-stone-900 mt-1 block">
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-[10px] text-blue-600 font-bold mt-1 block">
              Web + Dükkan Satışları
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Net Profit */}
        <Link 
          href="/admin/kar-zarar"
          className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-900 shadow-xs flex items-center justify-between hover:bg-emerald-900 transition group"
        >
          <div>
            <span className="text-xs text-emerald-300 font-bold block">Net Kâr Durumu</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              +{formatPrice(profitSummary?.netProfit || 0)}
            </span>
            <span className="text-[10px] text-emerald-200 font-bold mt-1 flex items-center gap-1">
              <span>%{profitSummary?.profitMargin || 0} Marj</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
        </Link>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Toplam Sipariş</span>
            <span className="text-xl sm:text-2xl font-black text-stone-900 mt-1 block">
              {orders.length} Sipariş
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">
              OTN-2026 serisi
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Shipments */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Bekleyen Kargolar</span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 mt-1 block">
              {pendingOrders.length} Paket
            </span>
            <span className="text-[10px] text-amber-800 font-bold mt-1 block">
              Kargoya verilecek
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Kritik Stok (≤5)</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 mt-1 block">
              {lowStockProducts.length} Ürün
            </span>
            <span className="text-[10px] text-rose-700 font-bold mt-1 block">
              Acil Tahtakale ikmali
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Critical Stock Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-rose-50/80 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Kritik Stok Uyarısı Veren Ürünler</span>
            </div>
            <Link href="/admin/hizli-stok" className="text-xs font-bold text-rose-700 hover:underline">
              Hızlı Stok Girişi Yap ➔
            </Link>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">{p.name}</h4>
                  <div className="text-[11px] text-stone-400 font-mono">SKU: {p.sku} | Kategori: {p.category?.name || 'Genel'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 font-black rounded-full text-xs">
                    {p.stock === 0 ? 'TÜKENDİ' : `Kalan: ${p.stock} Adet`}
                  </span>
                  <Link
                    href={`/admin/urunler/${p.id}`}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Düzenle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-700" />
            <span>Son Gelen Siparişler</span>
          </h2>
          <Link href="/admin/siparisler" className="text-xs font-bold text-amber-700 hover:underline">
            Tüm Siparişleri Yönet ({orders.length}) ➔
          </Link>
        </div>

        {/* Mobile Recent Orders Cards (< md) */}
        <div className="md:hidden space-y-2.5">
          {orders.slice(0, 5).map((ord) => (
            <div key={ord.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">{ord.order_number}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 capitalize">
                  {ord.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{ord.shipping_address?.full_name}</span>
                <strong className="text-amber-700">{formatPrice(ord.total_amount)}</strong>
              </div>
              <Link
                href={`/admin/siparisler/${ord.id}`}
                className="w-full py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Fiş & Detayları Yönet</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Sipariş No</th>
                <th className="pb-3">Müşteri</th>
                <th className="pb-3">Teslimat</th>
                <th className="pb-3">Tutar</th>
                <th className="pb-3">Durum</th>
                <th className="pb-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                  <td className="py-3">{ord.shipping_address?.full_name}</td>
                  <td className="py-3">
                    <span className="text-[11px] text-stone-600">
                      {ord.delivery_type === 'pickup' ? '🏪 Tahtakale Mağaza' : '🚚 Standart Kargo'}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-amber-700">{formatPrice(ord.total_amount)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/siparisler/${ord.id}`}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Fiş & Detay</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
