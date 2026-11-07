import { Metadata } from 'next';
import { Suspense } from 'react';
import { DataService } from '@/lib/data/store-data';
import OrderTrackingClientView from './OrderTrackingClientView';

export const metadata: Metadata = {
  title: 'Sipariş Takibi | Otantik Konsept',
  description: 'Otantik Konsept siparişinizin kargo ve hazırlık durumunu anında sorgulayın.',
};

export const dynamic = 'force-dynamic';

interface OrderTrackingPageProps {
  searchParams?: {
    order_number?: string;
    siparis?: string;
    email?: string;
  };
}

export default async function OrderTrackingPage({ searchParams }: OrderTrackingPageProps) {
  const orderNumber = searchParams?.order_number || searchParams?.siparis || '';
  const email = searchParams?.email || '';

  let initialOrder = null;
  if (orderNumber) {
    try {
      initialOrder = await DataService.getOrderByNumber(orderNumber, email);
    } catch {
      initialOrder = null;
    }
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Sipariş takip masası yükleniyor...</div>}>
      <OrderTrackingClientView 
        initialOrder={initialOrder} 
        initialOrderNumber={orderNumber} 
        initialEmail={email} 
      />
    </Suspense>
  );
}
