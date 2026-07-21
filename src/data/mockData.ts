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

// Varsayılan kategoriler (Yönetici Paneli üzerinden yönetilebilir)
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "El Yapımı Seramik",
    slug: "el-yapimi-seramik",
    description: "Usta zanaatkarlar tarafından hazırlanan seramik koleksiyonu.",
    image: "/otantikos-logo.png",
    itemCount: 0
  },
  {
    id: "cat-2",
    name: "Otantik Ev Tekstili",
    slug: "otantik-ev-tekstili",
    description: "Doğal dokuma kumaş ve peştemal ürünleri.",
    image: "/otantikos-logo.png",
    itemCount: 0
  },
  {
    id: "cat-3",
    name: "Doğal Ahşap & Dekor",
    slug: "dogal-ahsap-dekor",
    description: "Ahşap sunum ve ev dekorasyon objeleri.",
    image: "/otantikos-logo.png",
    itemCount: 0
  },
  {
    id: "cat-4",
    name: "Doğal Bakım & Mumlar",
    slug: "dogal-bakim-mumlar",
    description: "Organik mum ve doğal el yapımı sabunlar.",
    image: "/otantikos-logo.png",
    itemCount: 0
  }
];

// Başlangıçta ürün listesi boş bırakıldı. Ürünler Admin Paneli (/admin) üzerinden eklenecektir.
export const INITIAL_PRODUCTS: Product[] = [];
