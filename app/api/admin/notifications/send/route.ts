import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { PushNotificationService } from '@/lib/services/push-notification-service';

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, url, image_url } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Bildirim başlığı ve mesajı zorunludur.' }, { status: 400 });
    }

    const result = await PushNotificationService.sendBroadcastNotification({
      title: title.trim(),
      body: message.trim(),
      url: url?.trim() || '/',
      image: image_url?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Bildirim ${result.sent} aktif cihaza başarıyla iletildi.`,
      result,
    });
  } catch (err: any) {
    console.error('[Admin Send Notification Error]', err);
    return NextResponse.json({ error: err.message || 'Bildirim gönderilemedi.' }, { status: 500 });
  }
}
