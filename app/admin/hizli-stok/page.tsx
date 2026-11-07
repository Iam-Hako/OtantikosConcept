import { DataService } from '@/lib/data/store-data';
import QuickStockClientView from './QuickStockClientView';

export const dynamic = 'force-dynamic';

export default async function QuickStockPage() {
  const products = await DataService.getAllAdminProducts();
  return <QuickStockClientView initialProducts={products} />;
}
