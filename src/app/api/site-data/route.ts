import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      products: store.products,
      siteTexts: store.siteTexts,
      siteSettings: store.siteSettings,
      supportChats: store.supportChats,
      registeredUsers: store.registeredUsers,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === "update-products") {
      store.products = payload;
    } else if (action === "update-texts") {
      store.siteTexts = payload;
    } else if (action === "update-settings") {
      store.siteSettings = payload;
    } else if (action === "update-chat") {
      const { userEmail, chat } = payload;
      store.supportChats[userEmail.toLowerCase()] = chat;
    } else if (action === "update-user-role") {
      const { userId, role } = payload;
      store.registeredUsers = store.registeredUsers.map((u) =>
        u.id === userId ? { ...u, role } : u
      );
    } else if (action === "register-user") {
      const existing = store.registeredUsers.find(
        (u) => u.email.toLowerCase() === payload.email.toLowerCase()
      );
      if (!existing) {
        store.registeredUsers.push(payload);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        products: store.products,
        siteTexts: store.siteTexts,
        siteSettings: store.siteSettings,
        supportChats: store.supportChats,
        registeredUsers: store.registeredUsers,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
