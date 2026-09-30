import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { PushNotificationService } from '@/lib/services/push-notification-service';

export async function GET() {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 403 });
    }

    const stats = await PushNotificationService.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'İstatistikler alınamadı.' }, { status: 500 });
  }
}
