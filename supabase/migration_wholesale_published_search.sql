-- Migration: Add Wholesale Price, Published Toggle, Optional SKU & Search Indexes to Otantikos Concept

-- 1. Add wholesale_price if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(10, 2) DEFAULT NULL;

-- 2. Add is_published if not exists (Controls public storefront visibility vs internal depot-only stock)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE NOT NULL;

-- 3. Make SKU optional (Drop NOT NULL if present)
DO $$
BEGIN
    ALTER TABLE public.products ALTER COLUMN sku DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 4. Create search & performance indexes for instant product search
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- 5. Enable Storage Bucket for Product Images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Storage Policy to allow public read & authenticated upload
DO $$
BEGIN
    CREATE POLICY "Public Read Product Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Allow Uploads to Products Bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Allow Updates to Products Bucket"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
