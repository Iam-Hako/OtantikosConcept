-- Otantikos Concept Migration: Accounting & Profit/Loss (Alis-Satis & Kar-Zarar)
-- Run this in Supabase SQL Editor to enable full PostgreSQL persistence for Accounting

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

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins full access to accounting_transactions" ON public.accounting_transactions;
  CREATE POLICY "Admins full access to accounting_transactions"
  ON public.accounting_transactions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.accounting_transactions;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
