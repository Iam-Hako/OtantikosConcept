import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import MobileNav from "@/components/MobileNav";
import LiveChat from "@/components/LiveChat";
import PageTransitionLoader from "@/components/PageTransitionLoader";

export const metadata: Metadata = {
  title: "OtantikosConcept | Bijuteri, Takı & Hediyelik Eşya",
  description: "Özgün bijuteri takı tasarımları, şık aksesuarlar ve hediyelik eşyalar OtantikosConcept güvencesiyle.",
  keywords: "otantikosconcept, bijuteri, takı, hediyelik eşya, aksesuar",
  icons: {
    icon: "/otantikos-logo.png",
    shortcut: "/otantikos-logo.png",
    apple: "/otantikos-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#C86D51] selection:text-white bg-[#FDFBF7]">
        <AuthProvider>
          <CartProvider>
            <PageTransitionLoader />
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <LiveChat />
            <MobileNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
