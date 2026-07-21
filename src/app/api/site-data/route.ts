import { NextRequest, NextResponse } from "next/server";
import { fetchCloudStore, saveCloudStore, defaultAdminUser, sanitizeStore } from "@/lib/serverStore";
import { INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from "@/data/mockData";
import { DEFAULT_SITE_TEXTS } from "@/data/siteTexts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Pass request URL to ensure Next.js never bakes this route into static pre-render
  const _reqUrl = request.url;
  const store = await fetchCloudStore();

  return NextResponse.json(
    {
      success: true,
      data: {
        products: store.products,
        siteTexts: store.siteTexts,
        siteSettings: store.siteSettings,
        supportChats: store.supportChats,
        registeredUsers: store.registeredUsers,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const store = await fetchCloudStore();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "185.190.140.22 (Türkiye / İstanbul)";

    if (action === "hard-reset") {
      const resetStore = {
        products: INITIAL_PRODUCTS,
        siteTexts: DEFAULT_SITE_TEXTS,
        siteSettings: DEFAULT_SITE_SETTINGS,
        supportChats: {},
        registeredUsers: [defaultAdminUser],
      };
      const finalReset = await saveCloudStore(resetStore);
      return NextResponse.json({
        success: true,
        data: finalReset,
      });
    }

    if (action === "update-products") {
      store.products = payload;
    } else if (action === "update-texts") {
      store.siteTexts = { ...store.siteTexts, ...payload };
    } else if (action === "update-settings") {
      store.siteSettings = { ...store.siteSettings, ...payload };
    } else if (action === "update-chat") {
      if (payload && payload.userEmail) {
        const emailKey = (payload.userEmail || "").trim().toLowerCase();
        if (emailKey) {
          store.supportChats[emailKey] = payload.chat;
        }
      }
    } else if (action === "update-user-role") {
      const { userId, email, role } = payload || {};
      const cleanEmail = (email || "").toLowerCase().trim();
      store.registeredUsers = store.registeredUsers.map((u) => {
        if (!u) return u;
        const matchId = userId && u.id === userId;
        const matchEmail = cleanEmail && (u.email || "").toLowerCase().trim() === cleanEmail;
        if (matchId || matchEmail) {
          return { ...u, role };
        }
        return u;
      });
    } else if (action === "update-user-password") {
      const { userId, newPassword } = payload || {};
      if (userId) {
        store.registeredUsers = store.registeredUsers.map((u) =>
          u && u.id === userId ? { ...u, password: newPassword } : u
        );
      }
    } else if (action === "delete-user") {
      const { userId } = payload || {};
      if (userId) {
        store.registeredUsers = store.registeredUsers.filter((u) => u && u.id !== userId);
      }
    } else if (action === "register-user") {
      if (payload && payload.email && payload.email.trim() !== "" && payload.name && payload.name.trim() !== "") {
        const cleanPayloadEmail = payload.email.trim().toLowerCase();

        const existingIndex = store.registeredUsers.findIndex(
          (u) => u && u.email && u.email.trim().toLowerCase() === cleanPayloadEmail
        );

        if (existingIndex === -1) {
          const newUserWithMetadata = {
            ...payload,
            email: cleanPayloadEmail,
            ipAddress: clientIp,
            lastLoginLocation: "Türkiye / İstanbul",
            lastLoginDate: new Date().toISOString(),
          };
          store.registeredUsers.push(newUserWithMetadata);
        } else {
          store.registeredUsers[existingIndex] = {
            ...store.registeredUsers[existingIndex],
            ...payload,
            email: cleanPayloadEmail,
            ipAddress: clientIp,
            lastLoginLocation: "Türkiye / İstanbul",
            lastLoginDate: new Date().toISOString(),
          };
        }
      }
    }

    const sanitized = sanitizeStore(store);

    // Bulut Veritabanına Yazımı Tamamla ve Son Veriyi Al
    const finalSavedStore = await saveCloudStore(sanitized);

    return NextResponse.json(
      {
        success: true,
        data: {
          products: finalSavedStore.products,
          siteTexts: finalSavedStore.siteTexts,
          siteSettings: finalSavedStore.siteSettings,
          supportChats: finalSavedStore.supportChats,
          registeredUsers: finalSavedStore.registeredUsers,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
