import { NextResponse } from 'next/server';
import { PushNotificationService } from '@/lib/services/push-notification-service';

export async function GET() {
  return NextResponse.json({
    publicKey: PushNotificationService.getVapidPublicKey(),
  });
}
