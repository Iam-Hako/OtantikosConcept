import { NextResponse } from 'next/server';
import { PushNotificationService } from '@/lib/services/push-notification-service';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { isSafePushEndpoint, sanitizeInput } from '@/lib/security/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 10 subscription requests per minute per IP
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'push-subscribe',
      limit: 10,
      windowSeconds: 60,
      errorMessage: 'Çok fazla bildirim aboneliği denemesi yapıldı. Lütfen biraz bekleyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';

    const { endpoint, keys, user_id, phone, platform } = body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Geçersiz abonelik verisi.' }, { status: 400 });
    }

    // 2. SSRF Protection: Endpoint must be valid HTTPS and not point to private/internal IPs
    if (!isSafePushEndpoint(endpoint)) {
      return NextResponse.json(
        { error: 'Geçersiz veya güvensiz push bildirim servisi uç noktası (endpoint).' },
        { status: 400 }
      );
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanUserId = user_id && UUID_REGEX.test(user_id) ? user_id : null;
    const cleanPhone = phone ? sanitizeInput(phone, 20) : null;
    const cleanPlatform = ['ios', 'android', 'desktop'].includes(platform) ? platform : undefined;

    const res = await PushNotificationService.saveSubscription({
      endpoint: String(endpoint).trim(),
      keys: {
        p256dh: String(keys.p256dh).trim(),
        auth: String(keys.auth).trim(),
      },
      user_id: cleanUserId,
      phone: cleanPhone,
      user_agent: sanitizeInput(userAgent, 200),
      platform: cleanPlatform,
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
