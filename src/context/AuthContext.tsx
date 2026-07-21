"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, SiteSettings, DEFAULT_SITE_SETTINGS, Product } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  siteTexts: SiteTexts;
  updateSiteTexts: (newTexts: SiteTexts) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (product: Product) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

// Sabit Admin Hesabı Bilgileri
export const HARDCODED_ADMIN = {
  email: "admin@otantikosconcept.com",
  password: "OtantikosAdmin2026!#SecurePass",
  name: "Admin",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [siteTexts, setSiteTexts] = useState<SiteTexts>(DEFAULT_SITE_TEXTS);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Kayıtlı oturum varsa yükle
      const savedUser = localStorage.getItem("otantikos_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Kayıtlı tüm kullanıcıları yükle
      const savedRegUsers = localStorage.getItem("otantikos_registered_users");
      if (savedRegUsers) {
        setRegisteredUsers(JSON.parse(savedRegUsers));
      }

      // Site ayarları yükle
      const savedSettings = localStorage.getItem("otantikos_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.heroDescription?.includes("NeeDoh") || parsed.siteSubtitle?.includes("Specialist") || parsed.heroTitle?.includes("Trend Oyuncaklar")) {
          setSettings(DEFAULT_SITE_SETTINGS);
          localStorage.setItem("otantikos_settings", JSON.stringify(DEFAULT_SITE_SETTINGS));
        } else {
          setSettings(parsed);
        }
      } else {
        setSettings(DEFAULT_SITE_SETTINGS);
      }

      // Site yazıları yükle
      const savedSiteTexts = localStorage.getItem("otantikos_site_texts");
      if (savedSiteTexts) {
        const parsed = JSON.parse(savedSiteTexts);
        if (parsed.hero?.description?.includes("NeeDoh") || parsed.hero?.title?.includes("Trend Oyuncaklar")) {
          setSiteTexts(DEFAULT_SITE_TEXTS);
          localStorage.setItem("otantikos_site_texts", JSON.stringify(DEFAULT_SITE_TEXTS));
        } else {
          setSiteTexts(parsed);
        }
      } else {
        setSiteTexts(DEFAULT_SITE_TEXTS);
      }

      // Ürünleri yükle
      const savedProducts = localStorage.getItem("otantikos_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    } catch (e) {
      console.error("AuthContext loading error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (emailInput: string, passInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    // 1. Sabit Admin Hesabı Kontrolü
    if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
      if (passInput === HARDCODED_ADMIN.password) {
        const adminUser: UserProfile = {
          id: "usr-admin-primary",
          email: HARDCODED_ADMIN.email,
          name: HARDCODED_ADMIN.name,
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        localStorage.setItem("otantikos_user", JSON.stringify(adminUser));
        return { success: true };
      } else {
        return { success: false, error: "Hatalı yönetici şifresi girdiniz!" };
      }
    }

    // 2. Kayıtlı Normal Kullanıcı Kontrolü
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!foundUser) {
      return {
        success: false,
        error: "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı! Lütfen önce Kayıt Olun.",
      };
    }

    // Şifre Doğrulama
    if (foundUser.password !== passInput) {
      return {
        success: false,
        error: "Hatalı şifre girdiniz! Lütfen şifrenizi kontrol edip tekrar deneyin.",
      };
    }

    // Şifre Doğru - Oturum Aç
    const userProfile: UserProfile = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };

    setUser(userProfile);
    localStorage.setItem("otantikos_user", JSON.stringify(userProfile));
    return { success: true };
  };

  const register = (nameInput: string, emailInput: string, passInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!nameInput.trim()) {
      return { success: false, error: "Lütfen ad ve soyadınızı giriniz." };
    }

    if (!cleanEmail.includes("@")) {
      return { success: false, error: "Geçerli bir e-posta adresi giriniz." };
    }

    if (!passInput || passInput.length < 4) {
      return { success: false, error: "Şifreniz en az 4 karakter olmalıdır." };
    }

    if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
      return {
        success: false,
        error: "Bu e-posta adresi yöneticiye ait özel adrestir. Lütfen Giriş Yap sekmesinden giriş yapın.",
      };
    }

    // E-posta adresi daha önce kayıt olmuş mu?
    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        error: "Bu e-posta adresi ile zaten bir hesap oluşturulmuş! Lütfen Giriş Yapın.",
      };
    }

    // Yeni Kullanıcı Oluştur ve Veritabanına (localStorage) Kaydet
    const newUserRecord: RegisteredUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      password: passInput,
      name: nameInput.trim(),
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...registeredUsers, newUserRecord];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("otantikos_registered_users", JSON.stringify(updatedUsers));

    // Yeni Kullanıcı Oturumunu Başlat
    const userProfile: UserProfile = {
      id: newUserRecord.id,
      email: newUserRecord.email,
      name: newUserRecord.name,
      role: newUserRecord.role,
      createdAt: newUserRecord.createdAt,
    };

    setUser(userProfile);
    localStorage.setItem("otantikos_user", JSON.stringify(userProfile));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("otantikos_user");
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem("otantikos_settings", JSON.stringify(newSettings));
  };

  const updateSiteTexts = (newTexts: SiteTexts) => {
    setSiteTexts(newTexts);
    localStorage.setItem("otantikos_site_texts", JSON.stringify(newTexts));
  };

  const addProduct = (prod: Product) => {
    const updated = [prod, ...products];
    setProducts(updated);
    localStorage.setItem("otantikos_products", JSON.stringify(updated));
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("otantikos_products", JSON.stringify(updated));
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducts(updated);
    localStorage.setItem("otantikos_products", JSON.stringify(updated));
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin,
        settings,
        updateSettings,
        siteTexts,
        updateSiteTexts,
        products,
        addProduct,
        deleteProduct,
        updateProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
