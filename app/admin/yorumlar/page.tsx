import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminReviewsClientView from './AdminReviewsClientView';

export const metadata: Metadata = {
  title: 'Yorum Moderasyonu | Otantik Konsept Yönetim',
  description: 'Müşteri ürün yorumlarını ve puanlarını yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const [initialReviews, initialProducts] = await Promise.all([
    DataService.getReviews(),
    DataService.getAllAdminProducts(),
  ]);

  return <AdminReviewsClientView initialReviews={initialReviews} initialProducts={initialProducts} />;
}
