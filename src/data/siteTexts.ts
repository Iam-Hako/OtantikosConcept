export interface SiteTexts {
  header: {
    topbarText: string;
    topbarShipping: string;
    topbarOriginal: string;
    topbarWelcome: string;
    topbarLogin: string;
    searchPlaceholder: string;
    navHome: string;
    navAllProducts: string;
    navSquishy: string;
    navJewelry: string;
    adminButton: string;
    accountLabel: string;
    cartLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    highlightTitle: string;
    description: string;
    buttonText: string;
    adminButtonText: string;
    cardBadgeTitle: string;
    cardBadgeSub: string;
    cardBadgeDesc: string;
  };
  categoriesSection: {
    badge: string;
    title: string;
    subtitle: string;
    inspectButton: string;
  };
  productsSection: {
    badge: string;
    title: string;
    seeAllLink: string;
    subtitle: string;
    emptyCatalogTitle: string;
    emptyCatalogDesc: string;
    emptyCatalogAdminAction: string;
  };
  productCard: {
    newBadge: string;
    soldOutBadge: string;
    inStock: string;
    addToCart: string;
    inCart: string;
    viewDetail: string;
    reviewsCountSuffix: string;
  };
  catalogPage: {
    title: string;
    subtitle: string;
    filtersTitle: string;
    allCategories: string;
    sortTitle: string;
    sortDefault: string;
    sortLowToHigh: string;
    sortHighToLow: string;
    foundCountSuffix: string;
    noProductsTitle: string;
    noProductsDesc: string;
    clearFiltersButton: string;
  };
  productDetailPage: {
    stockStatusInStock: string;
    stockStatusOutOfStock: string;
    quantityLabel: string;
    variantLabel: string;
    addToCartButton: string;
    buyNowButton: string;
    badgeFastShipping: string;
    badgeOriginal: string;
    badgeEasyReturn: string;
    descriptionTab: string;
    detailsTab: string;
    relatedProductsTitle: string;
  };
  cartPage: {
    title: string;
    emptyCartTitle: string;
    emptyCartDesc: string;
    startShoppingButton: string;
    couponTitle: string;
    couponPlaceholder: string;
    couponApplyButton: string;
    couponSuccessText: string;
    summaryTitle: string;
    subtotal: string;
    shipping: string;
    couponDiscount: string;
    total: string;
    checkoutButton: string;
    secureShoppingBadge: string;
  };
  checkoutPage: {
    title: string;
    subtitle: string;
    step1Title: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    orderNoteLabel: string;
    orderNotePlaceholder: string;
    step2Title: string;
    cardOptionTitle: string;
    cardOptionDesc: string;
    codOptionTitle: string;
    codOptionDesc: string;
    cardHolderLabel: string;
    cardNumberLabel: string;
    expireDateLabel: string;
    cvcLabel: string;
    completeOrderButton: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    backToHomeButton: string;
  };
  accountPage: {
    loginTitle: string;
    loginSub: string;
    registerTitle: string;
    registerSub: string;
    loginTab: string;
    registerTab: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginSubmitButton: string;
    registerSubmitButton: string;
    adminBadge: string;
    customerBadge: string;
    goToAdminButton: string;
    logoutButton: string;
    orderHistoryTitle: string;
    noOrdersMessage: string;
    startShoppingLink: string;
  };
  brandStory: {
    title: string;
    content: string;
  };
  footer: {
    trust1Title: string;
    trust1Desc: string;
    trust2Title: string;
    trust2Desc: string;
    trust3Title: string;
    trust3Desc: string;
    trust4Title: string;
    trust4Desc: string;
    brandDescription: string;
    quickLinksTitle: string;
    categoriesTitle: string;
    customerServiceTitle: string;
    faqLink: string;
    shippingPolicyLink: string;
    returnPolicyLink: string;
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    paymentMethodsBadge: string;
    copyrightText: string;
  };
}

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  header: {
    topbarText: "OtantikosConcept • Trend Oyuncaklar & Bijuteri Mağazası",
    topbarShipping: "",
    topbarOriginal: "",
    topbarWelcome: "Hoş geldin",
    topbarLogin: "Giriş Yap / Kayıt Ol",
    searchPlaceholder: "Ürün veya bijuteri ara...",
    navHome: "Ana Sayfa",
    navAllProducts: "Tüm Ürünler",
    navSquishy: "Trend Oyuncak & Squishy",
    navJewelry: "Bijuteri & Takı",
    adminButton: "Yönetici Paneli",
    accountLabel: "Hesabım",
    cartLabel: "Sepetim",
  },
  hero: {
    badge: "Bijuteri & Trend Oyuncak Mağazası",
    title: "Trend Oyuncaklar & Özgün",
    highlightTitle: "Bijuteri Koleksiyonu",
    description: "NeeDoh Squishy Çin Mantısı, stres oyuncakları ve göz alıcı bijuteri takı tasarımları OtantikosConcept'te!",
    buttonText: "Koleksiyonu Keşfet",
    adminButtonText: "Tüm Metinleri Düzenle & Ürün Ekle",
    cardBadgeTitle: "OtantikosConcept",
    cardBadgeSub: "Trend Products & Jewelry",
    cardBadgeDesc: "NeeDoh Squishy Çin Mantısı ve özgün bijuteri takı tasarımları.",
  },
  categoriesSection: {
    badge: "Popüler Kategoriler",
    title: "Öne Çıkan Ürün Grupları",
    subtitle: "NeeDoh Squishy Çin Mantısı ve göz alıcı bijuteri takılarımız.",
    inspectButton: "Ürünleri İncele",
  },
  productsSection: {
    badge: "Mağazamıza Eklenenler",
    title: "Yeni Ürünler",
    seeAllLink: "Tümünü Gör",
    subtitle: "En çok tercih edilen trend oyuncaklar ve bijuteri tasarımları",
    emptyCatalogTitle: "Yakında Yeni Ürünlerimizle Buradayız!",
    emptyCatalogDesc: "Koleksiyonumuz hazırlanıyor, çok yakında harika ürünlerimizle hizmetinizde olacağız.",
    emptyCatalogAdminAction: "+ Yönetici Panelinden Ürün Ekle",
  },
  productCard: {
    newBadge: "YENİ",
    soldOutBadge: "TÜKENDİ",
    inStock: "Stokta Var",
    addToCart: "Sepete Ekle",
    inCart: "Sepette Var",
    viewDetail: "Detayları İncele",
    reviewsCountSuffix: "Değerlendirme",
  },
  catalogPage: {
    title: "Tüm Ürünlerimiz",
    subtitle: "Trend oyuncak, NeeDoh Squishy ve bijuteri tasarımlarımızı keşfedin.",
    filtersTitle: "Kategoriler & Filtreler",
    allCategories: "Tüm Kategoriler",
    sortTitle: "Fiyata Göre Sırala",
    sortDefault: "Varsayılan Sıralama",
    sortLowToHigh: "Fiyat: Düşükten Yükseğe",
    sortHighToLow: "Fiyat: Yüksekten Düşüğe",
    foundCountSuffix: "ürün listelendi",
    noProductsTitle: "Aradığınız Kriterde Ürün Bulunamadı",
    noProductsDesc: "Arama teriminizi değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.",
    clearFiltersButton: "Filtreleri Temizle",
  },
  productDetailPage: {
    stockStatusInStock: "Stok Durumu: Stokta Var",
    stockStatusOutOfStock: "Stok Durumu: Stokta Yok",
    quantityLabel: "Adet Seçimi:",
    variantLabel: "Varyant Seçimi:",
    addToCartButton: "Sepete Ekle",
    buyNowButton: "Hemen Satın Al",
    badgeFastShipping: "Özenli Kargo",
    badgeOriginal: "Orijinal Ürün",
    badgeEasyReturn: "Kolay İade",
    descriptionTab: "Ürün Açıklaması",
    detailsTab: "Teknik Detaylar & Özellikler",
    relatedProductsTitle: "İlginizi Çekebilecek Diğer Ürünler",
  },
  cartPage: {
    title: "Alışveriş Sepetiniz",
    emptyCartTitle: "Sepetiniz Boş",
    emptyCartDesc: "Henüz sepetinize ürün eklemediniz. Ürünler sayfamızdan alışverişe başlayabilirsiniz.",
    startShoppingButton: "Alışverişe Başla",
    couponTitle: "İndirim Kuponu",
    couponPlaceholder: "Kupon Kodunuz",
    couponApplyButton: "Uygula",
    couponSuccessText: "Kupon Kodu Uygulandı",
    summaryTitle: "Sipariş Özeti",
    subtotal: "Ürün Toplamı",
    shipping: "Kargo Ücreti",
    couponDiscount: "Kupon İndirimi",
    total: "Ödenecek Toplam Tutar",
    checkoutButton: "Ödeme Yapmaya Geç",
    secureShoppingBadge: "Güvenli Alışveriş Koruması",
  },
  checkoutPage: {
    title: "Ödeme ve Teslimat",
    subtitle: "Lütfen teslimat bilgilerinizi ve ödeme yönteminizi seçin",
    step1Title: "1. Teslimat & Adres Bilgileri",
    fullNameLabel: "Ad Soyad",
    fullNamePlaceholder: "Adınız ve soyadınız",
    phoneLabel: "Telefon Numarası",
    phonePlaceholder: "05XX XXX XX XX",
    emailLabel: "E-Posta Adresi",
    emailPlaceholder: "ornek@email.com",
    cityLabel: "İl / İlçe",
    cityPlaceholder: "Örn: İstanbul / Kadıköy",
    addressLabel: "Açık Adres",
    addressPlaceholder: "Mahalle, sokak, bina ve daire numarası...",
    orderNoteLabel: "Sipariş Notu (Opsiyonel)",
    orderNotePlaceholder: "Kargo kuryesi için ek notunuz varsa buraya yazabilirsiniz...",
    step2Title: "2. Ödeme Yöntemi",
    cardOptionTitle: "Kredi / Banka Kartı",
    cardOptionDesc: "Güvenli kartla ödeme yapın.",
    codOptionTitle: "Kapıda Ödeme",
    codOptionDesc: "Siparişinizi teslim alırken kapıda ödeyin.",
    cardHolderLabel: "Kart Üzerindeki İsim",
    cardNumberLabel: "Kart Numarası",
    expireDateLabel: "Son Kullanma Tarihi",
    cvcLabel: "CVC / Güvenlik Kodu",
    completeOrderButton: "Siparişi Onayla ve Tamamla",
    orderSuccessTitle: "Siparişiniz Başarıyla Alındı! 🎉",
    orderSuccessDesc: "Sipariş numaranız ile kargonuzu takip edebilirsiniz. Bizi tercih ettiğiniz için teşekkür ederiz!",
    backToHomeButton: "Ana Sayfaya Dön",
  },
  accountPage: {
    loginTitle: "Müşteri Girişi",
    loginSub: "Siparişlerinizi takip etmek veya hesabınıza ulaşmak için giriş yapın.",
    registerTitle: "Yeni Hesap Oluştur",
    registerSub: "Trend oyuncak ve bijuteri fırsatlarından yararlanmak için kaydolun.",
    loginTab: "Giriş Yap",
    registerTab: "Kayıt Ol",
    fullNameLabel: "Ad Soyad",
    fullNamePlaceholder: "Adınız ve soyadınız",
    emailLabel: "E-Posta Adresi",
    emailPlaceholder: "ornek@email.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "••••••••",
    loginSubmitButton: "Giriş Yap",
    registerSubmitButton: "Kayıt Ol & Hesabı Oluştur",
    adminBadge: "Yönetici",
    customerBadge: "Müşteri",
    goToAdminButton: "Yönetici Paneli",
    logoutButton: "Çıkış Yap",
    orderHistoryTitle: "Geçmiş Siparişleriniz",
    noOrdersMessage: "Henüz verilmiş bir siparişiniz bulunmamaktadır.",
    startShoppingLink: "Alışverişe Başla &rarr;",
  },
  brandStory: {
    title: "OtantikosConcept",
    content: "OtantikosConcept olarak hem eğlenceli hem estetik ürünleri sizlerle buluşturuyoruz. Trend olan NeeDoh Squishy Çin Mantısı ve şık bijuteri tasarımlarımızı keşfedin.",
  },
  footer: {
    trust1Title: "Özenli Paketleme",
    trust1Desc: "Hasarsız & Hızlı Teslimat",
    trust2Title: "Güvenli Ödeme",
    trust2Desc: "SSL Koruma",
    trust3Title: "Kolay İade",
    trust3Desc: "İade Garantisi",
    trust4Title: "Müşteri Desteği",
    trust4Desc: "Kesintisiz Hizmet",
    brandDescription: "OtantikosConcept - Trend oyuncak ve bijuteri online satış mağazası.",
    quickLinksTitle: "Hızlı Menü",
    categoriesTitle: "Kategoriler",
    customerServiceTitle: "Müşteri Hizmetleri",
    faqLink: "Sıkça Sorulan Sorular",
    shippingPolicyLink: "Kargo ve Teslimat",
    returnPolicyLink: "İade ve Değişim Koşulları",
    newsletterTitle: "E-Bülten",
    newsletterDesc: "Yeni ürünlerimiz ve haberler için bültenimize katılın.",
    newsletterPlaceholder: "E-posta adresiniz...",
    newsletterButton: "Abone Ol",
    paymentMethodsBadge: "",
    copyrightText: "© 2026 OtantikosConcept. Tüm hakları saklıdır.",
  },
};
