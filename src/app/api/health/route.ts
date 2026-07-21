import { NextResponse } from "next/server";
import { fetchCloudStore } from "@/lib/serverStore";

export async function GET() {
  const startTime = Date.now();
  try {
    const store = await fetchCloudStore();
    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "ONLINE",
      serverTimestamp: new Date().toISOString(),
      database: {
        type: "Live Cloud Database Engine",
        status: "CONNECTED",
        latencyMs: latency,
        totalRegisteredUsers: store.registeredUsers.length,
        totalProducts: store.products.length,
        activeChats: Object.keys(store.supportChats).length,
      },
      hosting: {
        environment: process.env.NODE_ENV || "production",
        platform: "Vercel Serverless + Cloud DB",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
