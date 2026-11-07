import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DataService } from '@/lib/data/store-data';
import { safeDecodeURIComponent } from '@/lib/utils/format';
import ProductDetailClientView from './ProductDetailClientView';

interface ProductDetailPageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const rawSlug = params?.slug || '';
  const slug = safeDecodeURIComponent(rawSlug);

  const product = await DataService.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Otantik Konsept',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }

  const validImages = (product.images || []).filter(
    (img) => img.image_url && !img.image_url.includes('logo.webp')
  );
  const coverImage = validImages.find((img) => img.is_cover)?.image_url || validImages[0]?.image_url;

  return {
    title: `${product.name} | Otantik Konsept Tahtakale`,
    description: product.description ? product.description.slice(0, 160) : `${product.name} en uygun fiyat ve toptan avantajlarıyla Otantik Konsept'te.`,
    openGraph: {
      title: `${product.name} | Otantik Konsept`,
      description: product.description ? product.description.slice(0, 160) : undefined,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const rawSlug = params?.slug || '';
  const slug = safeDecodeURIComponent(rawSlug);

  const product = await DataService.getProductBySlug(slug);

  if (!product) {
    // If not found by slug, let client attempt fallback or show not found
  }

  const [allProducts, questions, reviews] = await Promise.all([
    DataService.getProducts(),
    product ? DataService.getQuestions(product.id) : Promise.resolve([]),
    product ? DataService.getReviews(product.id) : Promise.resolve([]),
  ]);

  return (
    <ProductDetailClientView
      initialProduct={product}
      initialAllProducts={allProducts}
      initialQuestions={questions}
      initialReviews={reviews}
      slug={slug}
    />
  );
}
