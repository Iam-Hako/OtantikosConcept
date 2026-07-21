import fs from "fs";
import path from "path";
import https from "https";
import { Product, SiteSettings, INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";
import { RegisteredUser, HARDCODED_ADMIN, defaultAdminUser } from "@/lib/constants";
import { SupportChat } from "@/components/LiveChat";

export interface GlobalStore {
  products: Product[];
  siteTexts: SiteTexts;
  siteSettings: SiteSettings;
  supportChats: Record<string, SupportChat>;
  registeredUsers: RegisteredUser[];
}

export { defaultAdminUser };

// 100% CANLI KESİNTİSİZ BULUT VERİTABANI BLOB URL'Sİ (NODE HTTPS ENGINE)
const CLOUD_DB_URL = "https://jsonblob.com/api/jsonBlob/019f85f9-d806-7a17-9be6-11288979e091";

let inMemoryStoreCache: GlobalStore | null = null;

const getWritableFilePath = () => path.join("/tmp", "otantikos_persistentStore.json");
const getSeedFilePath = () => path.join(process.cwd(), "src", "data", "persistentStore.json");

const httpGetCloudStore = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    https
      .get(`${CLOUD_DB_URL}?t=${Date.now()}`, { headers: { Accept: "application/json" } }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              resolve(JSON.parse(body));
            } else {
              reject(new Error(`HTTP GET Status: ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (e) => reject(e));
  });
};

const httpPutCloudStore = (storeData: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(storeData);
    const req = https.request(
      CLOUD_DB_URL,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          Accept: "application/json",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
          } else {
            reject(new Error(`HTTP PUT Status: ${res.statusCode}`));
          }
        });
      }
    );

    req.on("error", (e) => reject(e));
    req.write(payload);
    req.end();
  });
};

export const fetchCloudStoreFromNetwork = async (): Promise<GlobalStore> => {
  try {
    const parsed = await httpGetCloudStore();
    if (parsed && typeof parsed === "object") {
      const sanitized = sanitizeStore(parsed);
      inMemoryStoreCache = sanitized;
      return sanitized;
    }
  } catch (e) {
    console.error("Native HTTPS Cloud DB fetch exception:", e);
  }

  const diskStore = loadStoreFromDisk();
  inMemoryStoreCache = diskStore;
  return diskStore;
};

export const fetchCloudStore = async (): Promise<GlobalStore> => {
  if (inMemoryStoreCache) {
    // Arka planda ag verisini guncelle, aninda in-memory veriyi dondur
    fetchCloudStoreFromNetwork().catch(() => {});
    return inMemoryStoreCache;
  }
  return fetchCloudStoreFromNetwork();
};

export const saveCloudStore = async (storeData: GlobalStore): Promise<GlobalStore> => {
  const sanitized = sanitizeStore(storeData);
  inMemoryStoreCache = sanitized;

  try {
    await httpPutCloudStore(sanitized);
  } catch (e) {
    console.error("Native HTTPS Cloud DB save exception:", e);
  }

  saveStoreToDisk(sanitized);
  return sanitized;
};

export const sanitizeStore = (parsed: any): GlobalStore => {
  if (!parsed || typeof parsed !== "object") {
    return {
      products: INITIAL_PRODUCTS,
      siteTexts: DEFAULT_SITE_TEXTS,
      siteSettings: DEFAULT_SITE_SETTINGS,
      supportChats: {},
      registeredUsers: [defaultAdminUser],
    };
  }

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
        (u: any) => u && typeof u === "object" && u.email && typeof u.email === "string" && u.email.trim() !== "" && u.name && typeof u.name === "string" && u.name.trim() !== ""
      )
    : [defaultAdminUser];

  const adminEmail = (HARDCODED_ADMIN?.email || "chessvip11@gmail.com").toLowerCase();
  const hasAdmin = usersList.some(
    (u) => u && u.email && typeof u.email === "string" && u.email.trim().toLowerCase() === adminEmail
  );

  if (!hasAdmin) {
    usersList.unshift(defaultAdminUser);
  }

  return {
    products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
    siteTexts: mergedTexts,
    siteSettings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.siteSettings || {}) },
    supportChats: parsed.supportChats && typeof parsed.supportChats === "object" ? parsed.supportChats : {},
    registeredUsers: usersList,
  };
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
        return sanitizeStore(parsed);
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
    const writablePath = getWritableFilePath();
    const dir = path.dirname(writablePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const adminEmail = (HARDCODED_ADMIN?.email || "chessvip11@gmail.com").toLowerCase();
    if (!storeData.registeredUsers.some(u => (u?.email || "").toLowerCase() === adminEmail)) {
      storeData.registeredUsers.unshift(defaultAdminUser);
    }

    fs.writeFileSync(writablePath, JSON.stringify(storeData, null, 2), "utf-8");

    try {
      const seedPath = getSeedFilePath();
      if (fs.existsSync(path.dirname(seedPath))) {
        fs.writeFileSync(seedPath, JSON.stringify(storeData, null, 2), "utf-8");
      }
    } catch (e) {}
  } catch (e) {
    console.error("Failed to save store to disk:", e);
  }
};
