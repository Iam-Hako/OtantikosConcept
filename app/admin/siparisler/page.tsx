import { DataService } from '@/lib/data/store-data';
import AdminOrdersClientView from './AdminOrdersClientView';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await DataService.getOrders();
  return <AdminOrdersClientView initialOrders={orders} />;
}
