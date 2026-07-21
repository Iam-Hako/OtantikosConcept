"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, SiteSettings, DEFAULT_SITE_SETTINGS, Product } from "@/data/mockData";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (product: Product) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Oturum kontrolü
      const savedUser = localStorage.getItem("otantikos_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      // Site ayarları kontrolü
      const savedSettings = localStorage.getItem("otantikos_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // Ürünler kontrolü
      const savedProducts = localStorage.getItem("otantikos_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    } catch (e) {
      console.error("AuthContext loading error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Admin girişi simülasyonu (admin@otantikos.com) veya normal kullanıcı
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const loggedUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: role,
      createdAt: new Date().toISOString(),
    };

    setUser(loggedUser);
    localStorage.setItem("otantikos_user", JSON.stringify(loggedUser));
    return true;
  };

  const register = (name: string, email: string, pass: string): boolean => {
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: role,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem("otantikos_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("otantikos_user");
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem("otantikos_settings", JSON.stringify(newSettings));
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
