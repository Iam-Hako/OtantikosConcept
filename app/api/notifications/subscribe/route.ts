import { NextResponse } from 'next/server';
import { PushNotificationService } from '@/lib/services/push-notification-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';

    const { endpoint, keys, user_id } = body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Geçersiz abonelik verisi.' }, { status: 400 });
    }

    const res = await PushNotificationService.saveSubscription({
      endpoint,
      keys,
      user_id: user_id || null,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: res.isNew ? 'Bildirim aboneliği başarıyla oluşturuldu.' : 'Abonelik güncellendi.',
      isNew: res.isNew,
    });
  } catch (err: any) {
    console.error('[API Subscribe Error]', err);
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 });
  }
}
