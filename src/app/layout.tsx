import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "OtantikosConcept | Trend Oyuncaklar, NeeDoh Squishy & Bijuteri",
  description: "NeeDoh Squishy Çin Mantısı, stres oyuncakları, trend bijuteri takılar ve özgün aksesuarlar OtantikosConcept güvencesiyle.",
  keywords: "otantikosconcept, needoh squishy, çin mantısı squishy, trend oyuncak, bijuteri, takı, hediyelik",
  icons: {
    icon: "/otantikos-logo.png",
    shortcut: "/otantikos-logo.png",
    apple: "/otantikos-logo.png",
  },
};

import MobileNav from "@/components/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#C86D51] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
