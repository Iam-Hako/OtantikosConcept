-- ==============================================================================
-- OTANTİKOS CONCEPT: KATEGORİLER TABLOSU VE İKON SÜTUNU GÜNCELLEMESİ
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- İkon sütunu yoksa ekler
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT;

-- Hızlı erişim indeksleri
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- Satır bazlı güvenlik (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (TRUE)
WITH CHECK (TRUE);
