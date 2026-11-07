import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminReturnsClientView from './AdminReturnsClientView';

export const metadata: Metadata = {
  title: 'İade & Değişim Talepleri | Otantik Konsept Yönetim',
  description: 'Müşteri iade ve değişim (RMA) taleplerini inceleyin ve yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage() {
  const initialReturns = await DataService.getReturns();

  return <AdminReturnsClientView initialReturns={initialReturns} />;
}
