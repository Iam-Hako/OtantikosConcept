import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { setOTP } from "@/lib/otpStore";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 6 Haneli Gerçek Rastgele Kod Üret
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOTP(cleanEmail, code, 10);

    const smtpHost = process.env.SMTP_HOST || "smtppro.zoho.eu";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER || "destek@otantikosconcept.com";
    const smtpPass = process.env.SMTP_PASS || "x8JLYmmXYFJu";

    // Zoho SMTP Transporter Yapılandırması
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // SSL (port 465)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: smtpUser, // Zoho kısıtlamalarına tam uyum için birebir aynı adres
      to: cleanEmail,
      subject: `OtantikosConcept E-Posta Doğrulama Kodunuz: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E6DCD3; border-radius: 16px; background-color: #F8F5F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3E2E28; font-size: 24px; margin: 0;">OtantikosConcept</h1>
            <span style="color: #C86D51; text-transform: uppercase; font-size: 11px; font-weight: bold; letter-spacing: 2px;">Güvenlik Doğrulaması</span>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #E6DCD3; text-align: center;">
            <p style="color: #7C6354; font-size: 14px; margin-bottom: 16px;">
              Giriş / Kayıt işleminizi tamamlamak için aşağıdaki 6 haneli doğrulama kodunu kullanınız:
            </p>
            <div style="font-size: 32px; font-weight: bold; color: #C86D51; letter-spacing: 8px; font-family: monospace; margin: 16px 0; background-color: #F8F5F0; padding: 12px; border-radius: 12px; display: inline-block;">
              ${code}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 16px;">
              Bu kod 10 dakika boyunca geçerlidir. Bu işlemi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #7C6354; font-size: 11px;">
            © ${new Date().getFullYear()} OtantikosConcept. Tüm hakları saklıdır.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} adresine 6 haneli doğrulama kodunuz başarıyla gönderildi.`,
    });
  } catch (error: any) {
    console.error("Nodemailer SMTP Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `E-posta gönderilemedi: ${error?.message || "Zoho SMTP bağlantı hatası."}`,
      },
      { status: 500 }
    );
  }
}
