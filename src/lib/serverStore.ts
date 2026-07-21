import fs from "fs";
import path from "path";
import { Product, SiteSettings, INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";
import { RegisteredUser, HARDCODED_ADMIN } from "@/context/AuthContext";
import { SupportChat } from "@/components/LiveChat";

export interface GlobalStore {
  products: Product[];
  siteTexts: SiteTexts;
  siteSettings: SiteSettings;
  supportChats: Record<string, SupportChat>;
  registeredUsers: RegisteredUser[];
}

export const defaultAdminUser: RegisteredUser = {
  id: "usr-admin-primary",
  email: HARDCODED_ADMIN.email,
  password: HARDCODED_ADMIN.password,
  name: HARDCODED_ADMIN.name,
  role: "admin",
  createdAt: "2026-07-21T00:00:00.000Z",
  ipAddress: "127.0.0.1 (Yönetici)",
  lastLoginLocation: "Türkiye / İstanbul",
  lastLoginDate: "2026-07-21T00:00:00.000Z",
};

// Vercel Serverless ortamında tek yazılabilir dizin /tmp dizinidir.
// Kök dizindeki persistentStore.json ise başlangıç (seed) verisi olarak kullanılır.
const getWritableFilePath = () => {
  return path.join("/tmp", "otantikos_persistentStore.json");
};

const getSeedFilePath = () => {
  return path.join(process.cwd(), "src", "data", "persistentStore.json");
};

export const loadStoreFromDisk = (): GlobalStore => {
  try {
    const writablePath = getWritableFilePath();
    const seedPath = getSeedFilePath();

    let content = "";
    if (fs.existsSync(writablePath)) {
      content = fs.readFileSync(writablePath, "utf-8");
    } else if (fs.existsSync(seedPath)) {
      content = fs.readFileSync(seedPath, "utf-8");
    }

    if (content) {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        const mergedTexts: SiteTexts = {
          header: { ...DEFAULT_SITE_TEXTS.header, ...(parsed.siteTexts?.header || {}) },
          hero: { ...DEFAULT_SITE_TEXTS.hero, ...(parsed.siteTexts?.hero || {}) },
          categoriesSection: { ...DEFAULT_SITE_TEXTS.categoriesSection, ...(parsed.siteTexts?.categoriesSection || {}) },
          productsSection: { ...DEFAULT_SITE_TEXTS.productsSection, ...(parsed.siteTexts?.productsSection || {}) },
          productCard: { ...DEFAULT_SITE_TEXTS.productCard, ...(parsed.siteTexts?.productCard || {}) },
          catalogPage: { ...DEFAULT_SITE_TEXTS.catalogPage, ...(parsed.siteTexts?.catalogPage || {}) },
          productDetailPage: { ...DEFAULT_SITE_TEXTS.productDetailPage, ...(parsed.siteTexts?.productDetailPage || {}) },
          cartPage: { ...DEFAULT_SITE_TEXTS.cartPage, ...(parsed.siteTexts?.cartPage || {}) },
          checkoutPage: { ...DEFAULT_SITE_TEXTS.checkoutPage, ...(parsed.siteTexts?.checkoutPage || {}) },
          accountPage: { ...DEFAULT_SITE_TEXTS.accountPage, ...(parsed.siteTexts?.accountPage || {}) },
          brandStory: { ...DEFAULT_SITE_TEXTS.brandStory, ...(parsed.siteTexts?.brandStory || {}) },
          footer: { ...DEFAULT_SITE_TEXTS.footer, ...(parsed.siteTexts?.footer || {}) },
        };

        let usersList: RegisteredUser[] = Array.isArray(parsed.registeredUsers)
          ? parsed.registeredUsers.filter(
              (u: RegisteredUser) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
            )
          : [defaultAdminUser];

        const hasAdmin = usersList.some(
          (u) => u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()
        );

        if (!hasAdmin) {
          usersList.unshift(defaultAdminUser);
        }

        return {
          products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
          siteTexts: mergedTexts,
          siteSettings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.siteSettings || {}) },
          supportChats: parsed.supportChats || {},
          registeredUsers: usersList,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load store from disk:", e);
  }

  return {
    products: INITIAL_PRODUCTS,
    siteTexts: DEFAULT_SITE_TEXTS,
    siteSettings: DEFAULT_SITE_SETTINGS,
    supportChats: {},
    registeredUsers: [defaultAdminUser],
  };
};

export const saveStoreToDisk = (storeData: GlobalStore) => {
  try {
    // 1. Vercel Serverless /tmp yazılabilir alanına kaydet
    const writablePath = getWritableFilePath();
    const dir = path.dirname(writablePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!storeData.registeredUsers.some(u => u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase())) {
      storeData.registeredUsers.unshift(defaultAdminUser);
    }

    fs.writeFileSync(writablePath, JSON.stringify(storeData, null, 2), "utf-8");

    // 2. Yerel geliştirme ortamı için src/data/persistentStore.json üzerine yazmayı dene (Hata verirse yut)
    try {
      const seedPath = getSeedFilePath();
      if (fs.existsSync(path.dirname(seedPath))) {
        fs.writeFileSync(seedPath, JSON.stringify(storeData, null, 2), "utf-8");
      }
    } catch (e) {}
  } catch (e) {
    console.error("Failed to save store to writable /tmp disk:", e);
  }
};
