-- =====================================================================
-- OTANTIKOS CONCEPT - PUSH NOTIFICATIONS & PWA MIGRATION
-- Web Push Abonelikleri ve Bildirim Gönderim Geçmişi Tabloları
-- =====================================================================

-- 1. Push Bildirim Abonelikleri Tablosu
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_id TEXT,
    user_agent TEXT,
    platform TEXT DEFAULT 'unknown',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Hızlı Erişim İndeksleri
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_created_at ON public.push_subscriptions(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public subscription insert/update" ON public.push_subscriptions;
CREATE POLICY "Allow public subscription insert/update"
ON public.push_subscriptions FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- 4. Bildirim Gönderim Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    url TEXT DEFAULT '/',
    image_url TEXT,
    sent_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin notification history" ON public.notification_history;
CREATE POLICY "Allow admin notification history"
ON public.notification_history FOR ALL
USING (TRUE)
WITH CHECK (TRUE);
