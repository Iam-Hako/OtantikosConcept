"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Product, SiteSettings } from "@/data/mockData";
import { SiteTexts } from "@/data/siteTexts";
import {
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  TrendingUp,
  Search,
  CheckCircle,
  ShieldAlert,
  Settings,
  Layout,
  Save,
  Lock,
  FileText
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, settings, updateSettings, siteTexts, updateSiteTexts, products, addProduct, deleteProduct } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "site-settings" | "gui-texts">("products");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Form States
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [textsForm, setTextsForm] = useState<SiteTexts>(siteTexts);

  useEffect(() => {
    setSiteForm(settings);
  }, [settings]);

  useEffect(() => {
    setTextsForm(siteTexts);
  }, [siteTexts]);

  // Yeni Ürün Form State
  const [newProduct, setNewProduct] = useState({
    title: "NeeDoh Squishy Çin Mantısı Stres Oyuncağı",
    category: "Trend Oyuncak & Squishy",
    categorySlug: "trend-oyuncak-squishy",
    price: 199.90,
    stock: 50,
    description: "Trend olan yumuşacık NeeDoh Squishy Çin Mantısı! Rahatlatıcı dokusu ve eşsiz esnekliği ile en popüler stres oyuncağı.",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=800&auto=format&fit=crop"
  });

  // Yetki Kontrolü: Admin değilse engelle
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">Erişim Engellendi</h1>
        <p className="text-xs text-[#7C6354]">
          Admin paneline erişebilmek için <strong>Yönetici (Admin)</strong> yetkisine sahip bir hesapla giriş yapmalısınız.
        </p>
        <Link
          href="/hesabim"
          className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition inline-block"
        >
          Giriş Yap (Admin Hesabı)
        </Link>
      </div>
    );
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Bu ürünü mağazadan silmek istediğinize emin misiniz?")) {
      deleteProduct(id);
      showNotify("Ürün mağazadan silindi.");
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: `prod-${Date.now()}`,
      title: newProduct.title || "Yeni Ürün",
      slug: (newProduct.title || "yeni-urun").toLowerCase().replace(/\s+/g, "-"),
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category,
      categorySlug: newProduct.category.toLowerCase().includes("bijuteri") ? "bijuteri-taki" : "trend-oyuncak-squishy",
      images: [newProduct.image],
      stock: Number(newProduct.stock),
      rating: 5.0,
      reviewCount: 1,
      variants: [],
      details: ["Trend Kalite Garantisi"]
    };

    addProduct(created);
    setIsModalOpen(false);
    showNotify("Yeni ürün başarıyla kaydedildi!");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteForm);
    updateSiteTexts(textsForm);
    showNotify("Website yazıları ve site ayarları başarıyla kaydedildi!");
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Bildirim */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold animate-bounce border-2 border-white">
          <CheckCircle className="w-4 h-4" /> {notification}
        </div>
      )}

      {/* Üst Yönetici Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Yönetici Kontrol Paneli
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3E2E28] mt-1">Site & Ürün Yönetimi</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-[#3E2E28] text-white"
                : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <Package className="w-4 h-4" /> Ürün Kataloğu ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("gui-texts")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "gui-texts"
                ? "bg-[#3E2E28] text-white"
                : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#C86D51]" /> Tüm Site Yazılarını Düzenle
          </button>
          <button
            onClick={() => setActiveTab("site-settings")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "site-settings"
                ? "bg-[#3E2E28] text-white"
                : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <Settings className="w-4 h-4" /> Genel Ayarlar
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-[#C86D51]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Katalogdaki Ürünler</span>
            <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">{products.length} Adet</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-[#C86D51]">
            <ShoppingCart className="w-6 h-6 text-[#C86D51]" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Sistem Durumu</span>
            <h3 className="font-serif text-base font-bold text-emerald-600">Tamamen Canlıda</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Oturum Hesabı</span>
            <h3 className="font-serif text-sm font-bold text-[#3E2E28] truncate max-w-[150px]">{user.email}</h3>
          </div>
        </div>
      </div>

      {/* TAB 1: ÜRÜN KONTROLÜ */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Mağaza Ürün Envanteri</h3>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="NeeDoh, bijuteri, oyuncak ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                />
                <Search className="w-4 h-4 text-[#7C6354] absolute left-3 top-2.5" />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> Yeni Ürün Ekle
              </button>
            </div>
          </div>

          {/* Tablo */}
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#3E2E28]">
                <thead className="bg-[#F8F5F0] text-[#7C6354] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DCD3]">
                  <tr>
                    <th className="py-3 px-4">Görsel</th>
                    <th className="py-3 px-4">Ürün Adı</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Fiyat</th>
                    <th className="py-3 px-4">Stok</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DCD3]">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F8F5F0]/50 transition">
                      <td className="py-3 px-4">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#E6DCD3] bg-gray-50">
                          <Image src={p.images[0] || "/otantikos-logo.png"} alt={p.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#3E2E28] max-w-xs truncate">
                        <Link href={`/urun/${p.slug}`} className="hover:text-[#C86D51]">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#7C6354]">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-[#C86D51]">{p.price.toFixed(2)} TL</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.stock} Adet
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#7C6354] space-y-2">
              <p>Mağazanızda henüz ürün bulunmuyor.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-[#C86D51] hover:underline"
              >
                + Hemen İlk Ürünü Ekle (NeeDoh Squishy Çin Mantısı veya Bijuteri)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TÜM SİTE YAZILARINI DÜZENLEME */}
      {activeTab === "gui-texts" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-10">
          <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3E2E28] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C86D51]" /> Tüm Ekranlardaki Tüm Metinler Editörü
              </h3>
              <p className="text-xs text-[#7C6354] mt-0.5">
                Sitenin her bir ekranındaki (Header, Hero, Katalog, Ürün Kartı, Ürün Detayı, Sepet, Checkout, Hesabım, Footer) tüm metinleri buradan değiştirebilirsiniz.
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Tüm Metinleri Kaydet
            </button>
          </div>

          {/* 1. HEADER & MENÜ YAZILARI */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              1. Header & Üst Menü Yazıları
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Üst Duyuru Çubuğu Metni</label>
                <input
                  type="text"
                  value={textsForm.header.topbarText}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, topbarText: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Arama Kutusu İpucu (Placeholder)</label>
                <input
                  type="text"
                  value={textsForm.header.searchPlaceholder}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, searchPlaceholder: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ana Sayfa Menü İsmi</label>
                <input
                  type="text"
                  value={textsForm.header.navHome}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, navHome: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tüm Ürünler Menü İsmi</label>
                <input
                  type="text"
                  value={textsForm.header.navAllProducts}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, navAllProducts: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Squishy & Oyuncak Menü İsmi</label>
                <input
                  type="text"
                  value={textsForm.header.navSquishy}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, navSquishy: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Bijuteri & Takı Menü İsmi</label>
                <input
                  type="text"
                  value={textsForm.header.navJewelry}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, navJewelry: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Hesabım Buton İsmi</label>
                <input
                  type="text"
                  value={textsForm.header.accountLabel}
                  onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, accountLabel: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* 2. HERO / MANŞET YAZILARI */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              2. Ana Sayfa Hero Manşet Yazıları
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Üst Rozet Metni</label>
                <input
                  type="text"
                  value={textsForm.hero.badge}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, badge: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ana Manşet Başlığı</label>
                <input
                  type="text"
                  value={textsForm.hero.title}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, title: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Renkli Vurgu Başlığı</label>
                <input
                  type="text"
                  value={textsForm.hero.highlightTitle}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, highlightTitle: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 font-bold text-[#C86D51]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Buton Yazısı</label>
                <input
                  type="text"
                  value={textsForm.hero.buttonText}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, buttonText: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Manşet Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={textsForm.hero.description}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, description: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* 3. ÜRÜN KARTLARI YAZILARI */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              3. Ürün Kartları Üzerindeki Yazılar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Yeni Rozeti</label>
                <input
                  type="text"
                  value={textsForm.productCard.newBadge}
                  onChange={(e) => setTextsForm({ ...textsForm, productCard: { ...textsForm.productCard, newBadge: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sepete Ekle Buton Yazısı</label>
                <input
                  type="text"
                  value={textsForm.productCard.addToCart}
                  onChange={(e) => setTextsForm({ ...textsForm, productCard: { ...textsForm.productCard, addToCart: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sepette Var Yazısı</label>
                <input
                  type="text"
                  value={textsForm.productCard.inCart}
                  onChange={(e) => setTextsForm({ ...textsForm, productCard: { ...textsForm.productCard, inCart: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* 4. SEPET SAYFASI YAZILARI */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              4. Sepet Sayfası Metinleri
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Sepet Sayfa Başlığı</label>
                <input
                  type="text"
                  value={textsForm.cartPage.title}
                  onChange={(e) => setTextsForm({ ...textsForm, cartPage: { ...textsForm.cartPage, title: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Boş Sepet Başlığı</label>
                <input
                  type="text"
                  value={textsForm.cartPage.emptyCartTitle}
                  onChange={(e) => setTextsForm({ ...textsForm, cartPage: { ...textsForm.cartPage, emptyCartTitle: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ödemeye Geç Buton Yazısı</label>
                <input
                  type="text"
                  value={textsForm.cartPage.checkoutButton}
                  onChange={(e) => setTextsForm({ ...textsForm, cartPage: { ...textsForm.cartPage, checkoutButton: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kupon İpucu (Placeholder)</label>
                <input
                  type="text"
                  value={textsForm.cartPage.couponPlaceholder}
                  onChange={(e) => setTextsForm({ ...textsForm, cartPage: { ...textsForm.cartPage, couponPlaceholder: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* 5. CHECKOUT VE ÖDEME EKRANI */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              5. Ödeme & Teslimat Ekranı (Checkout)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Ödeme Başlığı</label>
                <input
                  type="text"
                  value={textsForm.checkoutPage.title}
                  onChange={(e) => setTextsForm({ ...textsForm, checkoutPage: { ...textsForm.checkoutPage, title: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Siparişi Tamamla Buton Metni</label>
                <input
                  type="text"
                  value={textsForm.checkoutPage.completeOrderButton}
                  onChange={(e) => setTextsForm({ ...textsForm, checkoutPage: { ...textsForm.checkoutPage, completeOrderButton: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Sipariş Onay Başlığı</label>
                <input
                  type="text"
                  value={textsForm.checkoutPage.orderSuccessTitle}
                  onChange={(e) => setTextsForm({ ...textsForm, checkoutPage: { ...textsForm.checkoutPage, orderSuccessTitle: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* 6. FOOTER VE ALT BİLGİLER */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold border-b border-[#E6DCD3] pb-2 text-[#C86D51]">
              6. Footer & Alt Bilgiler
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Marka Açıklaması</label>
                <input
                  type="text"
                  value={textsForm.footer.brandDescription}
                  onChange={(e) => setTextsForm({ ...textsForm, footer: { ...textsForm.footer, brandDescription: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Telif Hakkı (Copyright)</label>
                <input
                  type="text"
                  value={textsForm.footer.copyrightText}
                  onChange={(e) => setTextsForm({ ...textsForm, footer: { ...textsForm.footer, copyrightText: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ödeme Yöntemleri Rozeti</label>
                <input
                  type="text"
                  value={textsForm.footer.paymentMethodsBadge}
                  onChange={(e) => setTextsForm({ ...textsForm, footer: { ...textsForm.footer, paymentMethodsBadge: e.target.value } })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6DCD3]">
            <button
              type="submit"
              className="w-full py-4 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Tüm Değişiklikleri Kaydet & Canlı Sitede Yayınla
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GENEL AYARLAR */}
      {activeTab === "site-settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3E2E28] flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#C86D51]" /> Genel Mağaza Ayarları
              </h3>
              <p className="text-xs text-[#7C6354] mt-0.5">
                Mağaza adı, slogan ve genel sistem ayarları.
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Ayarları Kaydet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#3E2E28] mb-1">Mağaza Başlığı (Site Title)</label>
              <input
                type="text"
                value={siteForm.siteTitle}
                onChange={(e) => setSiteForm({ ...siteForm, siteTitle: e.target.value })}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3E2E28] mb-1">Mağaza Alt Sloganı (Site Subtitle)</label>
              <input
                type="text"
                value={siteForm.siteSubtitle}
                onChange={(e) => setSiteForm({ ...siteForm, siteSubtitle: e.target.value })}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3"
              />
            </div>
          </div>
        </form>
      )}

      {/* YENİ ÜRÜN EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-[#E6DCD3]">
            <h3 className="font-serif text-xl font-bold text-[#3E2E28]">Yeni Ürün Ekle</h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Ürün Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: NeeDoh Squishy Çin Mantısı veya Altın Kaplama Kolye"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Kategori</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                >
                  <option value="Trend Oyuncak & Squishy">Trend Oyuncak & Squishy (NeeDoh vs.)</option>
                  <option value="Bijuteri & Takı">Bijuteri & Takı</option>
                  <option value="Trend Hediyelikler">Trend Hediyelikler</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#3E2E28]">Fiyat (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#3E2E28]">Stok Adedi</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Görsel URL</label>
                <input
                  type="text"
                  required
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Ürün Açıklaması</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#3E2E28] rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C86D51] text-white rounded-xl font-semibold hover:bg-[#B05B41] transition"
                >
                  Kaydet & Mağazaya Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
