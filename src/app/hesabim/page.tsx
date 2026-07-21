"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, HARDCODED_ADMIN } from "@/context/AuthContext";
import { User, Lock, Mail, ShieldAlert, LogOut, Package, ArrowRight, KeyRound, Loader2, Edit3 } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, registeredUsers, login, register, loginWithGoogle, logout, isAdmin, siteTexts } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA (Gerçek E-Posta Doğrulama Kodu) State'leri
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    targetEmail: string;
    isLogin: boolean;
  }>({
    isOpen: false,
    targetEmail: "",
    isLogin: true,
  });
  const [inputCode, setInputCode] = useState("");

  // Kullanıcı Adı Belirleme Aşaması State'i (Kaydolurken Son Aşama)
  const [pendingDisplayNameCompletion, setPendingDisplayNameCompletion] = useState<{
    email: string;
    isGoogle: boolean;
    defaultName: string;
    password?: string;
  } | null>(null);
  const [customDisplayName, setCustomDisplayName] = useState("");

  // Google Identity Services SDK Yükle (resmi Google penceresi için)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Google Popup'tan veya Hash Parametrelerinden Dönüş Kontrolü
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      if (accessToken) {
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.email) {
              handleGoogleSuccess(data.name || "", data.email);
            }
          })
          .catch((err) => console.error("Google userinfo fetch error:", err));
      }
    }
  }, [registeredUsers]);

  // Google Giriş Başarılı Olduğunda (Güvenli Null-Check)
  const handleGoogleSuccess = (googleName: string, googleEmail: string) => {
    try {
      if (!googleEmail) return;
      const cleanEmail = googleEmail.trim().toLowerCase();

      // Bu email ile kayıtlı hesap zaten var mı?
      const existing = (registeredUsers || []).find((u) => u?.email && u.email.toLowerCase() === cleanEmail);

      if (existing) {
        loginWithGoogle(existing.name || googleName || "Google Kullanıcısı", cleanEmail);
        setMessage({ text: "Giriş başarılı! Yönlendiriliyorsunuz...", type: "success" });
        if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
          setTimeout(() => router.push("/admin"), 600);
        }
      } else {
        setPendingDisplayNameCompletion({
          email: cleanEmail,
          isGoogle: true,
          defaultName: cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? HARDCODED_ADMIN.name : (googleName || "Google Kullanıcısı"),
        });
        setCustomDisplayName(cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? HARDCODED_ADMIN.name : (googleName || "Google Kullanıcısı"));
      }
    } catch (err) {
      console.error("Google Success Processing Error:", err);
    }
  };

  // Doğrudan E-Posta ile Giriş / Kayıt Ol (OTP Şimdilik Devre Dışı)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: "Lütfen e-posta adresinizi ve şifrenizi giriniz.", type: "error" });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isLoginView) {
      // Doğrudan Giriş Yap
      const loginRes = login(cleanEmail, password);
      if (loginRes.success) {
        setMessage({ text: "Giriş başarılı! Yönlendiriliyorsunuz...", type: "success" });
        if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
          setTimeout(() => router.push("/admin"), 600);
        }
      } else {
        setMessage({ text: loginRes.error || "Giriş yapılamadı.", type: "error" });
      }
    } else {
      // Kayıt Olma İşlemi
      const existing = (registeredUsers || []).find((u) => u?.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setMessage({ text: "Bu e-posta adresi ile zaten kayıtlı bir hesap var! Lütfen giriş yapın.", type: "error" });
        return;
      }

      setPendingDisplayNameCompletion({
        email: cleanEmail,
        isGoogle: false,
        defaultName: name || "",
        password: password,
      });
      setCustomDisplayName(name || "");
    }
  };

  // E-Posta Doğrulama Kodunu Sunucuda Doğrula
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!inputCode || inputCode.length !== 6) {
      setMessage({ text: "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationModal.targetEmail, code: inputCode }),
      });

      const data = await res.json();

      if (data.success) {
        setVerificationModal({ ...verificationModal, isOpen: false });
        setInputCode("");

        if (verificationModal.isLogin) {
          // Giriş Yapma Doğrulaması
          const loginRes = login(email, password);
          if (loginRes.success) {
            setMessage({ text: "E-posta doğrulandı, giriş yapılıyor...", type: "success" });
            if (email.trim().toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
              setTimeout(() => router.push("/admin"), 800);
            }
          } else {
            setMessage({ text: loginRes.error || "Giriş yapılamadı.", type: "error" });
          }
        } else {
          // Kayıt Olma Doğrulaması -> Kullanıcı adını belirlemek için son aşamaya geç
          setPendingDisplayNameCompletion({
            email: email.trim().toLowerCase(),
            isGoogle: false,
            defaultName: "",
            password: password,
          });
          setCustomDisplayName("");
        }
      } else {
        setMessage({ text: data.error || "Girdiğiniz doğrulama kodu geçersiz.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Doğrulama işlemi sırasında hata oluştu.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı Adı Son Aşama Tamamlama
  const handleCompleteDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDisplayNameCompletion) return;

    const { email: finalEmail, isGoogle, password: finalPassword } = pendingDisplayNameCompletion;
    const finalName = customDisplayName.trim();

    if (!finalName) {
      setMessage({ text: "Lütfen sitede görünecek adınızı ve soyadınızı yazın.", type: "error" });
      return;
    }

    if (isGoogle) {
      loginWithGoogle(finalName, finalEmail);
      setMessage({ text: "Kaydınız Google ile başarıyla tamamlandı!", type: "success" });
    } else {
      const regRes = register(finalName, finalEmail, finalPassword || "");
      if (regRes.success) {
        setMessage({ text: "Hesabınız başarıyla oluşturuldu!", type: "success" });
      } else {
        setMessage({ text: regRes.error || "Kayıt tamamlanamadı.", type: "error" });
        return;
      }
    }

    setPendingDisplayNameCompletion(null);
    if (finalEmail.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
      setTimeout(() => router.push("/admin"), 800);
    }
  };

  // Doğrudan Orijinal Google Pop-up Penceresini Tetikle (accounts.google.com)
  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "766304598844-equfq1204ln5mtjqdc5hk53prunqnc2m.apps.googleusercontent.com";

    if (typeof window !== "undefined" && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const base64Url = response.credential.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);
              handleGoogleSuccess(payload.name || "", payload.email);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
        return;
      } catch (err) {
        console.error("Google GIS Error:", err);
      }
    }

    const width = 520;
    const height = 630;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&scope=email%20profile&redirect_uri=${encodeURIComponent(
        window.location.origin + "/hesabim"
      )}`,
      "GoogleOauthPopup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
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

  // SON AŞAMA: KULLANICI ADI BELİRLEME EKRANI
  if (pendingDisplayNameCompletion) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#C86D51]/10 text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2">
              <Edit3 className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">Profil Adınızı Belirleyin</h1>
            <p className="text-xs text-[#7C6354]">
              Doğrulama başarılı! Son adım olarak sitede ve siparişlerinizde görünecek adınızı onaylayın.
            </p>
          </div>

          <form onSubmit={handleCompleteDisplayName} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#3E2E28] mb-1">Adınız Soyadınız</label>
              <input
                type="text"
                required
                placeholder="Ad Soyad"
                value={customDisplayName}
                onChange={(e) => setCustomDisplayName(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C86D51] font-bold text-[#3E2E28]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md text-xs flex items-center justify-center gap-2"
            >
              <span>Hesabı Tamamla & Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
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

        {/* Orijinal Google ile Giriş Yap Butonu */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-3.5 bg-white border border-[#D8C7B5] hover:bg-[#F8F5F0] text-[#3E2E28] font-bold text-xs rounded-full transition shadow-sm flex items-center justify-center gap-3 group"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
          <div>
            <label className="block font-semibold text-[#3E2E28] mb-1">
              {siteTexts?.accountPage?.emailLabel || "E-Posta Adresi"}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="E-Posta Adresiniz"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
              />
              <Lock className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] disabled:opacity-70 transition shadow-md text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>E-Posta Gönderiliyor...</span>
              </>
            ) : (
              <>
                <span>
                  {isLoginView
                    ? (siteTexts?.accountPage?.loginSubmitButton || "Doğrulama Kodu Gönder & Giriş Yap")
                    : (siteTexts?.accountPage?.registerSubmitButton || "Doğrulama Kodu Gönder & Kaydol")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* GERÇEK 2FA E-POSTA DOĞRULAMA MODALI */}
      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6DCD3] animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#C86D51]/10 text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#C86D51]/30">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#3E2E28]">E-Posta Güvenlik Doğrulaması</h2>
              <p className="text-xs text-[#7C6354] leading-relaxed">
                <strong className="text-[#C86D51]">destek@otantikosconcept.com</strong> adresimizden <u className="text-[#3E2E28] font-semibold">{verificationModal.targetEmail}</u> e-posta kutunuza 6 haneli doğrulama kodunuz iletilmiştir.
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                Lütfen e-posta kutunuzu (Spam/Gelen kutusu) kontrol edip gelen 6 haneli kodu aşağıya giriniz.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3E2E28] mb-1 text-center">Doğrulama Kodunu Giriniz</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6 Haneli Kod"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 text-center text-xl font-mono font-bold tracking-widest text-[#3E2E28] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationModal({ ...verificationModal, isOpen: false })}
                  className="flex-1 py-3 bg-gray-100 text-[#3E2E28] font-bold rounded-full hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#C86D51] text-white font-bold rounded-full hover:bg-[#B05B41] disabled:opacity-70 transition shadow-md flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Doğrula & Devam Et</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
