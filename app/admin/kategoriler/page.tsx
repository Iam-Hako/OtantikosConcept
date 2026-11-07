import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminCategoriesClientView from './AdminCategoriesClientView';

export const metadata: Metadata = {
  title: 'Kategoriler | Otantik Konsept Yönetim',
  description: 'E-ticaret kategorilerini yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const initialCategories = await DataService.getCategories();

  return <AdminCategoriesClientView initialCategories={initialCategories} />;
}
