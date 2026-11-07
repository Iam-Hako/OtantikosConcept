import { Metadata } from 'next';
import { Suspense } from 'react';
import { DataService } from '@/lib/data/store-data';
import { actionGetCargoLabels } from '@/app/actions/ecommerce-actions';
import AdminCargoLabelClientView from './AdminCargoLabelClientView';

export const metadata: Metadata = {
  title: 'Kargo Etiketi & Adres Basımı | Otantik Konsept Yönetim',
  description: 'Siparişler için termal ve A4 kargo adresi etiketleri oluşturun ve yazdırın.',
};

export const dynamic = 'force-dynamic';

export default async function KargoEtiketiPage() {
  const [labelsRes, initialOrders] = await Promise.all([
    actionGetCargoLabels(),
    DataService.getOrders(),
  ]);

  const initialLabels = labelsRes.success && labelsRes.data ? labelsRes.data : [];

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Yükleniyor...</div>}>
      <AdminCargoLabelClientView initialLabels={initialLabels} initialOrders={initialOrders} />
    </Suspense>
  );
}
