import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otpStore";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "E-posta ve doğrulama kodu zorunludur." }, { status: 400 });
    }

    const result = verifyOTP(email, code);

    if (result.valid) {
      return NextResponse.json({ success: true, message: "E-posta başarıyla doğrulandı." });
    } else {
      return NextResponse.json({ success: false, error: result.message || "Kod doğrulanamadı." }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
