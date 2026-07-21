import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "OtantikosConcept | El Yapımı Otantik Ev & Yaşam Ürünleri",
  description: "Anadolu'nun zengin dokunuşları, el yapımı seramikler, doğal ev tekstili ve özel tasarım zanaat ürünleri OtantikosConcept güvencesiyle.",
  keywords: "otantikosconcept, otantik ürünler, el yapımı seramik, peştemal, zeytin ağacı sunum, doğal soya mumu",
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
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#C86D51] selection:text-white">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
