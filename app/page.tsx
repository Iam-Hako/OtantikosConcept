import { Metadata } from 'next';
import { DataService } from '@/lib/data/store-data';
import HomeClientView from '@/components/HomeClientView';

export const metadata: Metadata = {
  title: 'Otantik Konsept | Tahtakale Eminönü Toptan & Perakende Mağazası',
  description: 'Tahtakale Eminönü toptan ve perakende satış mağazası. Hediyelik eşya, kırtasiye, çanta, aksesuar, kozmetik ve trend ürünlerde en uygun fiyatlar.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [initialProducts, initialCategories, initialBanners] = await Promise.all([
    DataService.getPublicProducts(),
    DataService.getCategories(),
    DataService.getHomeBanners(),
  ]);

  return (
    <HomeClientView 
      initialProducts={initialProducts} 
      initialCategories={initialCategories} 
      initialBanners={initialBanners} 
    />
  );
}
