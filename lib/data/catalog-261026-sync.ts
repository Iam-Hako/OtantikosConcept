import catalogData from './catalog-261026.json';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeTurkish } from './store-data';

export interface CatalogSeedImage {
  image_url: string;
  is_cover: boolean;
  display_order: number;
  alt_text: string;
}

export interface CatalogSeedVariant {
  name: string;
  value: string;
  stock: number;
  price_override: number | null;
  sku: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface CatalogSeedProduct {
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  stock: number;
  sku: string;
  short_description: string;
  description: string;
  is_new: boolean;
  is_featured: boolean;
  images: CatalogSeedImage[];
  variants: CatalogSeedVariant[];
}

export interface CatalogSyncResult {
  success: boolean;
  skipped?: boolean;
  insertedProducts: number;
  skippedExisting: number;
  insertedImages: number;
  insertedVariants: number;
  categoryCreated: boolean;
  error?: string;
}

const CATALOG_ITEMS = catalogData as CatalogSeedProduct[];

let seedCompletedInMemory = false;
let seedInFlightPromise: Promise<CatalogSyncResult> | null = null;

function normalizeLooseKey(text: string): string {
  return normalizeTurkish(text || '').replace(/[^a-z0-9]/g, '');
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function syncCatalog261026ToSupabase(): Promise<CatalogSyncResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      skipped: true,
      insertedProducts: 0,
      skippedExisting: 0,
      insertedImages: 0,
      insertedVariants: 0,
      categoryCreated: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY tanımlı değil.',
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch existing categories and resolve "Oyunlar" + "Kırtasiye & Aksesuar"
    const { data: catRows, error: catErr } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, display_order')
      .order('display_order', { ascending: true });

    if (catErr) {
      return {
        success: false,
        insertedProducts: 0,
        skippedExisting: 0,
        insertedImages: 0,
        insertedVariants: 0,
        categoryCreated: false,
        error: `Kategori okuma hatası: ${catErr.message}`,
      };
    }

    const categories = catRows || [];
    let gamesCat = categories.find(
      (c) =>
        c.slug === 'kutu-oyunları' ||
        c.slug === 'kutu-oyunlari' ||
        normalizeTurkish(c.name) === 'oyunlar' ||
        normalizeTurkish(c.name).includes('oyun')
    );

    if (!gamesCat) {
      const { data: createdGames } = await supabaseAdmin
        .from('categories')
        .upsert(
          {
            name: 'Oyunlar',
            slug: 'kutu-oyunları',
            description: 'Parti kart oyunları, dedektif vaka dosyaları, kaçış oyunları ve tarot desteleri.',
            image_url: '/images/katalog/p02-01.webp?v=2',
            display_order: 5,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('id, name, slug, display_order')
        .maybeSingle();
      if (createdGames) gamesCat = createdGames;
    }

    let accCat = categories.find(
      (c) =>
        c.slug === 'kirtasiye-aksesuar' ||
        normalizeLooseKey(c.name) === normalizeLooseKey('Kırtasiye & Aksesuar')
    );

    let categoryCreated = false;
    if (!accCat) {
      const maxOrder = categories.reduce((acc, c) => Math.max(acc, Number(c.display_order) || 0), 0);
      const { data: createdAcc, error: accInsertErr } = await supabaseAdmin
        .from('categories')
        .upsert(
          {
            name: 'Kırtasiye & Aksesuar',
            slug: 'kirtasiye-aksesuar',
            description:
              'Sevimli sticker setleri, mini çizgisiz defterler, büzgülü bez çantalar, ikili anahtarlıklar, akrilik charmlar ve magnetli kapak açacakları.',
            image_url: '/images/katalog/p71-01.webp?v=2',
            display_order: maxOrder + 1,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('id, name, slug, display_order')
        .maybeSingle();

      if (!accInsertErr && createdAcc) {
        accCat = createdAcc;
        categoryCreated = true;
      }
    }

    const gamesCategoryId = gamesCat?.id || null;
    const accCategoryId = accCat?.id || null;

    // 2. Fetch all existing products to avoid overwriting any live product (stock/price protection)
    const { data: existingProds, error: prodFetchErr } = await supabaseAdmin
      .from('products')
      .select('id, name, slug, sku')
      .limit(2500);

    if (prodFetchErr) {
      return {
        success: false,
        insertedProducts: 0,
        skippedExisting: 0,
        insertedImages: 0,
        insertedVariants: 0,
        categoryCreated,
        error: `Ürün listesi okuma hatası: ${prodFetchErr.message}`,
      };
    }

    const existingSlugs = new Set<string>();
    const existingNames = new Set<string>();
    const existingSkus = new Set<string>();
    const existingCatalogProdBySku = new Map<string, string>();

    for (const ep of existingProds || []) {
      if (ep.slug) {
        existingSlugs.add(ep.slug.trim().toLowerCase());
        existingSlugs.add(normalizeLooseKey(ep.slug));
      }
      if (ep.name) {
        existingNames.add(normalizeLooseKey(ep.name));
      }
      if (ep.sku) {
        const cleanSku = ep.sku.trim().toUpperCase();
        existingSkus.add(cleanSku);
        if (cleanSku.startsWith('OTK-KAT-')) {
          existingCatalogProdBySku.set(cleanSku, ep.id);
        }
      }
    }

    const itemsToInsert: CatalogSeedProduct[] = [];
    let skippedExisting = 0;

    for (const item of CATALOG_ITEMS) {
      const slugLower = item.slug.trim().toLowerCase();
      const slugLoose = normalizeLooseKey(item.slug);
      const nameLoose = normalizeLooseKey(item.name);
      const skuUpper = item.sku.trim().toUpperCase();

      if (
        existingSlugs.has(slugLower) ||
        existingSlugs.has(slugLoose) ||
        existingNames.has(nameLoose) ||
        existingSkus.has(skuUpper)
      ) {
        skippedExisting++;
        continue;
      }
      itemsToInsert.push(item);
    }

    // 3. Batch-insert new products
    const insertedIdBySlug = new Map<string, string>();
    const productChunks = chunkArray(itemsToInsert, 40);

    for (const chunk of productChunks) {
      const rows = chunk.map((item) => ({
        category_id: item.categorySlug === 'kirtasiye-aksesuar' ? accCategoryId : gamesCategoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        short_description: item.short_description,
        price: item.price,
        stock: 0,
        sku: item.sku,
        is_featured: item.is_featured,
        is_new: item.is_new,
        is_active: true,
      }));

      const { data: insertedRows, error: batchErr } = await supabaseAdmin
        .from('products')
        .insert(rows)
        .select('id, slug, sku');

      if (!batchErr && insertedRows) {
        for (const r of insertedRows) {
          insertedIdBySlug.set(r.slug, r.id);
        }
      } else {
        // Fallback row-by-row so a single unexpected slug/SKU collision never blocks the chunk
        for (const singleRow of rows) {
          const { data: singleInserted } = await supabaseAdmin
            .from('products')
            .insert(singleRow)
            .select('id, slug, sku')
            .maybeSingle();
          if (singleInserted?.id) {
            insertedIdBySlug.set(singleInserted.slug, singleInserted.id);
          }
        }
      }
    }

    // 4. Also check if any previously inserted OTK-KAT-* product is missing images or variants (self-healing)
    let prodIdsMissingImages = new Set<string>();
    let prodIdsMissingVariants = new Set<string>();
    if (existingCatalogProdBySku.size > 0) {
      const existingKatIds = Array.from(existingCatalogProdBySku.values());
      const [{ data: imgCheck }, { data: varCheck }] = await Promise.all([
        supabaseAdmin.from('product_images').select('product_id').in('product_id', existingKatIds).limit(5000),
        supabaseAdmin.from('product_variants').select('product_id').in('product_id', existingKatIds).limit(5000),
      ]);
      const hasImg = new Set((imgCheck || []).map((r: any) => r.product_id));
      const hasVar = new Set((varCheck || []).map((r: any) => r.product_id));
      for (const pid of existingKatIds) {
        if (!hasImg.has(pid)) prodIdsMissingImages.add(pid);
        if (!hasVar.has(pid)) prodIdsMissingVariants.add(pid);
      }
    }

    // 5. Build and batch-insert product_images & product_variants
    const allImageRows: any[] = [];
    const allVariantRows: any[] = [];

    for (const item of CATALOG_ITEMS) {
      const newProdId = insertedIdBySlug.get(item.slug);
      const existingKatId = existingCatalogProdBySku.get(item.sku.toUpperCase());
      const targetImgProdId = newProdId || (existingKatId && prodIdsMissingImages.has(existingKatId) ? existingKatId : null);
      const targetVarProdId = newProdId || (existingKatId && prodIdsMissingVariants.has(existingKatId) ? existingKatId : null);

      if (targetImgProdId && item.images.length > 0) {
        for (let i = 0; i < item.images.length; i++) {
          const img = item.images[i];
          allImageRows.push({
            product_id: targetImgProdId,
            image_url: img.image_url,
            is_cover: img.is_cover ?? i === 0,
            display_order: img.display_order ?? i + 1,
            alt_text: img.alt_text || item.name,
          });
        }
      }

      if (targetVarProdId && item.variants.length > 0) {
        for (const v of item.variants) {
          allVariantRows.push({
            product_id: targetVarProdId,
            name: v.name,
            value: v.value,
            stock: 0,
            price_override: v.price_override ?? null,
            sku: v.sku ?? null,
            image_url: v.image_url ?? null,
            is_active: true,
          });
        }
      }
    }

    let insertedImages = 0;
    for (const imgChunk of chunkArray(allImageRows, 150)) {
      const { error: imgErr } = await supabaseAdmin.from('product_images').insert(imgChunk);
      if (!imgErr) {
        insertedImages += imgChunk.length;
      }
    }

    let insertedVariants = 0;
    for (const varChunk of chunkArray(allVariantRows, 150)) {
      const { error: varErr } = await supabaseAdmin.from('product_variants').insert(varChunk);
      if (!varErr) {
        insertedVariants += varChunk.length;
      }
    }

    // 6. Upgrade any existing catalog image URLs without ?v=2 cache-buster (4x AI SR 1600x1600 upgrade)
    const [{ data: staleImgs }, { data: staleVars }, { data: staleCats }] = await Promise.all([
      supabaseAdmin
        .from('product_images')
        .select('id, image_url')
        .like('image_url', '/images/katalog/%')
        .not('image_url', 'like', '%?v=2')
        .limit(2000),
      supabaseAdmin
        .from('product_variants')
        .select('id, image_url')
        .like('image_url', '/images/katalog/%')
        .not('image_url', 'like', '%?v=2')
        .limit(2000),
      supabaseAdmin
        .from('categories')
        .select('id, image_url')
        .like('image_url', '/images/katalog/%')
        .not('image_url', 'like', '%?v=2')
        .limit(50),
    ]);

    for (const batch of chunkArray(staleImgs || [], 40)) {
      await Promise.all(
        batch.map((row: any) =>
          supabaseAdmin
            .from('product_images')
            .update({ image_url: `${String(row.image_url).split('?')[0]}?v=2` })
            .eq('id', row.id)
        )
      );
    }

    for (const batch of chunkArray(staleVars || [], 40)) {
      await Promise.all(
        batch.map((row: any) =>
          supabaseAdmin
            .from('product_variants')
            .update({ image_url: `${String(row.image_url).split('?')[0]}?v=2` })
            .eq('id', row.id)
        )
      );
    }

    for (const row of staleCats || []) {
      await supabaseAdmin
        .from('categories')
        .update({ image_url: `${String(row.image_url).split('?')[0]}?v=2` })
        .eq('id', row.id);
    }

    seedCompletedInMemory = true;
    return {
      success: true,
      insertedProducts: insertedIdBySlug.size,
      skippedExisting,
      insertedImages,
      insertedVariants,
      categoryCreated,
    };
  } catch (err: any) {
    console.error('[Catalog 261026 Sync Error]:', err);
    return {
      success: false,
      insertedProducts: 0,
      skippedExisting: 0,
      insertedImages: 0,
      insertedVariants: 0,
      categoryCreated: false,
      error: err?.message || 'Beklenmeyen senkronizasyon hatası.',
    };
  }
}

export async function ensureCatalog261026Seeded(): Promise<void> {
  if (seedCompletedInMemory) return;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  if (seedInFlightPromise) {
    await seedInFlightPromise;
    return;
  }

  seedInFlightPromise = (async () => {
    try {
      const supabaseAdmin = createAdminClient();
      const [{ count, error }, { count: staleImgCount, error: staleErr }] = await Promise.all([
        supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .like('sku', 'OTK-KAT-%'),
        supabaseAdmin
          .from('product_images')
          .select('id', { count: 'exact', head: true })
          .like('image_url', '/images/katalog/%')
          .not('image_url', 'like', '%?v=2'),
      ]);

      if (!error && !staleErr && (count ?? 0) >= 145 && (staleImgCount ?? 0) === 0) {
        seedCompletedInMemory = true;
        return {
          success: true,
          skipped: true,
          insertedProducts: 0,
          skippedExisting: count ?? 0,
          insertedImages: 0,
          insertedVariants: 0,
          categoryCreated: false,
        };
      }

      return await syncCatalog261026ToSupabase();
    } finally {
      seedInFlightPromise = null;
    }
  })();

  await seedInFlightPromise;
}
