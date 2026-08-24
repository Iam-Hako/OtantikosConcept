// Otantikos Concept Initial Seed Data & Turkish Search Helpers
import { Category, Product } from '@/lib/types/ecommerce';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Tasarım Çelik Takı & Bijüteri",
    slug: "tasarim-celik-taki-bijuteri",
    description: "316L medikal paslanmaz çelik, kararmaz garantili, su ve parfüme dayanıklı Eminönü tasarım kolyeler, bileklikler ve küpeler.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "cat-2",
    name: "Trend & Mekanik Oyuncaklar",
    slug: "trend-mekanik-oyuncaklar",
    description: "Teknolojik uçan küreler, 3D ahşap kurmalı mekanik modeller, eğitici ve eğlenceli Tahtakale koleksiyonu.",
    image_url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&auto=format&fit=crop&q=80",
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "cat-3",
    name: "Özel Tasarım Hediyelik Eşyalar",
    slug: "ozel-tasarim-hediyelik-esyalar",
    description: "El yapımı otantik mozaik masa lambaları, dinamik kum sanatı tabloları ve özel dekoratif hediye seçenekleri.",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "cat-4",
    name: "Nostaljik Koleksiyon & Maket",
    slug: "nostaljik-koleksiyon-maket",
    description: "Geçmişin ruhunu yaşatan mekanik kurmalı müzik kutuları, klasik araç modelleri ve retro masa aksesuarları.",
    image_url: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&auto=format&fit=crop&q=80",
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Trend Oyuncak 1
  {
    id: "prod-toy-1",
    category_id: "cat-2",
    category: INITIAL_CATEGORIES[1],
    name: "Işıklı ve Sesli Manyetik Uçan Fidget Spinner & Dron Küre",
    slug: "isikli-ve-sesli-manyetik-ucan-fidget-spinner-dron-kure",
    description: "Tahtakale'nin en popüler trend oyuncağı! El hareketleriyle kontrol edilen, 360 derece dönebilen, LED ışıklı ve çarpmaya dayanıklı manyetik uçan küre. Akıllı bumerang dönüş fonksiyonu sayesinde fırlattığınızda elinize geri döner.",
    short_description: "360° dönebilen LED ışıklı akıllı bumerang uçan küre.",
    price: 349.00,
    stock: 45,
    sku: "TOY-FLY-01",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.9,
    review_count: 38,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "Uçan Dron Küre Ana Görsel"
      },
      {
        image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Uçan Dron Küre Işık Detayı"
      },
      {
        image_url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 3,
        alt_text: "Uçan Dron Küre Kutusu"
      }
    ],
    variants: [
      {
        id: "var-toy-1-blue",
        name: "Renk",
        value: "Kozmik Mavi",
        price_override: 349.00,
        stock: 25,
        sku: "TOY-FLY-BLU",
        image_url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-toy-1-red",
        name: "Renk",
        value: "Alev Kırmızısı",
        price_override: 349.00,
        stock: 20,
        sku: "TOY-FLY-RED",
        image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Şarj Süresi", spec_value: "25 Dakika Hızlı USB Şarj", display_order: 1 },
      { spec_key: "Uçuş Süresi", spec_value: "10-12 Dakika Kesintisiz", display_order: 2 },
      { spec_key: "Pil Tipi", spec_value: "Entegre Li-Polymer Pil", display_order: 3 },
      { spec_key: "Malzeme", spec_value: "Esnek ve Darbeye Dayanıklı ABS Polimer", display_order: 4 },
      { spec_key: "Yaş Grubu", spec_value: "6 Yaş ve Üzeri", display_order: 5 },
      { spec_key: "Kutu İçeriği", spec_value: "Uçan Küre, USB Şarj Kablosu, Kullanım Kılavuzu", display_order: 6 }
    ]
  },

  // 2. Trend Oyuncak 2
  {
    id: "prod-toy-2",
    category_id: "cat-2",
    category: INITIAL_CATEGORIES[1],
    name: "3D Ahşap Mekanik Kurmalı Nostaljik Müzik Kutusu Maketi",
    slug: "3d-ahsap-mekanik-kurmali-nostaljik-muzik-kutusu-maketi",
    description: "Lazer kesim huş ağacından üretilmiş, yapıştırıcı gerektirmeyen hassas geçme mekanik maket. Kurma kolu çevrildiğinde çarklar hareket eder ve dinlendirici klasik melodi çalar. Hem eğlenceli bir montaj deneyimi hem de şık bir masa dekoru.",
    short_description: "Lazer kesim ahşap mekanik hareketli müzik kutusu maketi.",
    price: 489.00,
    stock: 18,
    sku: "MKT-WOOD-02",
    video_url: null,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 5.0,
    review_count: 19,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "Ahşap Müzik Kutusu Maketi"
      },
      {
        image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Maket Çark Detayı"
      }
    ],
    variants: [
      {
        id: "var-toy-2-wheel",
        name: "Model",
        value: "Nostaljik Dönme Dolap",
        price_override: 489.00,
        stock: 10,
        sku: "MKT-WOOD-WHL",
        image_url: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-toy-2-gramophone",
        name: "Model",
        value: "Klasik Gramofon",
        price_override: 519.00,
        stock: 8,
        sku: "MKT-WOOD-GRM",
        image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Parça Sayısı", spec_value: "232 Hassas Lazer Kesim Ahşap Parça", display_order: 1 },
      { spec_key: "Montaj Süresi", spec_value: "Yaklaşık 2.5 - 3 Saat", display_order: 2 },
      { spec_key: "Melodi", spec_value: "Castle in the Sky / Für Elise", display_order: 3 },
      { spec_key: "Yapıştırıcı İhtiyacı", spec_value: "Gerektirmez (Geçmeli Sistem)", display_order: 4 },
      { spec_key: "Ölçüler", spec_value: "140 x 140 x 205 mm", display_order: 5 }
    ]
  },

  // 3. Çelik Bijüteri 1
  {
    id: "prod-jwl-1",
    category_id: "cat-1",
    category: INITIAL_CATEGORIES[0],
    name: "316L Kararmaz Çelik İtalyan Ezme Yılan Zincir Kolye",
    slug: "316l-kararmaz-celik-italyan-ezme-yilan-zincir-kolye",
    description: "Eminönü Tahtakale takı atölyelerinden birinci sınıf 316L medikal paslanmaz çelik İtalyan ezme yılan zincir kolye. Kararmaz, paslanmaz, denizde, havuzda ve duşta kararma yapmaz. Tenle kusursuz temas sağlayan pürüzsüz yüzey.",
    short_description: "Suya, parfüme dayanıklı 316L çelik İtalyan ezme zincir kolye.",
    price: 279.00,
    stock: 60,
    sku: "JWL-NECK-01",
    video_url: null,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.8,
    review_count: 54,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "İtalyan Ezme Çelik Kolye"
      },
      {
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Kolye Kilit ve Doku Detayı"
      }
    ],
    variants: [
      {
        id: "var-jwl-1-gold",
        name: "Kaplama",
        value: "18K Altın Kaplama",
        price_override: 279.00,
        stock: 35,
        sku: "JWL-NECK-GLD",
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-jwl-1-silver",
        name: "Kaplama",
        value: "Doğal Çelik / Gümüş",
        price_override: 279.00,
        stock: 25,
        sku: "JWL-NECK-SLV",
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Maden Türü", spec_value: "316L Medikal Paslanmaz Çelik", display_order: 1 },
      { spec_key: "Kararmazlık Durumu", spec_value: "Garantili (Su, Parfüm, Ter Geçirmez)", display_order: 2 },
      { spec_key: "Zincir Uzunluğu", spec_value: "45 cm + 5 cm Ayarlanabilir Uzatma", display_order: 3 },
      { spec_key: "Zincir Kalınlığı", spec_value: "4 mm İtalyan Ezme", display_order: 4 },
      { spec_key: "Ağırlık", spec_value: "14.2 Gram", display_order: 5 },
      { spec_key: "Alerjen Durumu", spec_value: "Nikel İçermez, Anti-Alerjiktir", display_order: 6 }
    ]
  },

  // 4. Çelik Bijüteri 2
  {
    id: "prod-jwl-2",
    category_id: "cat-1",
    category: INITIAL_CATEGORIES[0],
    name: "Roma Rakamlı Zirkon Taşlı Çelik Çivi Kelepçe Bileklik",
    slug: "roma-rakamli-zirkon-tasli-celik-civi-kelepce-bileklik",
    description: "Zarif Roma rakamı kabartmaları ve pırlanta parlaklığında 5A baget zirkon taşlarıyla işlenmiş özel tasarım çelik kelepçe bileklik. Gizli yaylı güvenlik kilidi ile tek elle kolayca açılıp kapanır.",
    short_description: "5A zirkon taşlı ve Roma rakamı motifli 316L çelik kelepçe bileklik.",
    price: 389.00,
    stock: 28,
    sku: "JWL-BRC-02",
    video_url: null,
    is_featured: true,
    is_new: false,
    is_active: true,
    rating: 4.9,
    review_count: 42,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1611591475102-4682743e8876?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "Roma Rakamlı Çelik Kelepçe"
      },
      {
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Kelepçe Kilit Detayı"
      }
    ],
    variants: [
      {
        id: "var-jwl-2-rose",
        name: "Renk",
        value: "Rose Gold",
        price_override: 389.00,
        stock: 10,
        sku: "JWL-BRC-ROS",
        image_url: "https://images.unsplash.com/photo-1611591475102-4682743e8876?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-jwl-2-gold",
        name: "Renk",
        value: "Sarı Altın",
        price_override: 389.00,
        stock: 12,
        sku: "JWL-BRC-GLD",
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-jwl-2-silver",
        name: "Renk",
        value: "Platin Gümüş",
        price_override: 389.00,
        stock: 6,
        sku: "JWL-BRC-SLV",
        image_url: "https://images.unsplash.com/photo-1611591475102-4682743e8876?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Maden", spec_value: "316L Paslanmaz Çelik", display_order: 1 },
      { spec_key: "Taş Cinsi", spec_value: "5A Baget Mikro Mıhlama Zirkon", display_order: 2 },
      { spec_key: "Kilit Tipi", spec_value: "Gizli Yaylı Emniyet Kilidi", display_order: 3 },
      { spec_key: "Bilek Ölçüsü", spec_value: "Standart 16-19 cm Bileklere Uygun", display_order: 4 },
      { spec_key: "Garanti", spec_value: "2 Yıl Kararmazlık ve Taş Düşmeme Garantisi", display_order: 5 }
    ]
  },

  // 5. Hediyelik Eşya 1
  {
    id: "prod-gft-1",
    category_id: "cat-3",
    category: INITIAL_CATEGORIES[2],
    name: "Eminönü Tahtakale Özel Üretim El İşçiliği Mozaik Masa Lambası",
    slug: "eminonu-tahtakale-ozel-uretim-el-isciligi-mozaik-masa-lambasi",
    description: "Geleneksel Tahtakale cam ustalarının el işçiliğiyle tek tek kesip yapıştırdığı otantik Türk mozaik masa lambası. Antik pirinç döküm gövdesi ve sıcak ışık yayan geometrik mozaik cam küresiyle mekanlara benzersiz bir nostaljik hava katar.",
    short_description: "Antik pirinç döküm gövdeli, %100 el yapımı mozaik masa lambası.",
    price: 649.00,
    stock: 14,
    sku: "MOS-LAMP-01",
    video_url: null,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 5.0,
    review_count: 27,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "Mozaik Lamba Işık Açık"
      },
      {
        image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Mozaik Cam Detay"
      }
    ],
    variants: [
      {
        id: "var-gft-1-amber",
        name: "Desen & Renk",
        value: "Otantik Amber",
        price_override: 649.00,
        stock: 5,
        sku: "MOS-LMP-AMB",
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-gft-1-turq",
        name: "Desen & Renk",
        value: "Turkuaz Kristal",
        price_override: 649.00,
        stock: 5,
        sku: "MOS-LMP-TRQ",
        image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-gft-1-emerald",
        name: "Desen & Renk",
        value: "Zümrüt Yeşili",
        price_override: 649.00,
        stock: 4,
        sku: "MOS-LMP-EMR",
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Gövde Malzemesi", spec_value: "Antik Eskitme Pirinç Döküm Metal", display_order: 1 },
      { spec_key: "Cam İşçiliği", spec_value: "%100 El Yapımı Orijinal Kesme Mozaik Cam", display_order: 2 },
      { spec_key: "Duy Tipi", spec_value: "E14 Standart Duy (LED Ampul Hediyeli)", display_order: 3 },
      { spec_key: "Kablo", spec_value: "1.5 Metre Aç/Kapa Anahtarlı CE Belgeli Kablo", display_order: 4 },
      { spec_key: "Yükseklik", spec_value: "34 cm | Küre Çapı: 14 cm", display_order: 5 },
      { spec_key: "Menşei", spec_value: "Türkiye / İstanbul Eminönü", display_order: 6 }
    ]
  },

  // 6. Hediyelik Eşya 2
  {
    id: "prod-gft-2",
    category_id: "cat-3",
    category: INITIAL_CATEGORIES[2],
    name: "Doğal Kum Saati ve Dönen Gezegenli Manyetik Kum Sanatı Tablosu",
    slug: "dogal-kum-saati-ve-donen-gezegenli-manyetik-kum-sanati-tablosu",
    description: "360 derece dönebilen dairesel çerçevesiyle her çevirişte bambaşka dağ, vadi ve çöl manzaraları oluşturan dinlendirici dinamik kum sanatı tablosu. Çalışma masası ve ofisler için odaklanmayı artıran lüks bir hediye seçeneği.",
    short_description: "360° dönebilen, dinlendirici dinamik sıvı kum sanatı tablosu.",
    price: 429.00,
    stock: 22,
    sku: "SND-ART-02",
    video_url: null,
    is_featured: false,
    is_new: true,
    is_active: true,
    rating: 4.9,
    review_count: 31,
    created_at: new Date().toISOString(),
    images: [
      {
        image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80",
        is_cover: true,
        display_order: 1,
        alt_text: "Kum Sanatı Tablosu Ana Görsel"
      },
      {
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
        is_cover: false,
        display_order: 2,
        alt_text: "Kum Tablosu Katman Detayı"
      }
    ],
    variants: [
      {
        id: "var-gft-2-blue",
        name: "Renk Teması",
        value: "Gece Mavisi & Altın Kum",
        price_override: 429.00,
        stock: 12,
        sku: "SND-ART-BLU",
        image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      },
      {
        id: "var-gft-2-orange",
        name: "Renk Teması",
        value: "Gün Batımı Turuncusu",
        price_override: 429.00,
        stock: 10,
        sku: "SND-ART-ORG",
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
        is_active: true
      }
    ],
    specifications: [
      { spec_key: "Çerçeve", spec_value: "Mat Siyah Alüminyum & Şeffaf Akrilik Stand", display_order: 1 },
      { spec_key: "Kum Tipi", spec_value: "Doğal İnce Silika Kumu ve Metalik Sim", display_order: 2 },
      { spec_key: "Çap Ölçüsü", spec_value: "25 cm Çap | Stand ile 28 cm", display_order: 3 },
      { spec_key: "Ağırlık", spec_value: "850 Gram", display_order: 4 },
      { spec_key: "Kutu Özelliği", spec_value: "Özel Süngerli Lüks Hediye Kutusu", display_order: 5 }
    ]
  }
];

// Helper function to normalize Turkish strings for case-insensitive and diacritic-insensitive search
export function normalizeTurkish(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function searchProducts(query: string, products: Product[] = INITIAL_PRODUCTS): Product[] {
  if (!query || query.trim() === '') return products;
  const normalizedQuery = normalizeTurkish(query);
  
  return products.filter((p) => {
    const nameMatch = normalizeTurkish(p.name).includes(normalizedQuery);
    const descMatch = normalizeTurkish(p.description).includes(normalizedQuery);
    const skuMatch = normalizeTurkish(p.sku).includes(normalizedQuery);
    const catMatch = p.category ? normalizeTurkish(p.category.name).includes(normalizedQuery) : false;
    const specMatch = p.specifications?.some(s => 
      normalizeTurkish(s.spec_key).includes(normalizedQuery) || 
      normalizeTurkish(s.spec_value).includes(normalizedQuery)
    );
    const varMatch = p.variants?.some(v => 
      normalizeTurkish(v.name).includes(normalizedQuery) || 
      normalizeTurkish(v.value).includes(normalizedQuery)
    );

    return nameMatch || descMatch || skuMatch || catMatch || specMatch || varMatch;
  });
}
