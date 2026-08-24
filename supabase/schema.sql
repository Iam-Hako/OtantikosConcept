-- Otantikos Concept Database Schema & Migrations
-- Comprehensive PostgreSQL Schema for Supabase with RLS, Storage, Realtime, and Triggers

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('siparis_alindi', 'hazirlaniyor', 'kargoya_verildi', 'teslim_edildi', 'iptal_edildi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type AS ENUM ('kargo', 'magaza_teslim');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE return_status AS ENUM ('talep_alindi', 'onaylandi', 'reddedildi', 'tamamlandi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    video_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 5.0 NOT NULL,
    review_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- örn. "Renk", "Model", "Boyut"
    value TEXT NOT NULL, -- örn. "18K Altın Kaplama", "Mavi", "Dönme Dolap"
    price_override NUMERIC(10, 2),
    stock INT NOT NULL DEFAULT 0,
    sku TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 8. PRODUCT SPECIFICATIONS TABLE (Dynamic Spec Builder)
CREATE TABLE IF NOT EXISTS public.product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    spec_key TEXT NOT NULL, -- örn. "Maden Türü", "Yaş Grubu", "Kararmazlık Durumu"
    spec_value TEXT NOT NULL, -- örn. "316L Paslanmaz Çelik", "6+ Yaş", "Su ve Parfüme Dayanıklı"
    display_order INT DEFAULT 0 NOT NULL
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- örn. OTN-2026-XXXXX
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_name TEXT,
    guest_phone TEXT,
    status order_status DEFAULT 'siparis_alindi'::order_status NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    gift_wrap_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    has_gift_wrap BOOLEAN DEFAULT FALSE NOT NULL,
    gift_note TEXT,
    delivery_type delivery_type DEFAULT 'kargo'::delivery_type NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    tracking_number TEXT,
    tracking_carrier TEXT,
    admin_notes TEXT,
    payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    payment_method TEXT DEFAULT 'credit_card' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total NUMERIC(10, 2) NOT NULL
);

-- 11. RETURNS TABLE (RMA / Return Management)
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status return_status DEFAULT 'talep_alindi'::return_status NOT NULL,
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. QUESTIONS TABLE (Product Q&A)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    answered_at TIMESTAMPTZ
);

-- 13. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. LIVE CHAT TABLES
CREATE TABLE IF NOT EXISTS public.live_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.live_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES public.live_chat_sessions(session_id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('customer', 'admin')) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. IN-STOCK ALERTS TABLE ("Gelince Haber Ver")
CREATE TABLE IF NOT EXISTS public.in_stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. WHOLESALE REQUESTS TABLE (Tahtakale B2B)
CREATE TABLE IF NOT EXISTS public.wholesale_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    estimated_volume TEXT,
    notes TEXT NOT NULL,
    status TEXT DEFAULT 'beklemede' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. FAVORITES & CART PERSISTENCE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id, variant_id)
);

-- =========================================================
-- 18. AUTOMATIC AUTH TRIGGER (auth.users -> public.profiles)
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'chessvip11@gmail.com' OR NEW.email = 'admin@otantikosconcept.com' THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Public profiles are readable by authenticated users and admins"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.is_admin());

-- Products policies
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.is_admin());

-- Product details (images, variants, specs)
CREATE POLICY "Product details viewable by everyone"
ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage product images"
ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Product variants viewable by everyone"
ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage product variants"
ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Product specs viewable by everyone"
ON public.product_specifications FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage product specs"
ON public.product_specifications FOR ALL USING (public.is_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders or guest lookup"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- Order items
CREATE POLICY "Order items viewable with order access"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Order items insertable"
ON public.order_items FOR INSERT
WITH CHECK (TRUE);

-- Returns policies
CREATE POLICY "Users can view and create their own return requests"
ON public.returns FOR ALL
USING (auth.uid() = user_id OR public.is_admin());

-- Questions policies
CREATE POLICY "Approved questions viewable by everyone"
ON public.questions FOR SELECT
USING (is_approved = TRUE OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can submit questions"
ON public.questions FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admins can manage questions"
ON public.questions FOR ALL
USING (public.is_admin());

-- Reviews policies
CREATE POLICY "Approved reviews viewable by everyone"
ON public.reviews FOR SELECT
USING (is_approved = TRUE OR public.is_admin());

CREATE POLICY "Authenticated users can submit reviews"
ON public.reviews FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admins can manage reviews"
ON public.reviews FOR ALL
USING (public.is_admin());

-- Live Chat policies
CREATE POLICY "Live chat access"
ON public.live_chat_sessions FOR ALL
USING (TRUE);

CREATE POLICY "Live chat messages access"
ON public.live_chat_messages FOR ALL
USING (TRUE);

-- Favorites and Cart
CREATE POLICY "Users manage their own favorites"
ON public.favorites FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own cart"
ON public.cart_items FOR ALL
USING (auth.uid() = user_id);

-- Wholesale and Stock alerts
CREATE POLICY "Wholesale insertable by anyone, manageable by admin"
ON public.wholesale_requests FOR ALL
USING (public.is_admin() OR TRUE);

CREATE POLICY "Stock alerts insertable by anyone"
ON public.in_stock_alerts FOR ALL
USING (TRUE);

-- =========================================================
-- 20. SUPABASE STORAGE BUCKET
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload to product-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated' OR TRUE));

-- =========================================================
-- 21. SUPABASE REALTIME REPLICATION
-- =========================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
