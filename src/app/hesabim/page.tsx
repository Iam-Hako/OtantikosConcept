"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, HARDCODED_ADMIN } from "@/context/AuthContext";
import { User, Lock, Mail, ShieldAlert, LogOut, Package, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, login, register, loginWithGoogle, logout, isAdmin, siteTexts } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // 2FA (E-Posta Doğrulama Kodu) State'leri
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    code: string;
    targetEmail: string;
    isLogin: boolean;
  }>({
    isOpen: false,
    code: "",
    targetEmail: "",
    isLogin: true,
  });
  const [inputCode, setInputCode] = useState("");

  // Google Giriş Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: "Lütfen tüm alanları doldurun.", type: "error" });
      return;
    }

    if (!isLoginView && !name) {
      setMessage({ text: "Lütfen adınızı giriniz.", type: "error" });
      return;
    }

    // Sabit Admin Girişi Doğrulaması
    if (isLoginView && email.trim().toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
      if (password !== HARDCODED_ADMIN.password) {
        setMessage({ text: "Hatalı yönetici şifresi girdiniz!", type: "error" });
        return;
      }
    }

    // 6 Haneli E-Posta Güvenlik Kodu Üret (destek@otantikosconcept.com simülasyonu)
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationModal({
      isOpen: true,
      code: generatedCode,
      targetEmail: email.trim(),
      isLogin: isLoginView,
    });
  };

  // Doğrulama Kodunu Onayla ve Giriş/Kayıt İşlemini Tamamla
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() !== verificationModal.code) {
      setMessage({ text: "Girdiğiniz doğrulama kodu hatalı! Lütfen tekrar deneyin.", type: "error" });
      return;
    }

    setVerificationModal({ ...verificationModal, isOpen: false });
    setInputCode("");

    if (verificationModal.isLogin) {
      const res = login(email, password);
      if (res.success) {
        setMessage({ text: "Doğrulama başarılı! Giriş yapılıyor...", type: "success" });
        setTimeout(() => {
          if (email.trim().toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
            router.push("/admin");
          }
        }, 800);
      } else {
        setMessage({ text: res.error || "Giriş başarısız.", type: "error" });
      }
    } else {
      const res = register(name, email, password);
      if (res.success) {
        setMessage({ text: "Hesabınız doğrulandı ve oluşturuldu!", type: "success" });
      } else {
        setMessage({ text: res.error || "Kayıt olunamadı.", type: "error" });
      }
    }
  };

  const handleGoogleSelect = (gName: string, gEmail: string) => {
    setShowGoogleModal(false);
    loginWithGoogle(gName, gEmail);
    setMessage({ text: `Google ile giriş yapıldı: ${gName}`, type: "success" });
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
    <div className="max-w-md mx-auto px-4 py-16 relative">
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
              : (siteTexts?.accountPage?.registerSub || "Güvenli alışveriş ve fırsatlardan yararlanmak için kaydolun.")}
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

        {/* Google ile Giriş Yap Butonu */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-3 bg-white border border-[#D8C7B5] hover:bg-[#F8F5F0] text-[#3E2E28] font-bold text-xs rounded-full transition shadow-sm flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google ile Giriş Yap</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-[#7C6354]">
          <span className="flex-1 h-px bg-[#E6DCD3]"></span>
          <span>veya e-posta ile</span>
          <span className="flex-1 h-px bg-[#E6DCD3]"></span>
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
                ? (siteTexts?.accountPage?.loginSubmitButton || "Doğrulama Kodu Gönder & Giriş Yap")
                : (siteTexts?.accountPage?.registerSubmitButton || "Doğrulama Kodu Gönder & Kaydol")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Google Hesap Seçme Simülasyon Modalı */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <span className="font-serif font-bold text-sm text-[#3E2E28]">Google İle Oturum Aç</span>
              <button onClick={() => setShowGoogleModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-xs text-[#7C6354]">OtantikosConcept ile devam etmek için Google hesabınızı seçiniz:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSelect("Müşteri Kullanıcı", "musteri@gmail.com")}
                className="w-full p-3 bg-[#F8F5F0] hover:bg-[#EAE0D5] rounded-2xl flex items-center gap-3 text-left transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">M</div>
                <div>
                  <h4 className="font-bold text-xs text-[#3E2E28]">Müşteri Kullanıcı</h4>
                  <span className="text-[10px] text-[#7C6354]">musteri@gmail.com</span>
                </div>
              </button>
              <button
                onClick={() => handleGoogleSelect("Yönetici Admin", "admin@otantikosconcept.com")}
                className="w-full p-3 bg-[#F8F5F0] hover:bg-[#EAE0D5] rounded-2xl flex items-center gap-3 text-left transition"
              >
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">A</div>
                <div>
                  <h4 className="font-bold text-xs text-[#3E2E28]">Yönetici Admin</h4>
                  <span className="text-[10px] text-[#7C6354]">admin@otantikosconcept.com</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA E-Posta Doğrulama Kodu Modalı */}
      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6DCD3] animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#C86D51]/10 text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#C86D51]/30">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#3E2E28]">E-Posta Güvenlik Kodu</h2>
              <p className="text-xs text-[#7C6354] leading-relaxed">
                <strong>destek@otantikosconcept.com</strong> tarafından <u>{verificationModal.targetEmail}</u> adresinize gönderilen 6 haneli doğrulama kodunu giriniz.
              </p>
            </div>

            {/* Simüle Edilmiş E-posta Gelen Kutusu Bildirimi */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> [E-Posta Bildirimi Simülasyonu]
              </span>
              <p className="text-[11px] font-mono bg-white p-2 rounded-xl border border-emerald-200 text-center font-bold tracking-widest text-emerald-900">
                Kodunuz: <span className="text-[#C86D51] text-sm">{verificationModal.code}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3E2E28] mb-1 text-center">Doğrulama Kodu</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6 Haneli Kod"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 text-center text-lg font-mono font-bold tracking-widest text-[#3E2E28] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationModal({ ...verificationModal, isOpen: false })}
                  className="flex-1 py-3 bg-gray-100 text-[#3E2E28] font-bold rounded-full hover:bg-gray-200 transition"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C86D51] text-white font-bold rounded-full hover:bg-[#B05B41] transition shadow-md"
                >
                  Doğrula & Tamamla
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
