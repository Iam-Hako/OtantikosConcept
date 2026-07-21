"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, HARDCODED_ADMIN } from "@/context/AuthContext";
import { User, Lock, Mail, ShieldAlert, LogOut, Package, ArrowRight } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, login, register, logout, isAdmin, siteTexts } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: "Lütfen tüm alanları doldurun.", type: "error" });
      return;
    }

    if (isLoginView) {
      const res = login(email, password);
      if (res.success) {
        setMessage({ text: "Başarıyla giriş yapıldı! Yönlendiriliyorsunuz...", type: "success" });
        setTimeout(() => {
          if (email.trim().toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
            router.push("/admin");
          }
        }, 1000);
      } else {
        setMessage({ text: res.error || "Giriş başarısız.", type: "error" });
      }
    } else {
      if (!name) {
        setMessage({ text: "Lütfen adınızı giriniz.", type: "error" });
        return;
      }
      const res = register(name, email, password);
      if (res.success) {
        setMessage({ text: "Hesabınız başarıyla oluşturuldu!", type: "success" });
      } else {
        setMessage({ text: res.error || "Kayıt olunamadı.", type: "error" });
      }
    }
  };

  // Eğer Kullanıcı Zaten Giriş Yapmışsa Hesabım Ekranını Göster
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        
        {/* Kullanıcı Karşılama Kartı */}
        <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#EAE0D5] text-[#C86D51] rounded-full flex items-center justify-center font-bold text-2xl font-serif">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">{user.name}</h1>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase">
                    {siteTexts?.accountPage?.adminBadge || "Yönetici / Admin"}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                    {siteTexts?.accountPage?.customerBadge || "Müşteri"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7C6354] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex-1 sm:flex-none px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> {siteTexts?.accountPage?.goToAdminButton || "Admin Paneline Git"}
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="flex-1 sm:flex-none px-5 py-3 bg-gray-100 text-[#3E2E28] text-xs font-semibold rounded-full hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-600" /> {siteTexts?.accountPage?.logoutButton || "Çıkış Yap"}
            </button>
          </div>
        </div>

        {/* Sipariş Geçmişi Alanı */}
        <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#3E2E28] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C86D51]" /> {siteTexts?.accountPage?.orderHistoryTitle || "Geçmiş Siparişleriniz"}
          </h2>
          <div className="p-6 bg-[#F8F5F0] rounded-2xl text-center space-y-2 border border-[#E6DCD3]">
            <p className="text-xs text-[#7C6354]">
              {siteTexts?.accountPage?.noOrdersMessage || "Henüz verilmiş bir siparişiniz bulunmamaktadır."}
            </p>
            <Link href="/urunler" className="text-xs font-bold text-[#C86D51] hover:underline inline-block pt-1">
              {siteTexts?.accountPage?.startShoppingLink || "Alışverişe Başla &rarr;"}
            </Link>
          </div>
        </div>

      </div>
    );
  }

  // Giriş Yap / Kayıt Ol Ekranı
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-xl space-y-6">
        
        {/* Başlık */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#EAE0D5] text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">
            {isLoginView
              ? (siteTexts?.accountPage?.loginTitle || "OtantikosConcept'e Giriş")
              : (siteTexts?.accountPage?.registerTitle || "Yeni Hesap Oluştur")}
          </h1>
          <p className="text-xs text-[#7C6354]">
            {isLoginView
              ? (siteTexts?.accountPage?.loginSub || "Siparişlerinizi takip etmek veya Admin Paneline girmek için giriş yapın.")
              : (siteTexts?.accountPage?.registerSub || "Trend oyuncak, squishy ve bijuteri fırsatlarından yararlanmak için kaydolun.")}
          </p>
        </div>

        {/* Tab Butonları */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8F5F0] p-1.5 rounded-2xl border border-[#E6DCD3]">
          <button
            onClick={() => {
              setIsLoginView(true);
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              isLoginView ? "bg-white text-[#3E2E28] shadow-sm" : "text-[#7C6354]"
            }`}
          >
            {siteTexts?.accountPage?.loginTab || "Giriş Yap"}
          </button>
          <button
            onClick={() => {
              setIsLoginView(false);
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              !isLoginView ? "bg-white text-[#3E2E28] shadow-sm" : "text-[#7C6354]"
            }`}
          >
            {siteTexts?.accountPage?.registerTab || "Kayıt Ol"}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 border rounded-xl text-xs text-center font-medium ${
              message.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Giriş / Kayıt Formu */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLoginView && (
            <div>
              <label className="block font-semibold text-[#3E2E28] mb-1">
                {siteTexts?.accountPage?.fullNameLabel || "Ad Soyad"}
              </label>
              <input
                type="text"
                required
                placeholder={siteTexts?.accountPage?.fullNamePlaceholder || "Örn: Ayşe Yılmaz"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#3E2E28] mb-1">
              {siteTexts?.accountPage?.emailLabel || "E-Posta Adresi"}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={siteTexts?.accountPage?.emailPlaceholder || "ornek@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
              />
              <Mail className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#3E2E28] mb-1">
              {siteTexts?.accountPage?.passwordLabel || "Şifre"}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder={siteTexts?.accountPage?.passwordPlaceholder || "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
              />
              <Lock className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md text-xs flex items-center justify-center gap-2"
          >
            <span>
              {isLoginView
                ? (siteTexts?.accountPage?.loginSubmitButton || "Giriş Yap")
                : (siteTexts?.accountPage?.registerSubmitButton || "Kayıt Ol & Hesabı Oluştur")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
