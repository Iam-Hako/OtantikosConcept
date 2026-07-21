export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categorySlug: string;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  variants: {
    name: string;
    options: string[];
  }[];
  details: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  heroTitle: string;
  heroHighlightText: string;
  heroDescription: string;
  topbarText: string;
  announcementText: string;
  navLinks: {
    label: string;
    href: string;
  }[];
  categories: Category[];
}

// Varsayılan Site Ayarları (Bijuteri, Trend Oyuncaklar & NeeDoh Squishy Konseptine Uyarlanmış)
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "OtantikosConcept",
  siteSubtitle: "Specialist Local & Trend Products",
  heroTitle: "Trend Oyuncaklar & Özgün",
  heroHighlightText: "Bijuteri Koleksiyonu",
  heroDescription: "NeeDoh Squishy Çin Mantısı, stres oyuncakları, trend hediyelikler ve göz alıcı bijuteri takı tasarımları tek adreste!",
  topbarText: "OtantikosConcept • Trend Oyuncaklar, Squishy ve Şık Bijuteri Dünyası",
  announcementText: "Yeni Gelen NeeDoh Squishy Çin Mantısı ve Trend Bijuterileri Keşfedin!",
  navLinks: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Tüm Ürünler", href: "/urunler" },
    { label: "Trend Oyuncak & Squishy", href: "/kategori/trend-oyuncak-squishy" },
    { label: "Bijuteri & Takı", href: "/kategori/bijuteri-taki" },
  ],
  categories: [
    {
      id: "cat-1",
      name: "Trend Oyuncak & Squishy",
      slug: "trend-oyuncak-squishy",
      description: "NeeDoh Squishy Çin Mantısı, stres topu ve popüler pop-it oyuncaklar.",
      image: "/otantikos-logo.png",
      itemCount: 0
    },
    {
      id: "cat-2",
      name: "Bijuteri & Takı",
      slug: "bijuteri-taki",
      description: "Özel tasarım kolyeler, bileklikler, küpeler ve trend aksesuarlar.",
      image: "/otantikos-logo.png",
      itemCount: 0
    },
    {
      id: "cat-3",
      name: "Trend Hediyelikler",
      slug: "trend-hediyelikler",
      description: "Sevdikleriniz için popüler ve eğlenceli konsept hediyeler.",
      image: "/otantikos-logo.png",
      itemCount: 0
    }
  ]
};

export const INITIAL_PRODUCTS: Product[] = [];
