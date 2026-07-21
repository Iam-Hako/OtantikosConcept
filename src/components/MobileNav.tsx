"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User, ShieldAlert } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, isAdmin, siteTexts } = useAuth();

  // Admin paneli rotalarında mobil navigasyon gösterilmesin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      label: siteTexts?.header?.navHome || "Ana Sayfa",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: siteTexts?.header?.navAllProducts || "Ürünler",
      href: "/urunler",
      icon: Grid,
      exact: false,
    },
    {
      label: siteTexts?.header?.cartLabel || "Sepetim",
      href: "/sepet",
      icon: ShoppingBag,
      exact: false,
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      label: isAdmin ? "Admin" : user ? user.name : (siteTexts?.header?.accountLabel || "Hesabım"),
      href: isAdmin ? "/admin" : "/hesabim",
      icon: isAdmin ? ShieldAlert : User,
      exact: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-t border-[#E6DCD3] md:hidden shadow-[0_-4px_16px_rgba(62,46,40,0.08)] py-2 px-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#C86D51] font-bold"
                  : "text-[#7C6354] hover:text-[#3E2E28]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#C86D51] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
