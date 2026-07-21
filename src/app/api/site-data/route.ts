import { NextResponse } from "next/server";
import { loadStoreFromDisk, saveStoreToDisk, defaultAdminUser } from "@/lib/serverStore";

export async function GET() {
  const store = loadStoreFromDisk();

  // Hayalet kullanıcıları temizle ve primary admin garantisi ver
  store.registeredUsers = store.registeredUsers.filter(
    (u) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
  );

  if (!store.registeredUsers.some((u) => u.email.toLowerCase() === defaultAdminUser.email.toLowerCase())) {
    store.registeredUsers.unshift(defaultAdminUser);
  }

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
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const store = loadStoreFromDisk();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "185.190.140.22 (Türkiye / İstanbul)";

    if (action === "update-products") {
      store.products = payload;
    } else if (action === "update-texts") {
      store.siteTexts = { ...store.siteTexts, ...payload };
    } else if (action === "update-settings") {
      store.siteSettings = { ...store.siteSettings, ...payload };
    } else if (action === "update-chat") {
      const { userEmail, chat } = payload;
      store.supportChats[userEmail.toLowerCase()] = chat;
    } else if (action === "update-user-role") {
      const { userId, role } = payload;
      store.registeredUsers = store.registeredUsers.map((u) =>
        u.id === userId ? { ...u, role } : u
      );
    } else if (action === "update-user-password") {
      const { userId, newPassword } = payload;
      store.registeredUsers = store.registeredUsers.map((u) =>
        u.id === userId ? { ...u, password: newPassword } : u
      );
    } else if (action === "delete-user") {
      const { userId } = payload;
      store.registeredUsers = store.registeredUsers.filter((u) => u.id !== userId);
    } else if (action === "register-user") {
      if (payload && payload.email && payload.email.trim() !== "" && payload.name && payload.name.trim() !== "") {
        const existing = store.registeredUsers.find(
          (u) => u?.email?.toLowerCase() === payload.email.toLowerCase()
        );
        if (!existing) {
          const newUserWithMetadata = {
            ...payload,
            ipAddress: clientIp,
            lastLoginLocation: "Türkiye / İstanbul",
            lastLoginDate: new Date().toISOString(),
          };
          store.registeredUsers.push(newUserWithMetadata);
        } else {
          store.registeredUsers = store.registeredUsers.map((u) =>
            u.email.toLowerCase() === payload.email.toLowerCase()
              ? {
                  ...u,
                  ipAddress: clientIp,
                  lastLoginLocation: "Türkiye / İstanbul",
                  lastLoginDate: new Date().toISOString(),
                }
              : u
          );
        }
      }
    }

    // Hayalet kullanıcıları temizle
    store.registeredUsers = store.registeredUsers.filter(
      (u) => u && u.email && u.email.trim() !== "" && u.name && u.name.trim() !== ""
    );

    if (!store.registeredUsers.some((u) => u.email.toLowerCase() === defaultAdminUser.email.toLowerCase())) {
      store.registeredUsers.unshift(defaultAdminUser);
    }

    // Diske doğrudan veritabanı yazımı yap
    saveStoreToDisk(store);

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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
