import { PushNotificationService } from '@/lib/services/push-notification-service';
import AdminPushNotificationsClientView from './AdminPushNotificationsClientView';

export const dynamic = 'force-dynamic';

export default async function AdminPushNotificationsPage() {
  const initialStats = await PushNotificationService.getStats();
  return <AdminPushNotificationsClientView initialStats={initialStats} />;
}
