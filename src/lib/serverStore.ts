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
};

const globalStore: GlobalStore = {
  products: INITIAL_PRODUCTS,
  siteTexts: DEFAULT_SITE_TEXTS,
  siteSettings: DEFAULT_SITE_SETTINGS,
  supportChats: {},
  registeredUsers: [defaultAdminUser],
};

const g = global as unknown as { __otantikos_global_store?: GlobalStore };

if (!g.__otantikos_global_store) {
  g.__otantikos_global_store = globalStore;
} else {
  // Sunucu yeniden başlatıldıysa, admin kullanıcısının hep mevcut olduğundan emin ol
  const existingStore = g.__otantikos_global_store;
  const hasAdmin = existingStore.registeredUsers.some(
    (u) => u?.email?.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase()
  );
  if (!hasAdmin) {
    existingStore.registeredUsers.push(defaultAdminUser);
  }

  // Hayalet kullanıcıları temizle (ismi veya e-postası boş olanlar)
  existingStore.registeredUsers = existingStore.registeredUsers.filter(
    (u) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
  );
}

export const store = g.__otantikos_global_store;
