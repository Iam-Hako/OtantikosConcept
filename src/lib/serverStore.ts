import fs from "fs";
import path from "path";
import https from "https";
import { Product, SiteSettings, INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { SiteTexts, DEFAULT_SITE_TEXTS } from "@/data/siteTexts";
import { RegisteredUser, ActiveVisitorSession, HARDCODED_ADMIN, defaultAdminUser } from "@/lib/constants";
import { SupportChat } from "@/components/LiveChat";

export interface GlobalStore {
  products: Product[];
  siteTexts: SiteTexts;
  siteSettings: SiteSettings;
  supportChats: Record<string, SupportChat>;
  registeredUsers: RegisteredUser[];
  activeVisitors: Record<string, ActiveVisitorSession>;
}

export { defaultAdminUser };

// 100% CANLI KESİNTİSİZ SUPABASE RESMİ KURUMSAL VERİTABANI VE BULUT MOTORU
const SUPABASE_URL = "https://ylsllngysdilkziptqzr.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsc2xsbmd5c2RpbGt6aXB0cXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY1NDIwMCwiZXhwIjoyMTAwMjMwMjAwfQ.JDo2K5SZxjzLjbvRtcDM2g8coPdPuyCivDHhEyL01qs";

let inMemoryStoreCache: GlobalStore | null = null;

const getWritableFilePath = () => path.join("/tmp", "otantikos_persistentStore.json");
const getSeedFilePath = () => path.join(process.cwd(), "src", "data", "persistentStore.json");

const httpGetCloudStore = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Authenticated endpoint CDN cache'i 100% bypass eder
    const fetchUrl = `${SUPABASE_URL}/storage/v1/object/authenticated/otantikos_store/store.json?t=${Date.now()}`;
    https
      .get(
        fetchUrl,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            Accept: "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(body));
              } else {
                reject(new Error(`Supabase Storage GET Status: ${res.statusCode}`));
              }
            } catch (e) {
              reject(e);
            }
          });
        }
      )
      .on("error", (e) => reject(e));
  });
};

const httpPutCloudStore = (storeData: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(storeData);
    const req = https.request(
      `${SUPABASE_URL}/storage/v1/object/otantikos_store/store.json`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "x-upsert": "true",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
          } else {
            reject(new Error(`Supabase Storage POST Status: ${res.statusCode}`));
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
    console.error("Native Supabase Cloud DB fetch exception:", e);
  }

  const diskStore = loadStoreFromDisk();
  inMemoryStoreCache = diskStore;
  return diskStore;
};

export const fetchCloudStore = async (): Promise<GlobalStore> => {
  if (inMemoryStoreCache) {
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
    console.error("Native Supabase Cloud DB save exception:", e);
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
      activeVisitors: {},
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

  const nowTime = Date.now();
  const cleanVisitors: Record<string, ActiveVisitorSession> = {};
  if (parsed.activeVisitors && typeof parsed.activeVisitors === "object") {
    Object.entries(parsed.activeVisitors).forEach(([vId, session]: [string, any]) => {
      if (session && session.lastPing) {
        const pingTime = new Date(session.lastPing).getTime();
        if (Math.abs(nowTime - pingTime) < 60000) {
          cleanVisitors[vId] = session;
        }
      }
    });
  }

  return {
    products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
    siteTexts: mergedTexts,
    siteSettings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.siteSettings || {}) },
    supportChats: parsed.supportChats && typeof parsed.supportChats === "object" ? parsed.supportChats : {},
    registeredUsers: usersList,
    activeVisitors: cleanVisitors,
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
    activeVisitors: {},
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
