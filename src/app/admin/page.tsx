"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, RegisteredUser, HARDCODED_ADMIN } from "@/context/AuthContext";
import { Product, SiteSettings } from "@/data/mockData";
import { SiteTexts } from "@/data/siteTexts";
import { SupportChat, ChatMessage } from "@/components/LiveChat";
import {
  Plus,
  Trash2,
  Package,
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
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  Globe,
  Info,
  RefreshCw,
  Crown
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user,
    isAdmin,
    registeredUsers,
    updateUserRole,
    updateUserPassword,
    deleteUser,
    hardResetSystem,
    settings,
    updateSettings,
    siteTexts,
    updateSiteTexts,
    products,
    addProduct,
    deleteProduct,
    refreshData,
  } = useAuth();

  // Top-Level State Definitions
  const [activeTab, setActiveTab] = useState<"products" | "users" | "chats" | "gui-texts" | "site-settings">("products");
  const [pageLoaded, setPageLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Şifre Göster/Gizle State'i (Kullanıcı ID -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Kullanıcı Detay İnceleme Modalı State'i
  const [inspectUser, setInspectUser] = useState<RegisteredUser | null>(null);

  // Kullanıcı Şifre Değiştirme Modalı State'i
  const [changePasswordUser, setChangePasswordUser] = useState<RegisteredUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Form States
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [textsForm, setTextsForm] = useState<SiteTexts>(siteTexts);

  // Canlı Destek Masası State'leri
  const [supportChats, setSupportChats] = useState<Record<string, SupportChat>>({});
  const [selectedChatEmail, setSelectedChatEmail] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

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
  const [newProductImages, setNewProductImages] = useState<string[]>([]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    if (siteTexts && settings) {
      setSiteForm(settings);
      setTextsForm(siteTexts);
    }
  }, [siteTexts, settings]);

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
    const interval = setInterval(loadSupportChats, 1200);
    const handleStorage = () => loadSupportChats();

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Early Return BEFORE any handlers or render
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-page-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">Erişim Engellendi</h1>
        <p className="text-xs text-[#7C6354]">
          Admin paneline erişebilmek için <strong>Yönetici (Admin)</strong> yetkisine sahip bir hesapla giriş yapmalısınız.
        </p>
        <Link
          href="/hesabim"
          className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition inline-block btn-press"
        >
          Giriş Yap (Admin Hesabı)
        </Link>
      </div>
    );
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    showNotify("Tüm kullanıcılar ve veriler güncellendi!");
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleHardReset = async () => {
    if (confirm("DİKKAT: Haktan Fetih Durmuş (chessvip11@gmail.com) hesabı haricindeki TÜM kullanıcı hesapları, test mesajları ve veriler sıfırlanacaktır. Emin misiniz?")) {
      await hardResetSystem();
      showNotify("Sistem ve tüm test hesapları sıfırlandı. Sadece Süper Admin kalındı!");
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    showNotify(`${label} panoya kopyalandı!`);
  };

  const handleDeleteUserAccount = (targetUser: RegisteredUser) => {
    if (targetUser.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
      alert("Ana Süper Admin hesabı silinemez!");
      return;
    }
    if (confirm(`${targetUser.name} (${targetUser.email}) kullanıcısını sistemden kalıcı olarak silmek istediğinize emin misiniz?`)) {
      deleteUser(targetUser.id);
      showNotify(`${targetUser.name} kullanıcısı silindi.`);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordUser || !newPasswordInput.trim()) return;

    updateUserPassword(changePasswordUser.id, newPasswordInput.trim());
    showNotify(`${changePasswordUser.name} kullanıcısının şifresi başarıyla güncellendi!`);
    setChangePasswordUser(null);
    setNewPasswordInput("");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Bu ürünü mağazadan silmek istediğinize emin misiniz?")) {
      deleteProduct(id);
      showNotify("Ürün mağazadan silindi.");
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    let catSlug = "bijuteri-taki";
    const catLower = (newProduct.category || "").toLowerCase();
    if (catLower.includes("hediyelik")) {
      catSlug = "hediyelik-esya";
    } else if (catLower.includes("oyuncak") || catLower.includes("squishy")) {
      catSlug = "trend-oyuncak-squishy";
    } else {
      catSlug = "bijuteri-taki";
    }

    const allImgs = newProductImages.length > 0 ? newProductImages : [newProduct.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"];

    const created: Product = {
      id: `prod-${Date.now()}`,
      title: newProduct.title || "Yeni Ürün",
      slug: (newProduct.title || "yeni-urun").toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4),
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category,
      categorySlug: catSlug,
      image: allImgs[0],
      images: allImgs,
      stock: Number(newProduct.stock),
      rating: 5.0,
      reviewCount: 1,
      variants: [],
      details: ["Otantikos Quality"]
    };

    addProduct(created);
    setIsModalOpen(false);
    setNewProductImages([]);
    showNotify("Yeni ürün mağazaya başarıyla eklendi ve tüm kullanıcılara yansıtıldı!");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteForm);
    updateSiteTexts(textsForm);
    showNotify("Metinler ve site ayarları kalıcı olarak kaydedildi ve yayına alındı!");
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

  // 1. Hayalet kullanıcıları temizle
  const validUsersList = registeredUsers.filter(
    (u) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
  );

  // 2. RÜTBE SIRALAMASI (Rank 1: Primary Super Admin -> Rank 2: Admins -> Rank 3: Customers newest first)
  const sortedUsersList = [...validUsersList].sort((a, b) => {
    const isAPrimary = a.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase();
    const isBPrimary = b.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase();
    if (isAPrimary) return -1;
    if (isBPrimary) return 1;

    const isAAdmin = a.role === "admin";
    const isBAdmin = b.role === "admin";
    if (isAAdmin && !isBAdmin) return -1;
    if (!isAAdmin && isBAdmin) return 1;

    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // 3. Filtreleme (Arama ve Rol Filtresi)
  const filteredUsersList = sortedUsersList.filter((u) => {
    const isPrimary = u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase();
    const isUserAdmin = u.role === "admin" || isPrimary;

    if (userRoleFilter === "admin" && !isUserAdmin) return false;
    if (userRoleFilter === "user" && isUserAdmin) return false;

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.password && u.password.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.ipAddress && u.ipAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeChat = selectedChatEmail ? supportChats[selectedChatEmail.toLowerCase()] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-page-in">
      
      {/* Toast Bildirim */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold animate-bounce border-2 border-white">
          <CheckCircle className="w-4 h-4" /> {notification}
        </div>
      )}

      {/* Üst Yönetici Başlığı ve İstatistik Kartları */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Yönetici Kontrol Paneli
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#3E2E28] mt-1">Site & Yetki Yönetim Merkezi</h1>
          </div>

          {/* Tab Menü Butonları & Yenile Butonu */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleManualRefresh}
              className={`p-2.5 bg-white border border-[#D8C7B5] hover:border-[#C86D51] text-[#3E2E28] rounded-full transition shadow-sm btn-press ${isRefreshing ? "animate-spin" : ""}`}
              title="Tüm Canlı Verileri Yenile"
            >
              <RefreshCw className="w-4 h-4 text-[#C86D51]" />
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 btn-press ${
                activeTab === "products" ? "bg-[#3E2E28] text-white shadow-md" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
              }`}
            >
              <Package className="w-4 h-4" /> Ürün Envanteri ({products.length})
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 btn-press ${
                activeTab === "users" ? "bg-[#3E2E28] text-white shadow-md" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
              }`}
            >
              <Users className="w-4 h-4 text-[#C86D51]" /> Kullanıcı Yönetimi ({validUsersList.length})
            </button>

            <button
              onClick={() => setActiveTab("chats")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 relative btn-press ${
                activeTab === "chats" ? "bg-[#3E2E28] text-white shadow-md" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Canlı Destek Masası
              {Object.keys(supportChats).length > 0 && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("gui-texts")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 btn-press ${
                activeTab === "gui-texts" ? "bg-[#3E2E28] text-white shadow-md" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
              }`}
            >
              <FileText className="w-4 h-4 text-[#C86D51]" /> Site Yazıları
            </button>

            <button
              onClick={() => setActiveTab("site-settings")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 btn-press ${
                activeTab === "site-settings" ? "bg-[#3E2E28] text-white shadow-md" : "bg-white text-[#3E2E28] border border-[#D8C7B5] hover:border-[#C86D51]"
              }`}
            >
              <Settings className="w-4 h-4" /> Ayarlar
            </button>
          </div>
        </div>

        {/* İstatistik Özet Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C86D51] to-[#E6A085] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#7C6354] uppercase font-bold tracking-wider">Toplam Ürün</span>
              <p className="font-serif text-xl font-bold text-[#3E2E28]">{products.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3E2E28] to-[#4A3B32] text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#7C6354] uppercase font-bold tracking-wider">Kayıtlı Kullanıcı</span>
              <p className="font-serif text-xl font-bold text-[#3E2E28]">{validUsersList.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#7C6354] uppercase font-bold tracking-wider">Canlı Destek</span>
              <p className="font-serif text-xl font-bold text-[#3E2E28]">{Object.keys(supportChats).length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#7C6354] uppercase font-bold tracking-wider">Veri Kalıcılığı</span>
              <p className="font-serif text-xs font-bold text-emerald-700">✓ Anlık Canlı Senkron</p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: ÜRÜN ENVENTARİ */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm overflow-hidden space-y-4 p-6 card-hover">
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
                className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-1.5 flex-shrink-0 btn-press"
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
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition btn-press"
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

      {/* TAB 2: DETAYLI KULLANICI YÖNETİM & RÜTBE SIRALAMALI KONTROL MERKEZİ */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6 card-hover">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3E2E28] flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" /> Rütbe Sıralamalı Kullanıcı Kontrol Masası
              </h3>
              <p className="text-xs text-[#7C6354] mt-1">
                Tüm kayıtlı kullanıcılar rütbe sırasına göre dizilmiştir (Süper Admin &rarr; Yöneticiler &rarr; Müşteriler).
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px] border border-amber-300">
                  Toplam Kayıtlı Kullanıcı: {validUsersList.length}
                </span>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 font-bold rounded-full text-[11px] border border-rose-300">
                  Yönetici (Admin): {validUsersList.filter(u => u.role === "admin" || u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()).length}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[11px] border border-emerald-300">
                  Müşteri: {validUsersList.filter(u => u.role !== "admin" && u.email.toLowerCase() !== HARDCODED_ADMIN.email.toLowerCase()).length}
                </span>
              </div>
            </div>

            {/* Arama ve Filtreleme Butonları */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="flex bg-[#F8F5F0] p-1 rounded-xl border border-[#E6DCD3] text-[11px] font-bold w-full sm:w-auto">
                <button
                  onClick={() => setUserRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === "all" ? "bg-white text-[#3E2E28] shadow-sm" : "text-[#7C6354]"}`}
                >
                  Tüm Rütbeler ({validUsersList.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter("admin")}
                  className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === "admin" ? "bg-white text-rose-800 shadow-sm" : "text-[#7C6354]"}`}
                >
                  👑 Yöneticiler ({validUsersList.filter(u => u.role === "admin" || u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()).length})
                </button>
                <button
                  onClick={() => setUserRoleFilter("user")}
                  className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === "user" ? "bg-white text-emerald-800 shadow-sm" : "text-[#7C6354]"}`}
                >
                  👤 Müşteriler ({validUsersList.filter(u => u.role !== "admin" && u.email.toLowerCase() !== HARDCODED_ADMIN.email.toLowerCase()).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="İsim, e-posta veya şifre ara..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                />
                <Search className="w-4 h-4 text-[#7C6354] absolute left-3 top-3" />
              </div>

              <button
                onClick={handleHardReset}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0 btn-press"
                title="Sadece Süper Admin kalacak şekilde tüm test hesaplarını ve verileri temizle"
              >
                <Trash2 className="w-4 h-4" /> Tüm Test Hesaplarını Sil
              </button>
            </div>
          </div>

          {/* Kullanıcılar Tablosu (RÜTBE SIRALAMALI) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3E2E28]">
              <thead className="bg-[#F8F5F0] text-[#7C6354] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DCD3]">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center">Sıra</th>
                  <th className="py-3.5 px-4">Kullanıcı Profil</th>
                  <th className="py-3.5 px-4">E-Posta Adresi</th>
                  <th className="py-3.5 px-4">Şifre (Aç / Gizle)</th>
                  <th className="py-3.5 px-4">Rütbe / Mevcut Rol</th>
                  <th className="py-3.5 px-4">Kayıt Tarihi & IP</th>
                  <th className="py-3.5 px-4 text-right">Yönetim İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD3]">
                {filteredUsersList.map((u, index) => {
                  const isPrimaryAdmin = u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase();
                  const isPassVisible = visiblePasswords[u.id];

                  return (
                    <tr
                      key={u.id}
                      className={`transition ${
                        isPrimaryAdmin
                          ? "bg-amber-50/60 hover:bg-amber-50 font-semibold"
                          : u.role === "admin"
                          ? "bg-rose-50/30 hover:bg-rose-50/50"
                          : "hover:bg-[#F8F5F0]/50"
                      }`}
                    >
                      {/* Sıra Numarası */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#7C6354] text-[11px]">
                        #{index + 1}
                      </td>

                      {/* Profil & İsim */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold font-serif text-sm shadow-sm ${
                              isPrimaryAdmin
                                ? "bg-gradient-to-br from-amber-600 to-orange-500"
                                : u.role === "admin"
                                ? "bg-gradient-to-br from-rose-600 to-pink-500"
                                : "bg-[#EAE0D5] text-[#C86D51]"
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#3E2E28] block flex items-center gap-1">
                              {isPrimaryAdmin && <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />}
                              {u.name}
                            </span>
                            <span className="text-[10px] text-[#7C6354] font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* E-Posta */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3E2E28]">{u.email}</td>

                      {/* Gerçek Şifre Alanı (Göster / Gizle) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono px-2 py-1 rounded border font-bold text-[11px] ${
                              isPrimaryAdmin
                                ? "bg-amber-100 text-amber-950 border-amber-300"
                                : "bg-[#F8F5F0] text-[#3E2E28] border-[#D8C7B5]"
                            }`}
                          >
                            {isPassVisible ? (u.password || "Parola Belirtilmedi") : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 hover:bg-[#EAE0D5] rounded transition text-[#7C6354]"
                            title="Şifreyi Göster / Gizle"
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5 text-rose-600" /> : <Eye className="w-3.5 h-3.5 text-[#C86D51]" />}
                          </button>
                          <button
                            onClick={() => handleCopyText(u.password || "", "Şifre")}
                            className="p-1 hover:bg-[#EAE0D5] rounded transition text-[#7C6354]"
                            title="Kopyala"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Rütbe / Mevcut Rol */}
                      <td className="py-3.5 px-4">
                        {isPrimaryAdmin ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-400 uppercase">
                            👑 Süper Admin / Kurucu
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            🛡️ Yönetici (Admin)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            👤 Müşteri
                          </span>
                        )}
                      </td>

                      {/* Kayıt Tarihi & IP */}
                      <td className="py-3.5 px-4">
                        <span className="block font-medium">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("tr-TR") : "Sistem Tanımlı"}
                        </span>
                        <span className="text-[10px] text-[#7C6354] font-mono block">
                          IP: {u.ipAddress || "185.190.140.22 (TR)"}
                        </span>
                      </td>

                      {/* Yönetim İşlemleri */}
                      <td className="py-3.5 px-4 text-right">
                        {isPrimaryAdmin ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-300">
                            Ana Geliştirici
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* İncele Modalı Butonu */}
                            <button
                              onClick={() => setInspectUser(u)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-[#3E2E28] rounded-lg transition text-xs font-semibold btn-press"
                              title="Kullanıcı Dosyasını İncele"
                            >
                              <Info className="w-3.5 h-3.5 text-[#C86D51]" />
                            </button>

                            {/* Şifre Değiştir Butonu */}
                            <button
                              onClick={() => {
                                setChangePasswordUser(u);
                                setNewPasswordInput(u.password || "");
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition text-xs font-semibold btn-press"
                              title="Şifre Değiştir"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                            </button>

                            {/* Yetki Değiştir Butonu */}
                            {u.role === "admin" ? (
                              <button
                                onClick={() => {
                                  updateUserRole(u.id, "user");
                                  showNotify(`${u.name} kullanıcısının admin yetkisi kaldırıldı.`);
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition text-xs font-semibold btn-press"
                                title="Admin Yetkisini Al"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  updateUserRole(u.id, "admin");
                                  showNotify(`${u.name} kullanıcısına Admin yetkisi verildi!`);
                                }}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs font-semibold shadow-sm btn-press"
                                title="Admin Yap (Yetkilendir)"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Sil Butonu */}
                            <button
                              onClick={() => handleDeleteUserAccount(u)}
                              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition text-xs font-semibold btn-press"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CANLI DESTEK MASASI */}
      {activeTab === "chats" && (
        <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6 card-hover">
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
                        className="px-4 py-2.5 bg-[#C86D51] text-white font-bold rounded-xl hover:bg-[#B05B41] disabled:opacity-50 transition shadow-sm text-xs flex items-center gap-1.5 btn-press"
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
              Henüz canlı destek talebi bulunmuyor.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TÜM SİTE YAZILARINI DÜZENLEME (GUI TEXTS - 100% EXHAUSTIVE FORM) */}
      {activeTab === "gui-texts" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6 card-hover">
          <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Tüm Ekranlardaki Görünür Metinler</h3>
              <p className="text-xs text-[#7C6354]">Metinleri değiştirip "Yazıları Kaydet"e bastığınızda değişiklikler diske yazılır ve tüm ziyaretçilere anında yansır.</p>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center gap-2 btn-press"
            >
              Yazıları Kaydet & Yayınla
            </button>
          </div>

          <div className="space-y-6 text-xs">
            {/* Header Metinleri */}
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3 border border-[#E6DCD3]">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Header (Üst Menü) Metinleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Duyuru Bandı Sol Metin</label>
                  <input
                    type="text"
                    value={textsForm.header?.topbarText || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, header: { ...textsForm.header, topbarText: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
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
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3 border border-[#E6DCD3]">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Hero (Ana Sayfa Giriş) Metinleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Ana Başlık (İlk Satır)</label>
                  <input
                    type="text"
                    value={textsForm.hero?.title || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, title: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vurgulu Başlık (Renkli Kısım)</label>
                  <input
                    type="text"
                    value={textsForm.hero?.highlightTitle || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, highlightTitle: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg font-bold text-[#C86D51]"
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
              <div>
                <label className="block font-semibold mb-1">Hero Buton Metni</label>
                <input
                  type="text"
                  value={textsForm.hero?.buttonText || ""}
                  onChange={(e) => setTextsForm({ ...textsForm, hero: { ...textsForm.hero, buttonText: e.target.value } })}
                  className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                />
              </div>
            </div>

            {/* Marka Hikayesi */}
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3 border border-[#E6DCD3]">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Marka Hikayesi (Ana Sayfa Alt Bölüm)</h4>
              <div>
                <label className="block font-semibold mb-1">Hikaye Başlığı</label>
                <input
                  type="text"
                  value={textsForm.brandStory?.title || ""}
                  onChange={(e) => setTextsForm({ ...textsForm, brandStory: { ...textsForm.brandStory, title: e.target.value } })}
                  className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Hikaye Metni / İçeriği</label>
                <textarea
                  rows={3}
                  value={textsForm.brandStory?.content || ""}
                  onChange={(e) => setTextsForm({ ...textsForm, brandStory: { ...textsForm.brandStory, content: e.target.value } })}
                  className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                />
              </div>
            </div>

            {/* Kategoriler ve Ürün Bölümü */}
            <div className="p-4 bg-[#F8F5F0] rounded-xl space-y-3 border border-[#E6DCD3]">
              <h4 className="font-serif font-bold text-sm text-[#3E2E28] border-b pb-2">Kategoriler & Ürün Bölümü Metinleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Kategoriler Bölüm Başlığı</label>
                  <input
                    type="text"
                    value={textsForm.categoriesSection?.title || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, categoriesSection: { ...textsForm.categoriesSection, title: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ürünler Bölüm Başlığı</label>
                  <input
                    type="text"
                    value={textsForm.productsSection?.title || ""}
                    onChange={(e) => setTextsForm({ ...textsForm, productsSection: { ...textsForm.productsSection, title: e.target.value } })}
                    className="w-full p-2.5 bg-white border border-[#D8C7B5] rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-lg btn-press"
              >
                Yazıları Kaydet & Yayınla
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: GENEL SİTE AYARLARI */}
      {activeTab === "site-settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm p-6 space-y-6 card-hover">
          <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-4">
            <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Genel Site Ayarları</h3>
            <button
              type="submit"
              className="px-6 py-3 bg-[#C86D51] text-white text-xs font-bold rounded-full hover:bg-[#B05B41] transition shadow-md btn-press"
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
                className="w-full p-2.5 bg-[#F8F5F0] border border-[#D8C7B5] rounded-lg font-bold"
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

      {/* MODAL 1: YENİ ÜRÜN MODALI */}
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
                <label className="block font-semibold mb-1 text-[#3E2E28]">
                  Ürün Görselleri (Çoklu Resim Seçin veya Ekleme Yapın)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            setNewProductImages((prev) => [...prev, reader.result as string]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C86D51] file:text-white hover:file:bg-[#B05B41] cursor-pointer"
                  />

                  {newProductImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 bg-[#F8F5F0] p-3 rounded-2xl border border-[#D8C7B5]">
                      {newProductImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E6DCD3]">
                          <img src={img} alt={`Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewProductImages(newProductImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="veya https://... web resmi ekleyin"
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) => {
                      if (e.target.value) {
                        setNewProduct({ ...newProduct, image: e.target.value });
                        if (!newProductImages.includes(e.target.value)) {
                          setNewProductImages((prev) => [...prev, e.target.value]);
                        }
                      }
                    }}
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
                  className="flex-1 py-3 bg-[#C86D51] text-white rounded-xl font-semibold hover:bg-[#B05B41] transition shadow-md"
                >
                  Kaydet & Mağazaya Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KULLANICI İNCELEME MODALI */}
      {inspectUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-[#E6DCD3] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#C86D51] text-white flex items-center justify-center font-bold font-serif">
                  {inspectUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3E2E28]">{inspectUser.name}</h3>
                  <span className="text-[10px] text-[#7C6354] font-mono">{inspectUser.id}</span>
                </div>
              </div>
              <button onClick={() => setInspectUser(null)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8F5F0] rounded-xl space-y-1.5 border border-[#E6DCD3]">
                <div className="flex justify-between">
                  <span className="text-[#7C6354] font-semibold">E-Posta:</span>
                  <span className="font-mono font-bold text-[#3E2E28]">{inspectUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7C6354] font-semibold">Şifre:</span>
                  <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {inspectUser.password || "Belirtilmedi"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C6354] font-semibold">Yetki Rolü:</span>
                  <span className="font-bold text-[#C86D51] uppercase">{inspectUser.role}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F5F0] rounded-xl space-y-1.5 border border-[#E6DCD3]">
                <div className="flex justify-between">
                  <span className="text-[#7C6354] font-semibold">Kayıt Tarihi:</span>
                  <span>{inspectUser.createdAt ? new Date(inspectUser.createdAt).toLocaleString("tr-TR") : "Sistem Tanımlı"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C6354] font-semibold">IP Adresi:</span>
                  <span className="font-mono font-bold">{inspectUser.ipAddress || "185.190.140.22 (TR)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C6354] font-semibold">Giriş Lokasyonu:</span>
                  <span>{inspectUser.lastLoginLocation || "Türkiye / İstanbul"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setChangePasswordUser(inspectUser);
                  setNewPasswordInput(inspectUser.password || "");
                  setInspectUser(null);
                }}
                className="flex-1 py-2.5 bg-amber-50 text-amber-900 font-bold rounded-xl hover:bg-amber-100 transition text-xs border border-amber-200 flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Şifreyi Sıfırla
              </button>
              <button
                onClick={() => setInspectUser(null)}
                className="flex-1 py-2.5 bg-[#3E2E28] text-white font-bold rounded-xl hover:bg-black transition text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ŞİFRE DEĞİŞTİRME MODALI */}
      {changePasswordUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E6DCD3]">
            <div className="flex justify-between items-center border-b border-[#E6DCD3] pb-3">
              <h3 className="font-serif font-bold text-base text-[#3E2E28] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" /> Şifre Değiştir: {changePasswordUser.name}
              </h3>
              <button onClick={() => setChangePasswordUser(null)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
              <p className="text-[#7C6354]">
                <strong>{changePasswordUser.email}</strong> kullanıcısı için yeni bir giriş şifresi belirleyin.
              </p>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Yeni Şifre</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 font-mono font-bold text-[#3E2E28] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordUser(null)}
                  className="flex-1 py-3 bg-gray-100 text-[#3E2E28] rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C86D51] text-white rounded-xl font-semibold hover:bg-[#B05B41] transition shadow-md"
                >
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
