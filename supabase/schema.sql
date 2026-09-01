-- Otantikos Concept Database Schema & Migrations (Audited & Hardened)
-- PostgreSQL Schema for Supabase with RLS, Storage, Realtime, Triggers, and Indexes

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

-- 3. PROFILES TABLE
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
    wholesale_price NUMERIC(10, 2),
    stock INT NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    video_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL CHECK (rating >= 0 AND rating <= 5),
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
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    price_override NUMERIC(10, 2),
    stock INT NOT NULL DEFAULT 0,
    sku TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 8. PRODUCT SPECIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    spec_key TEXT NOT NULL,
    spec_value TEXT NOT NULL,
    display_order INT DEFAULT 0 NOT NULL
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
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

-- 11. RETURNS TABLE
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

-- 12. QUESTIONS TABLE
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

-- 15. IN-STOCK ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.in_stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. WHOLESALE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.wholesale_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    estimated_volume TEXT,
    notes TEXT NOT NULL,
    admin_notes TEXT,
    status TEXT DEFAULT 'beklemede' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Unique index ensuring 1 cart entry per product & variant (handles NULL variant_id safely)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique 
ON public.cart_items (user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 18. CARGO LABELS (KARGO ETİKETLERİ & ADRES DEFTERİ)
CREATE TABLE IF NOT EXISTS public.cargo_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_name TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    order_number TEXT,
    print_count INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cargo_labels_recipient ON public.cargo_labels(recipient_name);
CREATE INDEX IF NOT EXISTS idx_cargo_labels_created_at ON public.cargo_labels(created_at DESC);

-- 18. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_returns_updated_at BEFORE UPDATE ON public.returns FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_chat_updated_at BEFORE UPDATE ON public.live_chat_sessions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 19. AUTOMATIC AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    CASE 
      WHEN NEW.email IN ('chessvip11@gmail.com', 'admin@otantikosconcept.com') THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 20. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Helper to check if current user is admin (STABLE + Search Path secured)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Profiles policies
CREATE POLICY "Public profiles are readable by authenticated users and admins"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile without role escalation"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (role = 'customer'::user_role OR public.is_admin())
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

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

-- Product details
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
CREATE POLICY "Users can view their own orders or admins all"
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
ON public.returns FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create return requests"
ON public.returns FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Admins can update return requests"
ON public.returns FOR UPDATE
USING (public.is_admin());

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

CREATE POLICY "Anyone can submit reviews"
ON public.reviews FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admins can manage reviews"
ON public.reviews FOR ALL
USING (public.is_admin());

-- Favorites and Cart
CREATE POLICY "Users manage their own favorites"
ON public.favorites FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own cart"
ON public.cart_items FOR ALL
USING (auth.uid() = user_id);

-- Wholesale Requests (Hardened)
CREATE POLICY "Wholesale insertable by anyone"
ON public.wholesale_requests FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Wholesale manageable by admin only"
ON public.wholesale_requests FOR SELECT
USING (public.is_admin());

CREATE POLICY "Wholesale updatable by admin only"
ON public.wholesale_requests FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Wholesale deletable by admin only"
ON public.wholesale_requests FOR DELETE
USING (public.is_admin());

-- In-Stock Alerts (Hardened)
CREATE POLICY "Stock alerts insertable by anyone"
ON public.in_stock_alerts FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Stock alerts manageable by admin only"
ON public.in_stock_alerts FOR ALL
USING (public.is_admin());

-- 21. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active_created ON public.products(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specifications_product_id ON public.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON public.returns(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_product_id ON public.questions(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.live_chat_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- Live Chat policies (Hardened)
CREATE POLICY "Live chat sessions viewable by owner or admin"
ON public.live_chat_sessions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Live chat sessions insertable"
ON public.live_chat_sessions FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Live chat sessions updatable by admin or owner"
ON public.live_chat_sessions FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Live chat messages viewable by session or admin"
ON public.live_chat_messages FOR SELECT
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions
    WHERE live_chat_sessions.session_id = live_chat_messages.session_id
    AND live_chat_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Live chat messages insertable"
ON public.live_chat_messages FOR INSERT
WITH CHECK (TRUE);

-- 22. STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to product-images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'chat-attachments'));

CREATE POLICY "Only Admins upload to product-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('product-images', 'chat-attachments') AND public.is_admin());

CREATE POLICY "Only Admins manage storage objects"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('product-images', 'chat-attachments') AND public.is_admin());

CREATE POLICY "Only Admins delete storage objects"
ON storage.objects FOR DELETE
USING (bucket_id IN ('product-images', 'chat-attachments') AND public.is_admin());

-- 23. CARGO LABELS POLICIES
ALTER TABLE public.cargo_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to cargo_labels"
ON public.cargo_labels FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 25. ACCOUNTING & TRANSACTIONS (ALIS-SATIS & KAR-ZARAR)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2);

CREATE TABLE IF NOT EXISTS public.accounting_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT CHECK (type IN ('purchase', 'sale', 'expense')) NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    total_cost NUMERIC(10, 2) DEFAULT 0.00,
    net_profit NUMERIC(10, 2) DEFAULT 0.00,
    customer_name TEXT,
    customer_phone TEXT,
    sale_channel TEXT CHECK (sale_channel IN ('magaza', 'toptan', 'website')),
    supplier_name TEXT,
    payment_method TEXT DEFAULT 'nakit',
    document_no TEXT,
    notes TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
    update_stock BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to accounting_transactions"
ON public.accounting_transactions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.accounting_transactions;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


