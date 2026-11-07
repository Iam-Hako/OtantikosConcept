import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import AdminQAClientView from './AdminQAClientView';

export const metadata: Metadata = {
  title: 'Soru-Cevap Moderasyonu | Otantik Konsept Yönetim',
  description: 'Ürün sorularını inceleyin, yanıtlayın ve yayınlayın.',
};

export const dynamic = 'force-dynamic';

export default async function AdminQAPage() {
  const [initialQuestions, initialProducts] = await Promise.all([
    DataService.getQuestions(),
    DataService.getAllAdminProducts(),
  ]);

  return <AdminQAClientView initialQuestions={initialQuestions} initialProducts={initialProducts} />;
}
