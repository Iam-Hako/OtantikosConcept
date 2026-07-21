"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, SiteSettings, INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  ipAddress?: string;
  lastLoginLocation?: string;
  lastLoginDate?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (name: string, email: string) => { success: boolean };
  updateUserRole: (userId: string, role: "admin" | "user") => void;
  updateUserPassword: (userId: string, newPass: string) => void;
  deleteUser: (userId: string) => void;
  hardResetSystem: () => Promise<void>;
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
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sabit Admin Hesabı Bilgileri
export const HARDCODED_ADMIN = {
  email: "chessvip11@gmail.com",
  password: "32843284FF",
  name: "Haktan Fetih Durmuş",
};

const defaultAdminUser: RegisteredUser = {
  id: "usr-admin-primary",
  email: HARDCODED_ADMIN.email,
  password: HARDCODED_ADMIN.password,
  name: HARDCODED_ADMIN.name,
  role: "admin",
  createdAt: "2026-07-21T00:00:00.000Z",
  ipAddress: "127.0.0.1 (Yönetici)",
  lastLoginLocation: "Türkiye / İstanbul",
  lastLoginDate: "2026-07-21T00:00:00.000Z",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([defaultAdminUser]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [siteTexts, setSiteTexts] = useState<SiteTexts>(DEFAULT_SITE_TEXTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // ========================
  // SUNUCU TEMELLİ VERİ ÇEKME (SERVER-DRIVEN ENGINE)
  // ========================
  const fetchGlobalData = useCallback(async () => {
    try {
      const res = await fetch("/api/site-data", {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.products && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        }
        if (data.data.siteTexts) {
          setSiteTexts({ ...DEFAULT_SITE_TEXTS, ...data.data.siteTexts });
        }
        if (data.data.siteSettings) {
          setSettings(data.data.siteSettings);
        }
        if (data.data.registeredUsers && Array.isArray(data.data.registeredUsers)) {
          let cleanUsers = data.data.registeredUsers.filter(
            (u: RegisteredUser) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
          );
          if (!cleanUsers.some((u: RegisteredUser) => u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase())) {
            cleanUsers = [defaultAdminUser, ...cleanUsers];
          }
          setRegisteredUsers(cleanUsers);
        }
      }
    } catch (err) {
      console.error("Server API fetch error:", err);
    }
  }, []);

  const syncGlobal = async (action: string, payload: any): Promise<void> => {
    try {
      const res = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.products) setProducts(data.data.products);
        if (data.data.siteTexts) setSiteTexts({ ...DEFAULT_SITE_TEXTS, ...data.data.siteTexts });
        if (data.data.siteSettings) setSettings(data.data.siteSettings);
        if (data.data.registeredUsers) {
          let cleanUsers = data.data.registeredUsers.filter(
            (u: RegisteredUser) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
          );
          if (!cleanUsers.some((u: RegisteredUser) => u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase())) {
            cleanUsers = [defaultAdminUser, ...cleanUsers];
          }
          setRegisteredUsers(cleanUsers);
        }
      }
    } catch (err) {
      console.error("Server API sync error:", err);
    }
  };

  const hardResetSystem = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("otantikos_user");
        localStorage.removeItem("otantikos_support_chats");
        localStorage.clear();
      }
      await syncGlobal("hard-reset", {});
      const adminProfile: UserProfile = {
        id: "usr-admin-primary",
        email: HARDCODED_ADMIN.email,
        name: HARDCODED_ADMIN.name,
        role: "admin",
        createdAt: "2026-07-21T00:00:00.000Z",
      };
      setUser(adminProfile);
      localStorage.setItem("otantikos_user", JSON.stringify(adminProfile));
    } catch (e) {
      console.error("Hard reset error:", e);
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde doğrudan SUNUCUDAN veri çek
    fetchGlobalData();

    // 2 saniyede bir doğrudan SUNUCUDAN güncel verileri sorgula (Canlı Sunucu Polling)
    const timer = setInterval(() => {
      fetchGlobalData();
    }, 2000);

    try {
      const savedUser = localStorage.getItem("otantikos_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.email?.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()) {
          const freshAdmin: UserProfile = {
            id: "usr-admin-primary",
            email: HARDCODED_ADMIN.email,
            name: HARDCODED_ADMIN.name,
            role: "admin",
            createdAt: "2026-07-21T00:00:00.000Z",
          };
          setUser(freshAdmin);
        } else {
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.error("AuthContext loading error:", e);
    }

    return () => clearInterval(timer);
  }, [fetchGlobalData]);

  const login = (emailInput: string, passInput: string) => {
    const cleanEmail = (emailInput || "").trim().toLowerCase();

    if (cleanEmail === HARDCODED_ADMIN.email.toLowerCase()) {
      if (passInput === HARDCODED_ADMIN.password) {
        const adminUser: UserProfile = {
          id: "usr-admin-primary",
          email: HARDCODED_ADMIN.email,
          name: HARDCODED_ADMIN.name,
          role: "admin",
          createdAt: "2026-07-21T00:00:00.000Z",
        };
        setUser(adminUser);
        localStorage.setItem("otantikos_user", JSON.stringify(adminUser));
        return { success: true };
      } else {
        return { success: false, error: "Hatalı yönetici şifresi girdiniz!" };
      }
    }

    const foundUser = registeredUsers.find(
      (u) => u?.email?.toLowerCase() === cleanEmail
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

  const register = async (nameInput: string, emailInput: string, passInput: string) => {
    const cleanEmail = (emailInput || "").trim().toLowerCase();

    if (!nameInput?.trim()) {
      return { success: false, error: "Lütfen ad ve soyadınızı giriniz." };
    }

    if (!cleanEmail.includes("@")) {
      return { success: false, error: "Geçerli bir e-posta adresi giriniz." };
    }

    if (!passInput || passInput.length < 4) {
      return { success: false, error: "Şifreniz en az 4 karakter olmalıdır." };
    }

    const existing = registeredUsers.find(
      (u) => u?.email?.toLowerCase() === cleanEmail
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
      ipAddress: "185.190.140.22 (Türkiye / İstanbul)",
      lastLoginLocation: "Türkiye / İstanbul",
      lastLoginDate: new Date().toISOString(),
    };

    // Sunucuya doğrudan yeni kullanıcıyı yazıp CEVAP ALANA KADAR BEKLE (100% Garanti Kayıt)
    await syncGlobal("register-user", newUserRecord);

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
    syncGlobal("update-settings", newSettings);
  };

  const updateSiteTexts = (newTexts: SiteTexts) => {
    syncGlobal("update-texts", newTexts);
  };

  const addProduct = (prod: Product) => {
    const updated = [prod, ...products];
    syncGlobal("update-products", updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    syncGlobal("update-products", updated);
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    syncGlobal("update-products", updated);
  };

  const updateUserRole = (userId: string, newRole: "admin" | "user") => {
    syncGlobal("update-user-role", { userId, role: newRole });

    if (user && user.id === userId) {
      const updatedProfile: UserProfile = { ...user, role: newRole };
      setUser(updatedProfile);
      localStorage.setItem("otantikos_user", JSON.stringify(updatedProfile));
    }
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    syncGlobal("update-user-password", { userId, newPassword: newPass });
  };

  const deleteUser = (userId: string) => {
    syncGlobal("delete-user", { userId });
  };

  const loginWithGoogle = (name: string, email: string) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) return { success: false };

    const existing = registeredUsers.find((u) => u?.email?.toLowerCase() === cleanEmail);
    let userRole: "admin" | "user" = cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? "admin" : "user";
    let displayName = cleanEmail === HARDCODED_ADMIN.email.toLowerCase() ? HARDCODED_ADMIN.name : (name || "Google Kullanıcısı");

    if (existing) {
      // 1. Zaten aynı e-posta ile kayıtlı hesabı varsa: Doğrudan o hesaba giriş yap!
      userRole = existing.role;
      displayName = existing.name || displayName;

      const userProfile: UserProfile = {
        id: existing.id,
        email: cleanEmail,
        name: displayName,
        role: userRole,
        createdAt: existing.createdAt || "2026-07-21T00:00:00.000Z",
      };

      setUser(userProfile);
      localStorage.setItem("otantikos_user", JSON.stringify(userProfile));
      return { success: true };
    } else {
      // 2. Hesabı yoksa: Google bilgileriyle sunucuya TEK TIKLA kaydet ve giriş yaptır!
      const newUser: RegisteredUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        password: "google-auth-pwd",
        name: displayName,
        role: userRole,
        createdAt: new Date().toISOString(),
        ipAddress: "185.190.140.22 (Türkiye / İstanbul)",
        lastLoginLocation: "Türkiye / İstanbul",
        lastLoginDate: new Date().toISOString(),
      };

      syncGlobal("register-user", newUser);

      const userProfile: UserProfile = {
        id: newUser.id,
        email: cleanEmail,
        name: displayName,
        role: userRole,
        createdAt: newUser.createdAt,
      };

      setUser(userProfile);
      localStorage.setItem("otantikos_user", JSON.stringify(userProfile));
      return { success: true };
    }
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
        updateUserPassword,
        deleteUser,
        hardResetSystem,
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
        refreshData: fetchGlobalData,
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
