import { Metadata } from 'next';
import { Suspense } from 'react';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { safeDecodeURIComponent } from '@/lib/utils/format';
import CategoryClientView from './CategoryClientView';

interface CategoryPageProps {
  params: { slug: string };
  searchParams?: { ara?: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const rawSlug = params?.slug || '';
  const slug = safeDecodeURIComponent(rawSlug);

  if (!slug || slug === 'tum-urunler') {
    return {
      title: 'Tüm Ürünler | Otantik Konsept',
      description: 'Tahtakale Eminönü toptan ve perakende tüm ürün koleksiyonunu keşfedin.',
    };
  }

  const categories = await DataService.getCategories();
  const found = categories.find((c) => c.slug === slug || normalizeTurkish(c.name) === normalizeTurkish(slug));

  if (found) {
    return {
      title: `${found.name} Modelleri & Fiyatları | Otantik Konsept`,
      description: found.description || `${found.name} kategorisindeki en kaliteli ürünler toptan ve perakende uygun fiyatlarla Otantik Konsept'te.`,
    };
  }

  return {
    title: `${slug} | Otantik Konsept`,
    description: 'Otantik Konsept Tahtakale Eminönü ürün koleksiyonu.',
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const rawSlug = params?.slug || '';
  const slug = safeDecodeURIComponent(rawSlug);

  const [initialProducts, initialCategories] = await Promise.all([
    DataService.getPublicProducts(),
    DataService.getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Koleksiyon yükleniyor...</div>}>
      <CategoryClientView
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        slug={slug}
      />
    </Suspense>
  );
}
