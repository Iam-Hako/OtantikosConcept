import { DataService } from '@/lib/data/store-data';
import KarZararClientView from './KarZararClientView';

export const dynamic = 'force-dynamic';

export default async function KarZararPage() {
  const [transactions, products, orders, profitStats, categories] = await Promise.all([
    DataService.getAccountingTransactions(),
    DataService.getAllAdminProducts(),
    DataService.getOrders(),
    DataService.getProductProfitStats(),
    DataService.getCategories(),
  ]);

  return (
    <KarZararClientView
      initialTransactions={transactions}
      initialProducts={products}
      initialCategories={categories}
      initialOrders={orders}
      initialProfitStats={profitStats}
    />
  );
}
