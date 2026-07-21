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

// Sabit Admin Hesabı Bilgileri
export const HARDCODED_ADMIN = {
  email: "admin@otantikosconcept.com",
  password: "OtantikosAdmin2026!#SecurePass",
  name: "Admin",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
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

      // Site ayarları yükle
      const savedSettings = localStorage.getItem("otantikos_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // Site yazıları yükle
      const savedSiteTexts = localStorage.getItem("otantikos_site_texts");
      if (savedSiteTexts) setSiteTexts(JSON.parse(savedSiteTexts));

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
        return { success: false, error: "Hatalı Admin şifresi girdiniz!" };
      }
    }

    // 2. Normal Kullanıcı Girişi
    const normalUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split("@")[0],
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setUser(normalUser);
    localStorage.setItem("otantikos_user", JSON.stringify(normalUser));
    return { success: true };
  };

  const register = (nameInput: string, emailInput: string, passInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
      return { success: false, error: "Bu e-posta adresi yöneticiye ait özel adrestir." };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: nameInput,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem("otantikos_user", JSON.stringify(newUser));
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
