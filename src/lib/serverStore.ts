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

const defaultAdminUser: RegisteredUser = {
  id: "usr-admin-primary",
  email: HARDCODED_ADMIN.email,
  password: HARDCODED_ADMIN.password,
  name: HARDCODED_ADMIN.name,
  role: "admin",
  createdAt: new Date().toISOString(),
  ipAddress: "127.0.0.1 (Yönetici)",
  lastLoginLocation: "Türkiye / İstanbul",
  lastLoginDate: new Date().toISOString(),
};

const getStoreFilePath = () => {
  return path.join(process.cwd(), "src", "data", "persistentStore.json");
};

const loadStoreFromDisk = (): GlobalStore => {
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        // Deep merge siteTexts with DEFAULT_SITE_TEXTS to guarantee no missing fields
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

        const usersList: RegisteredUser[] = Array.isArray(parsed.registeredUsers)
          ? parsed.registeredUsers.filter(
              (u: RegisteredUser) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
            )
          : [defaultAdminUser];

        // Guarantee primary admin user exists
        const hasAdmin = usersList.some(
          (u) => u.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()
        );
        if (!hasAdmin) {
          usersList.unshift(defaultAdminUser);
        }

        return {
          products: parsed.products || INITIAL_PRODUCTS,
          siteTexts: mergedTexts,
          siteSettings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.siteSettings || {}) },
          supportChats: parsed.supportChats || {},
          registeredUsers: usersList,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load persistent store from disk:", e);
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
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(storeData, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save persistent store to disk:", e);
  }
};

const g = global as unknown as { __otantikos_global_store?: GlobalStore };

if (!g.__otantikos_global_store) {
  g.__otantikos_global_store = loadStoreFromDisk();
}

export const store = g.__otantikos_global_store;
