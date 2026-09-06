-- =====================================================================
-- OTANTIKOS CONCEPT - USER ADDRESSES MIGRATION
-- Kullanıcı Profil Açık Adresleri Tablosu
-- =====================================================================

-- 1. Tablo Oluşturma
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Ev Adresim',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    neighborhood TEXT DEFAULT '',
    address_detail TEXT NOT NULL,
    postal_code TEXT DEFAULT '',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Hızlı Erişim İndeksleri
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_created_at ON public.user_addresses(created_at DESC);

-- 3. Row Level Security (RLS) Etkinleştirme
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 4. Güvenlik Politikaları (Kullanıcı ve Misafir Adres Senkronizasyonu)
DROP POLICY IF EXISTS "Allow read user addresses" ON public.user_addresses;
CREATE POLICY "Allow read user addresses"
ON public.user_addresses FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Allow insert user addresses" ON public.user_addresses;
CREATE POLICY "Allow insert user addresses"
ON public.user_addresses FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow update user addresses" ON public.user_addresses;
CREATE POLICY "Allow update user addresses"
ON public.user_addresses FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow delete user addresses" ON public.user_addresses;
CREATE POLICY "Allow delete user addresses"
ON public.user_addresses FOR DELETE
USING (TRUE);

-- 5. Otomatik Güncellenme (updated_at) Tetikleyicisi
DO $$ BEGIN
  CREATE TRIGGER set_user_addresses_updated_at 
  BEFORE UPDATE ON public.user_addresses 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
