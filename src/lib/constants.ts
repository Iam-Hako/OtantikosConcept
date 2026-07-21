export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  ipAddress?: string;
  lastLoginLocation?: string;
  lastLoginDate?: string;
}

export interface ActiveVisitorSession {
  visitorId: string;
  ipAddress: string;
  location: string;
  activePage: string;
  userEmail?: string;
  userName?: string;
  isLoggedIn: boolean;
  lastPing: string;
  deviceInfo: string;
}

// Sabit Admin Hesabı Bilgileri (Sunucu ve İstemci Tarafından Ortak Kullanılır)
export const HARDCODED_ADMIN = {
  email: "chessvip11@gmail.com",
  password: "32843284FF",
  name: "Haktan Fetih Durmuş",
};

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
