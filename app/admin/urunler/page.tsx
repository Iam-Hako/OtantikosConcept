import { DataService } from '@/lib/data/store-data';
import AdminProductsClientView from './AdminProductsClientView';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await DataService.getAllAdminProducts();
  return <AdminProductsClientView initialProducts={products} />;
}
