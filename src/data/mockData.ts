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
  variants?: {
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
      itemCount: 1
    },
    {
      id: "cat-2",
      name: "Hediyelik Eşya & Aksesuar",
      slug: "hediyelik-esya",
      description: "Sevdikleriniz için şık, estetik ve özgün hediyelik eşyalar.",
      image: "/otantikos-logo.png",
      itemCount: 1
    },
    {
      id: "cat-3",
      name: "Trend Oyuncak & Squishy",
      slug: "trend-oyuncak-squishy",
      description: "NeeDoh Squishy Çin Mantısı, stres topu ve popüler trend oyuncaklar.",
      image: "/otantikos-logo.png",
      itemCount: 1
    }
  ]
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "NeeDoh Squishy Çin Mantısı Stress Topu",
    slug: "needoh-squishy-cin-mantisi",
    description: "Özel buharda pişirme sepetli, ultra yumuşak ve rahatlatıcı NeeDoh Squishy Çin Mantısı stres oyuncağı.",
    price: 189.9,
    category: "Trend Oyuncak & Squishy",
    categorySlug: "trend-oyuncak-squishy",
    image: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=800&auto=format&fit=crop"
    ],
    stock: 45,
    rating: 4.9,
    reviewCount: 128,
    details: [
      "Orijinal esnek sıkılabilir Squishy dokusu",
      "Mini buhar sepeti hediyeli",
      "Toksik madde içermeyen güvenli malzeme",
      "Stres azaltıcı ve eğlenceli tasarım"
    ]
  },
  {
    id: "prod-2",
    title: "Otantik Etnik Desenli Doğal Taş Kolye",
    slug: "otantik-etnik-desenli-dogal-tas-kolye",
    description: "Özel tasarım bijuteri kolye, etnik motifler ve doğal taş detayları ile şıklığınıza zarafet katın.",
    price: 149.9,
    category: "Bijuteri & Takı",
    categorySlug: "bijuteri-taki",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.8,
    reviewCount: 64,
    details: [
      "Kararma yapmaz anti-alerjik kaplama",
      "Ayarlanabilir zincir boyu",
      "Özel hediye kutusunda gönderim"
    ]
  },
  {
    id: "prod-3",
    title: "El Yapımı Otantik Seramik Kupa Bardak",
    slug: "el-yapimi-otantik-seramik-kupa",
    description: "Özel sır kaplamalı, tamamen el yapımı tasarım hediyelik seramik kupa bardak.",
    price: 229.9,
    category: "Hediyelik Eşya & Aksesuar",
    categorySlug: "hediyelik-esya",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    ],
    stock: 15,
    rating: 5,
    reviewCount: 42,
    details: [
      "350 ml hacim",
      "Bulaşık makinesinde yıkanabilir",
      "El işçiliği özel seramik"
    ]
  }
];
