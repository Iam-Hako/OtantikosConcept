"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, SiteSettings, INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  loginWithGoogle: (name: string, email: string) => { success: boolean };
  updateUserRole: (userId: string, role: "admin" | "user") => void;
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
  email: "chessvip11@gmail.com",
  password: "32843284FF",
  name: "Haktan Fetih Durmuş",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [siteTexts, setSiteTexts] = useState<SiteTexts>(DEFAULT_SITE_TEXTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global Sunucu Verisini Çek ve Senkronize Et
  const fetchGlobalData = async () => {
    try {
      const res = await fetch("/api/site-data");
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.products && data.data.products.length > 0) {
          setProducts(data.data.products);
        }
        if (data.data.siteTexts) {
          setSiteTexts(data.data.siteTexts);
        }
        if (data.data.siteSettings) {
          setSettings(data.data.siteSettings);
        }
        if (data.data.registeredUsers && data.data.registeredUsers.length > 0) {
          setRegisteredUsers(data.data.registeredUsers);
        }
      }
    } catch (err) {
      console.error("Global data fetch error:", err);
    }
  };

  const syncGlobal = async (action: string, payload: any) => {
    try {
      await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
    } catch (err) {
      console.error("Global sync error:", err);
    }
  };

  useEffect(() => {
    try {
      fetchGlobalData();
      const interval = setInterval(fetchGlobalData, 3000);

      const savedUser = localStorage.getItem("otantikos_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.email?.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
          const freshAdmin: UserProfile = {
            id: "usr-admin-primary",
            email: HARDCODED_ADMIN.email,
            name: HARDCODED_ADMIN.name,
            role: "admin",
            createdAt: parsedUser.createdAt || new Date().toISOString(),
          };
          setUser(freshAdmin);
          localStorage.setItem("otantikos_user", JSON.stringify(freshAdmin));
        } else {
          setUser(parsedUser);
        }
      }
      return () => clearInterval(interval);
    } catch (e) {
      console.error("AuthContext loading error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (emailInput: string, passInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    // 1. Yönetici Hesabı Kontrolü
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

    if (foundUser.password !== passInput) {
      return {
        success: false,
        error: "Hatalı şifre girdiniz! Lütfen şifrenizi kontrol edip tekrar deneyin.",
      };
    }

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

    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        error: "Bu e-posta adresi ile zaten bir hesap oluşturulmuş! Lütfen Giriş Yapın.",
      };
    }

    const newUserRecord: RegisteredUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      password: passInput,
      name: nameInput.trim(),
      role: cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? "admin" : "user",
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...registeredUsers, newUserRecord];
    setRegisteredUsers(updatedUsers);
    syncGlobal("register-user", newUserRecord);

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
    syncGlobal("update-settings", newSettings);
  };

  const updateSiteTexts = (newTexts: SiteTexts) => {
    setSiteTexts(newTexts);
    syncGlobal("update-texts", newTexts);
  };

  const addProduct = (prod: Product) => {
    const updated = [prod, ...products];
    setProducts(updated);
    syncGlobal("update-products", updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    syncGlobal("update-products", updated);
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducts(updated);
    syncGlobal("update-products", updated);
  };

  const updateUserRole = (userId: string, newRole: "admin" | "user") => {
    const updated = registeredUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setRegisteredUsers(updated);
    syncGlobal("update-user-role", { userId, role: newRole });

    if (user && user.id === userId) {
      const updatedProfile: UserProfile = { ...user, role: newRole };
      setUser(updatedProfile);
      localStorage.setItem("otantikos_user", JSON.stringify(updatedProfile));
    }
  };

  const loginWithGoogle = (name: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    let userRole: "admin" | "user" = cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? "admin" : "user";
    let displayName = cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? HARDCODED_ADMIN.name : name;

    if (existing) {
      userRole = existing.role;
      if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
        displayName = HARDCODED_ADMIN.name;
      } else {
        displayName = existing.name;
      }
    } else {
      const newUser: RegisteredUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        password: "google-auth-pwd",
        name: displayName,
        role: userRole,
        createdAt: new Date().toISOString(),
      };
      const updatedList = [...registeredUsers, newUser];
      setRegisteredUsers(updatedList);
      syncGlobal("register-user", newUser);
    }

    const userProfile: UserProfile = {
      id: existing ? existing.id : `usr-g-${Date.now()}`,
      email: cleanEmail,
      name: displayName,
      role: userRole,
      createdAt: new Date().toISOString(),
    };
    setUser(userProfile);
    localStorage.setItem("otantikos_user", JSON.stringify(userProfile));
    return { success: true };
  };

  const isAdmin = user?.email?.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase() || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        registeredUsers,
        login,
        register,
        loginWithGoogle,
        updateUserRole,
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
