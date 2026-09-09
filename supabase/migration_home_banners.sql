-- =========================================================================
-- Otantikos Concept: Home Banners & Hero Slider Migration
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.home_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    badge_text TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    button_text TEXT DEFAULT 'Hemen Keşfet',
    button_url TEXT DEFAULT '/kategori/k-rtasiye-r-nleri',
    bg_gradient TEXT DEFAULT 'from-sky-100 via-rose-50 to-amber-100',
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure mobile_image_url exists if table already created
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

-- Index for high-speed retrieval by order and active status
CREATE INDEX IF NOT EXISTS idx_home_banners_order ON public.home_banners (display_order ASC, is_active);

-- Enable RLS
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can read active banners
CREATE POLICY "Public Read Active Banners" ON public.home_banners
    FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

-- Authenticated users (admin) can manage banners
CREATE POLICY "Admin Manage Banners" ON public.home_banners
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert initial default Miniso-style banner
INSERT INTO public.home_banners (
    title,
    subtitle,
    badge_text,
    image_url,
    button_text,
    button_url,
    bg_gradient,
    display_order,
    is_active
) VALUES (
    'Yeni Dönemde Tarzını Yansıt!',
    'Eminönü Tahtakale vitrinimizden sevimli kırtasiye, defter ve tasarım hediyelik koleksiyonları.',
    'YENİ SEZON',
    '/images/miniso_otantikos_banner.jpg',
    'Hemen Alışverişe Başla',
    '/kategori/k-rtasiye-r-nleri',
    'from-sky-200/60 via-rose-100/50 to-amber-100/60',
    1,
    true
) ON CONFLICT DO NOTHING;
