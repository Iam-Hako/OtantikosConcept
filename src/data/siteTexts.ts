export interface SiteTexts {
  header: {
    topbarText: string;
    searchPlaceholder: string;
    navHome: string;
    navAllProducts: string;
    navSquishy: string;
    navJewelry: string;
    accountLabel: string;
    cartLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    highlightTitle: string;
    description: string;
    buttonText: string;
    secondaryButtonText: string;
  };
  features: {
    sectionTitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
  };
  categoriesSection: {
    title: string;
    subtitle: string;
  };
  productsSection: {
    title: string;
    subtitle: string;
    emptyCatalogTitle: string;
    emptyCatalogDesc: string;
    emptyCatalogAdminAction: string;
  };
  brandStory: {
    title: string;
    content: string;
  };
  footer: {
    brandDescription: string;
    quickLinksTitle: string;
    categoriesTitle: string;
    contactTitle: string;
    copyrightText: string;
  };
  cartPage: {
    title: string;
    emptyCartTitle: string;
    emptyCartDesc: string;
    subtotal: string;
    shipping: string;
    total: string;
    checkoutButton: string;
  };
  checkoutPage: {
    title: string;
    subtitle: string;
    paymentSectionTitle: string;
    completeOrderButton: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
  };
}

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  header: {
    topbarText: "OtantikosConcept • Trend Oyuncaklar, NeeDoh Squishy ve Şık Bijuteri Dünyası",
    searchPlaceholder: "Ürün, squishy veya bijuteri ara...",
    navHome: "Ana Sayfa",
    navAllProducts: "Tüm Ürünler",
    navSquishy: "Trend Oyuncak & Squishy",
    navJewelry: "Bijuteri & Takı",
    accountLabel: "Hesabım",
    cartLabel: "Sepetim",
  },
  hero: {
    badge: "✨ Yeni Sezon & Trend Koleksiyon",
    title: "Trend Oyuncaklar & Özgün",
    highlightTitle: "Bijuteri Koleksiyonu",
    description: "NeeDoh Squishy Çin Mantısı, stres oyuncakları, trend hediyelikler ve göz alıcı bijuteri takı tasarımları tek adreste!",
    buttonText: "Koleksiyonu Keşfet",
    secondaryButtonText: "Tüm Ürünler",
  },
  features: {
    sectionTitle: "Neden OtantikosConcept?",
    feature1Title: "Hızlı Gönderim",
    feature1Desc: "Siparişleriniz özenle paketlenip kısa sürede kargolanır.",
    feature2Title: "Orijinal Trend Ürünler",
    feature2Desc: "En çok aranan NeeDoh Squishy Çin Mantısı ve popüler ürünler.",
    feature3Title: "Güvenli Alışveriş",
    feature3Desc: "256-bit SSL şifreleme ve güvenli ödeme seçenekleri.",
    feature4Title: "Müşteri Memnuniyeti",
    feature4Desc: "7/24 destek ve hızlı müşteri hizmetleri ekibi.",
  },
  categoriesSection: {
    title: "Kategorileri Keşfedin",
    subtitle: "İhtiyacınıza uygun trend oyuncak ve şık bijuteri kategorileri",
  },
  productsSection: {
    title: "Öne Çıkan Ürünler",
    subtitle: "En çok tercih edilen trend oyuncaklar ve bijuteri tasarımları",
    emptyCatalogTitle: "Henüz Ürün Eklenmedi",
    emptyCatalogDesc: "Mağazanız şu an satışa hazır! Yönetici panelinden ilk ürünlerinizi ekleyebilirsiniz.",
    emptyCatalogAdminAction: "Yönetici Panelinden Ürün Ekle",
  },
  brandStory: {
    title: "OtantikosConcept Hikayesi",
    content: "OtantikosConcept olarak hem eğlenceli hem estetik ürünleri sizlerle buluşturuyoruz. Trend olan NeeDoh Squishy Çin Mantısı stres oyuncaklarından, zarafetinizi tamamlayacak özel bijuteri takı tasarımlarına kadar geniş ürün yelpazemizle hizmet veriyoruz.",
  },
  footer: {
    brandDescription: "OtantikosConcept - Trend oyuncaklar, NeeDoh Squishy Çin Mantısı ve özgün bijuteri tasarımları online satış mağazası.",
    quickLinksTitle: "Hızlı Bağlantılar",
    categoriesTitle: "Kategoriler",
    contactTitle: "İletişim & Destek",
    copyrightText: "© 2026 OtantikosConcept. Tüm hakları saklıdır.",
  },
  cartPage: {
    title: "Alışveriş Sepetiniz",
    emptyCartTitle: "Sepetiniz Boş",
    emptyCartDesc: "Henüz sepetinize ürün eklemediniz. Ürünler sayfamızdan alışverişe başlayabilirsiniz.",
    subtotal: "Ara Toplam",
    shipping: "Kargo Ücreti",
    total: "Genel Toplam",
    checkoutButton: "Ödemeye Geç",
  },
  checkoutPage: {
    title: "Ödeme ve Teslimat",
    subtitle: "Lütfen teslimat bilgilerinizi ve ödeme yönteminizi seçin",
    paymentSectionTitle: "Ödeme Yöntemi",
    completeOrderButton: "Siparişi Tamamla",
    orderSuccessTitle: "Siparişiniz Başarıyla Alındı! 🎉",
    orderSuccessDesc: "Siparişiniz hazırlanmak üzere işleme alındı. Bizi tercih ettiğiniz için teşekkür ederiz!",
  },
};
