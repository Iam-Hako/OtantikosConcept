"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, HARDCODED_ADMIN } from "@/context/AuthContext";
import { User, Lock, Mail, ShieldAlert, LogOut, Package, ArrowRight, Loader2 } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, registeredUsers, login, register, loginWithGoogle, logout, isAdmin, siteTexts } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google Identity Services SDK Yükle
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

  // Google Hash Parametrelerinden Dönüş Kontrolü
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

  // Google Giriş / Kayıt İşlemi (1-Tık Otomatik Mantık)
  const handleGoogleSuccess = (googleName: string, googleEmail: string) => {
    try {
      if (!googleEmail) return;
      const cleanEmail = googleEmail.trim().toLowerCase();
      const finalName = googleName?.trim() || cleanEmail.split("@")[0];

      // Eğer kullanıcı zaten kayıtlıysa mevcut hesaba anında giriş yapar,
      // kayıtlı değilse Google ad ve e-postasıyla hesabı anında oluşturup giriş yapar!
      const res = loginWithGoogle(finalName, cleanEmail);
      if (res.success) {
        setMessage({ text: "Google ile giriş başarılı! Yönlendiriliyorsunuz...", type: "success" });
        if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
          setTimeout(() => router.push("/admin"), 500);
        }
      } else {
        setMessage({ text: "Google ile giriş tamamlanamadı.", type: "error" });
      }
    } catch (err) {
      console.error("Google Success Processing Error:", err);
      setMessage({ text: "Google ile giriş sırasında bir hata oluştu.", type: "error" });
    }
  };

  // E-Posta ile Giriş / Kayıt Formu
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
      // Kayıt Olma
      if (!name.trim()) {
        setMessage({ text: "Lütfen adınızı ve soyadınızı giriniz.", type: "error" });
        return;
      }

      const existing = (registeredUsers || []).find((u) => u?.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setMessage({ text: "Bu e-posta adresi ile zaten kayıtlı bir hesap var! Lütfen giriş yapın.", type: "error" });
        return;
      }

      const regRes = await register(name.trim(), cleanEmail, password);
      if (regRes.success) {
        setMessage({ text: "Hesabınız başarıyla oluşturuldu! Hoş geldiniz!", type: "success" });
        if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
          setTimeout(() => router.push("/admin"), 600);
        }
      } else {
        setMessage({ text: regRes.error || "Kayıt tamamlanamadı.", type: "error" });
      }
    }
  };

  // Google Pop-up Tıklama (FedCM Hatasız Temiz GIS OAuth2 Akışı)
  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "766304598844-equfq1204ln5mtjqdc5hk53prunqnc2m.apps.googleusercontent.com";

    if (typeof window !== "undefined" && (window as any).google && (window as any).google.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile",
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data && data.email) {
                    handleGoogleSuccess(data.name || "", data.email);
                  }
                })
                .catch((err) => console.error("Google userinfo fetch error:", err));
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.error("Google OAuth2 GIS Error:", err);
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

  // Giriş Yapılmışsa Hesabım Ekranı
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-page-in">
        <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C86D51] to-[#E6A085] text-white rounded-full flex items-center justify-center font-bold text-2xl font-serif shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">{user.name}</h1>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase">
                    {siteTexts?.accountPage?.adminBadge || "Yönetici"}
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
                className="flex-1 sm:flex-none px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center justify-center gap-2 btn-press"
              >
                <ShieldAlert className="w-4 h-4" /> Admin Paneli
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="flex-1 sm:flex-none px-5 py-3 bg-gray-100 text-[#3E2E28] text-xs font-semibold rounded-full hover:bg-gray-200 transition flex items-center justify-center gap-2 btn-press"
            >
              <LogOut className="w-4 h-4 text-rose-600" /> Çıkış Yap
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-sm space-y-4 card-hover">
          <h2 className="font-serif text-xl font-bold text-[#3E2E28] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C86D51]" /> {siteTexts?.accountPage?.orderHistoryTitle || "Geçmiş Siparişleriniz"}
          </h2>
          <div className="p-6 bg-[#F8F5F0] rounded-2xl text-center space-y-2 border border-[#E6DCD3]">
            <p className="text-xs text-[#7C6354]">
              {siteTexts?.accountPage?.noOrdersMessage || "Henüz verilmiş bir siparişiniz bulunmamaktadır."}
            </p>
            <Link href="/urunler" className="text-xs font-bold text-[#C86D51] hover:underline inline-block pt-1">
              Alışverişe Başla &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Giriş / Kayıt Formu
  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-page-in">
      <div className="bg-white p-8 rounded-3xl border border-[#E6DCD3] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#EAE0D5] text-[#C86D51] rounded-full flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3E2E28]">
            {isLoginView
              ? (siteTexts?.accountPage?.loginTitle || "Giriş Yap")
              : (siteTexts?.accountPage?.registerTitle || "Yeni Hesap Oluştur")}
          </h1>
          <p className="text-xs text-[#7C6354]">
            {isLoginView
              ? (siteTexts?.accountPage?.loginSub || "Hesabınıza giriş yapın.")
              : (siteTexts?.accountPage?.registerSub || "Hesap oluşturun ve alışverişe başlayın.")}
          </p>
        </div>

        {/* Tab Butonları */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8F5F0] p-1.5 rounded-2xl border border-[#E6DCD3]">
          <button
            onClick={() => { setIsLoginView(true); setMessage(null); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${isLoginView ? "bg-white text-[#3E2E28] shadow-sm" : "text-[#7C6354]"}`}
          >
            {siteTexts?.accountPage?.loginTab || "Giriş Yap"}
          </button>
          <button
            onClick={() => { setIsLoginView(false); setMessage(null); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${!isLoginView ? "bg-white text-[#3E2E28] shadow-sm" : "text-[#7C6354]"}`}
          >
            {siteTexts?.accountPage?.registerTab || "Kayıt Ol"}
          </button>
        </div>

        {/* Google ile Giriş */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-3.5 bg-white border border-[#D8C7B5] hover:bg-[#F8F5F0] text-[#3E2E28] font-bold text-xs rounded-full transition shadow-sm flex items-center justify-center gap-3 group btn-press"
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
          <div className={`p-3 border rounded-xl text-xs text-center font-medium ${message.type === "error" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
            {message.text}
          </div>
        )}

        {/* Giriş / Kayıt Formu */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLoginView && (
            <div>
              <label className="block font-semibold text-[#3E2E28] mb-1">Ad Soyad</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Adınız ve Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30"
                />
                <User className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
              </div>
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
                placeholder="E-Posta Adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30"
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
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30"
              />
              <Lock className="w-4 h-4 text-[#7C6354] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] disabled:opacity-70 transition shadow-md text-xs flex items-center justify-center gap-2 btn-press"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <span>
                  {isLoginView
                    ? (siteTexts?.accountPage?.loginSubmitButton || "Giriş Yap")
                    : (siteTexts?.accountPage?.registerSubmitButton || "Kayıt Ol & Hesabı Oluştur")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
