import { DataService } from '@/lib/data/store-data';
import AdminDashboardClientView from './AdminDashboardClientView';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [products, orders, profitSummary] = await Promise.all([
    DataService.getAllAdminProducts(),
    DataService.getOrders(),
    DataService.getProfitSummary(),
  ]);

  return (
    <AdminDashboardClientView
      initialProducts={products}
      initialOrders={orders}
      initialProfitSummary={profitSummary}
    />
  );
}
