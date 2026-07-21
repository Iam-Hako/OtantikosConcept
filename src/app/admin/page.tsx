"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Product, SiteSettings } from "@/data/mockData";
import { SiteTexts } from "@/data/siteTexts";
import { SupportChat, ChatMessage } from "@/components/LiveChat";
import {
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Search,
  CheckCircle,
  ShieldAlert,
  Settings,
  FileText,
  Lock,
  Users,
  MessageSquare,
  Send,
  UserCheck,
  UserMinus,
  Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user,
    isAdmin,
    registeredUsers,
    updateUserRole,
    settings,
    updateSettings,
    siteTexts,
    updateSiteTexts,
    products,
    addProduct,
    deleteProduct,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "users" | "chats" | "gui-texts" | "site-settings">("products");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Form States
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [textsForm, setTextsForm] = useState<SiteTexts>(siteTexts);

  // Canlı Destek Masası State'leri
  const [supportChats, setSupportChats] = useState<Record<string, SupportChat>>({});
  const [selectedChatEmail, setSelectedChatEmail] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  useEffect(() => {
    if (!hasInitializedForm && siteTexts && settings) {
      setSiteForm(settings);
      setTextsForm(siteTexts);
      setHasInitializedForm(true);
    }
  }, [siteTexts, settings, hasInitializedForm]);

  // LocalStorage'dan Canlı Destek Sohbetlerini Çek
  const loadSupportChats = () => {
    try {
      const raw = localStorage.getItem("otantikos_support_chats");
      if (raw) {
        const chats: Record<string, SupportChat> = JSON.parse(raw);
        setSupportChats(chats);
        if (!selectedChatEmail && Object.keys(chats).length > 0) {
          setSelectedChatEmail(Object.keys(chats)[0]);
        }
      }
    } catch (e) {
      console.error("Error loading support chats in admin:", e);
    }
  };

  useEffect(() => {
    loadSupportChats();
    const interval = setInterval(loadSupportChats, 800);
    const handleStorage = () => loadSupportChats();

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Yeni Ürün Form State
  const [newProduct, setNewProduct] = useState({
    title: "Özel Tasarım Bijuteri Kolye",
    category: "Bijuteri & Takı",
    categorySlug: "bijuteri-taki",
    price: 149.90,
    stock: 25,
    description: "Şık ve özgün tasarım bijuteri aksesuarı.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
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
      details: ["Otantikos Quality"]
    };

    addProduct(created);
    setIsModalOpen(false);
    showNotify("Yeni ürün başarıyla eklendi!");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteForm);
    updateSiteTexts(textsForm);
    showNotify("Metinler ve site ayarları kaydedildi!");
  };

  const handleAdminReplyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedChatEmail) return;

    const emailKey = selectedChatEmail.toLowerCase();
    const chat = supportChats[emailKey];

    if (chat) {
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "support",
        senderName: `Admin (${user.name})`,
        text: adminReplyText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedChat: SupportChat = {
        ...chat,
        lastUpdated: new Date().toISOString(),
        messages: [...chat.messages, replyMsg],
      };

      const updatedAll = { ...supportChats, [emailKey]: updatedChat };
      setSupportChats(updatedAll);
      localStorage.setItem("otantikos_support_chats", JSON.stringify(updatedAll));
      window.dispatchEvent(new Event("storage"));
      setAdminReplyText("");
      showNotify("Yanıtınız canlı destek hattından iletildi!");
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeChat = selectedChatEmail ? supportChats[selectedChatEmail.toLowerCase()] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Bildirim */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold animate-bounce border-2 border-white">
          <CheckCircle className="w-4 h-4" /> {notification}
        </div>
      )}

      {/* Üst Yönetici Başlığı */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Yönetici Kontrol Paneli
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3E2E28] mt-1">Site & Yetki Yönetimi</h1>
        </div>

        {/* Tab Menü Butonları */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "products" ? "bg-[#3E2E28] text-white" : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <Package className="w-4 h-4" /> Ürün Kataloğu ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "users" ? "bg-[#3E2E28] text-white" : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <Users className="w-4 h-4 text-[#C86D51]" /> Kullanıcı Yetkileri ({registeredUsers.length})
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 relative ${
              activeTab === "chats" ? "bg-[#3E2E28] text-white" : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" /> Canlı Destek Masası
            {Object.keys(supportChats).length > 0 && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("gui-texts")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "gui-texts" ? "bg-[#3E2E28] text-white" : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#C86D51]" /> Site Yazıları
          </button>

          <button
            onClick={() => setActiveTab("site-settings")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "site-settings" ? "bg-[#3E2E28] text-white" : "bg-white text-[#3E2E28] border border-[#D8C7B5]"
            }`}
          >
            <Settings className="w-4 h-4" /> Ayarlar
          </button>
        </div>
      </div>

      {/* TAB 1: ÜRÜN ENVENTARİ */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Mağaza Ürün Envanteri</h3>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Bijuteri veya ürün ara..."
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
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KULLANICI YETKİLENDİRME (MULTI-ADMIN) */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3E2E28] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C86D51]" /> Kullanıcı & Admin Yetkilendirme Masası
            </h3>
            <p className="text-xs text-[#7C6354] mt-1">
              Buradan kayıtlı kullanıcıları **Admin (Yönetici)** yetkisine yükseltebilir veya yetkilerini kaldırabilirsiniz. Admin yapılan tüm kullanıcılar ürün ekleyebilir ve canlı desteklere bakabilir.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3E2E28]">
              <thead className="bg-[#F8F5F0] text-[#7C6354] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DCD3]">
                <tr>
                  <th className="py-3 px-4">Kullanıcı Adı</th>
                  <th className="py-3 px-4">E-Posta Adresi</th>
                  <th className="py-3 px-4">Mevcut Rolü</th>
                  <th className="py-3 px-4">Kayıt Tarihi</th>
                  <th className="py-3 px-4 text-right">Yetki İşlemi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD3]">
                {/* Sabit Ana Admin */}
                <tr className="bg-amber-50/40">
                  <td className="py-3.5 px-4 font-bold text-[#3E2E28] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C86D51]" /> Ana Sistem Yöneticisi
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#7C6354]">admin@otantikosconcept.com</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Süper Admin
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#7C6354]">Sistem Tanımlı</td>
                  <td className="py-3.5 px-4 text-right font-bold text-gray-400 text-[10px]">Değiştirilemez</td>
                </tr>

                {/* Kayıtlı Diğer Kullanıcılar */}
                {registeredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F5F0]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#3E2E28]">{u.name}</td>
                    <td className="py-3.5 px-4 text-[#7C6354] font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      {u.role === "admin" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Yönetici (Admin)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Müşteri
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#7C6354]">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role === "admin" ? (
                        <button
                          onClick={() => {
                            updateUserRole(u.id, "user");
                            showNotify(`${u.name} kullanıcısının admin yetkisi kaldırıldı.`);
                          }}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <UserMinus className="w-3.5 h-3.5" /> Admin Yetkisini Al
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateUserRole(u.id, "admin");
                            showNotify(`${u.name} kullanıcısına Admin yetkisi verildi!`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Admin Yap (Yetkilendir)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CANLI DESTEK MASASI */}
      {activeTab === "chats" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3E2E28] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Canlı Destek Talepleri
            </h3>
            <p className="text-xs text-[#7C6354] mt-1">
              Web sitesindeki sağ alt canlı destek balonundan müşterilerinizin attığı mesajları buradan anında görüp yanıtlayabilirsiniz.
            </p>
          </div>

          {Object.keys(supportChats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[500px] border border-[#E6DCD3] rounded-2xl overflow-hidden">
              
              {/* Sol Sohbet Listesi */}
              <div className="md:col-span-4 bg-[#F8F5F0] border-r border-[#E6DCD3] overflow-y-auto divide-y divide-[#E6DCD3]">
                {Object.values(supportChats).map((chat) => (
                  <button
                    key={chat.userEmail}
                    onClick={() => setSelectedChatEmail(chat.userEmail)}
                    className={`w-full p-4 text-left transition flex flex-col gap-1 ${
                      selectedChatEmail?.toLowerCase() === chat.userEmail.toLowerCase()
                        ? "bg-white border-l-4 border-[#C86D51] shadow-sm"
                        : "hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#3E2E28] truncate">{chat.userName}</span>
                      <span className="text-[10px] text-[#7C6354]">
                        {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7C6354] font-mono truncate">{chat.userEmail}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                      {chat.messages.length} Mesaj
                    </span>
                  </button>
                ))}
              </div>

              {/* Sağ Sohbet Mesajlaşma Detayı */}
              <div className="md:col-span-8 flex flex-col h-full bg-white">
                {activeChat ? (
                  <>
                    <div className="p-4 bg-[#F8F5F0] border-b border-[#E6DCD3] flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#3E2E28]">{activeChat.userName}</h4>
                        <span className="text-xs text-[#7C6354] font-mono">{activeChat.userEmail}</span>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F5F0]/30">
                      {activeChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === "support" ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[9px] text-[#7C6354] mb-0.5 px-1 font-semibold">{msg.senderName}</span>
                          <div
                            className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              msg.sender === "support"
                                ? "bg-[#3E2E28] text-white rounded-br-none"
                                : "bg-white text-[#3E2E28] border border-[#E6DCD3] rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                            <span className="block text-[8px] text-right mt-1 opacity-70">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Yanıt Gönderme Formu */}
                    <form onSubmit={handleAdminReplyMessage} className="p-3 bg-white border-t border-[#E6DCD3] flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Müşteriye yanıtınız..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyText.trim()}
                        className="px-4 py-2.5 bg-[#C86D51] text-white font-bold rounded-xl hover:bg-[#B05B41] disabled:opacity-50 transition shadow-sm text-xs flex items-center gap-1.5"
                      >
                        <span>Yanıtla</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#7C6354]">
                    Sol taraftan bir canlı destek sohbeti seçiniz.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#7C6354] bg-[#F8F5F0] rounded-2xl border border-[#E6DCD3]">
              Henüz canlı destek talebi bulunmuyor. Kullanıcılar sağ alttaki canlı destek balonundan mesaj gönderdiğinde burada listelenecektir.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TÜM SİTE YAZILARINI DÜZENLEME */}
      {activeTab === "gui-texts" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Tüm Ekranlardaki Görünür Metinler</h3>
              <p className="text-xs text-[#7C6354]">Buradaki değişiklikler tüm mağazaya anında yansır.</p>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-2"
            >
              Yazıları Kaydet
            </button>
          </div>

          <div className="space-y-6 text-xs">
            {/* Header Metinleri */}
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Header (Üst Menü) Metinleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Arama Kutusu Yer Tutucusu</label>
                  <input
                    type="text"
                    value={textsForm.header?.searchPlaceholder || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, searchPlaceholder: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Hero Banner Metinleri */}
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Hero (Ana Sayfa Giriş) Metinleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Ana Başlık (İlk Kısım)</label>
                  <input
                    type="text"
                    value={textsForm.hero?.title || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, title: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vurgulu Başlık (İkinci Kısım)</label>
                  <input
                    type="text"
                    value={textsForm.hero?.highlightTitle || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, highlightTitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Hero Açıklama Paragrafı</label>
                <textarea
                  rows={2}
                  value={textsForm.hero?.description || ""}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, description: e.target.value } })}
                  className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: GENEL SİTE AYARLARI */}
      {activeTab === "site-settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
            <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Genel Site Ayarları</h3>
            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-md"
            >
              Ayarları Kaydet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Site Başlığı (Logo Yanı)</label>
              <input
                type="text"
                value={siteForm.siteTitle}
                onChange={(e) => setSiteForm({ ...siteForm, siteTitle: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5F0] border border-[#D8C7B5] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Site Sloganı / Alt Başlığı</label>
              <input
                type="text"
                value={siteForm.siteSubtitle}
                onChange={(e) => setSiteForm({ ...siteForm, siteSubtitle: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5F0] border border-[#D8C7B5] rounded-lg"
              />
            </div>
          </div>
        </form>
      )}

      {/* YENİ ÜRÜN MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E6DCD3]">
            <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Yeni Ürün Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Ürün Başlığı</label>
                <input
                  type="text"
                  required
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
                  <option value="Bijuteri & Takı">Bijuteri & Takı</option>
                  <option value="Hediyelik Eşya & Aksesuar">Hediyelik Eşya & Aksesuar</option>
                  <option value="Trend Oyuncak & Squishy">Trend Oyuncak & Squishy</option>
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
                <label className="block font-semibold mb-1 text-[#3E2E28]">Ürün Görseli (Bilgisayardan Seçin veya URL Yapıştırın)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewProduct({ ...newProduct, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C86D51] file:text-white hover:file:bg-[#B05B41] cursor-pointer"
                  />
                  {newProduct.image && (
                    <div className="flex items-center gap-3 bg-[#F8F5F0] p-2 rounded-xl border border-[#D8C7B5]">
                      <img src={newProduct.image} alt="Önizleme" className="w-12 h-12 object-cover rounded-lg border border-[#E6DCD3]" />
                      <span className="text-[10px] text-emerald-700 font-bold">✓ Görsel Başarıyla Yüklendi</span>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="veya https://... web adresi yapıştırın"
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2 text-xs"
                  />
                </div>
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
