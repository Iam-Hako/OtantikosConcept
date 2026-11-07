import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminWholesaleClientView from './AdminWholesaleClientView';

export const metadata: Metadata = {
  title: 'Toptan Talepler | Otantik Konsept Yönetim',
  description: 'Müşterilerden gelen toptan teklif taleplerini inceleyin ve yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function AdminWholesalePage() {
  const initialRequests = await DataService.getWholesaleRequests();

  return <AdminWholesaleClientView initialRequests={initialRequests} />;
}
