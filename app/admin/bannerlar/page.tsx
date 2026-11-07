import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminBannersClientView from './AdminBannersClientView';

export const metadata: Metadata = {
  title: 'Afişler & Banner Yönetimi | Otantik Konsept Yönetim',
  description: 'Ana sayfa afişlerini ve kaydırıcı bannerlarını yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const initialBanners = await DataService.getAllAdminBanners();

  return <AdminBannersClientView initialBanners={initialBanners} />;
}
