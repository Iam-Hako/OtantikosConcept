import { NextResponse } from 'next/server';
import { PushNotificationService } from '@/lib/services/push-notification-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint parametresi zorunludur.' }, { status: 400 });
    }

    await PushNotificationService.removeSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: 'Bildirim aboneliği başarıyla kaldırıldı.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 });
  }
}
