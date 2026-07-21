export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categorySlug: string;
  image?: string;
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
  siteSubtitle: "Bijuteri & Hediyelik Eşya",
  heroTitle: "Bijuteri, Hediyelik &",
  heroHighlightText: "Trend Oyuncak Mağazası",
  heroDescription: "Özgün bijuteri takı tasarımları, şık hediyelik eşyalar ve sevilen trend oyuncaklar OtantikosConcept kalitesiyle!",
  topbarText: "OtantikosConcept • Bijuteri, Hediyelik Eşya ve Trend Oyuncak Mağazası",
  announcementText: "Bijuteri, Hediyelik Eşya ve Trend Oyuncak Koleksiyonumuzu Keşfedin!",
  navLinks: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Tüm Ürünler", href: "/urunler" },
    { label: "Bijuteri & Takı", href: "/kategori/bijuteri-taki" },
    { label: "Hediyelik Eşya", href: "/kategori/hediyelik-esya" },
    { label: "Trend Oyuncak & Squishy", href: "/kategori/trend-oyuncak-squishy" },
  ],
  categories: [
    {
      id: "cat-1",
      name: "Bijuteri & Takı",
      slug: "bijuteri-taki",
      description: "Özel tasarım kolyeler, bileklikler, küpeler ve trend aksesuarlar.",
      image: "/otantikos-logo.png",
      itemCount: 0
    },
    {
      id: "cat-2",
      name: "Hediyelik Eşya & Aksesuar",
      slug: "hediyelik-esya",
      description: "Sevdikleriniz için şık, estetik ve özgün hediyelik eşyalar.",
      image: "/otantikos-logo.png",
      itemCount: 0
    },
    {
      id: "cat-3",
      name: "Trend Oyuncak & Squishy",
      slug: "trend-oyuncak-squishy",
      description: "NeeDoh Squishy Çin Mantısı, stres topu ve popüler trend oyuncaklar.",
      image: "/otantikos-logo.png",
      itemCount: 0
    }
  ]
};

export const INITIAL_PRODUCTS: Product[] = [];
