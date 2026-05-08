-- ============================================================
-- ONLY GADJETS - Product Variants Migration
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ram           INTEGER NOT NULL,      -- e.g. 4, 6, 8, 12 (GB)
  storage       INTEGER NOT NULL,      -- e.g. 64, 128, 256, 512 (GB)
  price         NUMERIC(10,2) NOT NULL,
  enabled       BOOLEAN DEFAULT TRUE,  -- admin can hide this combo from customers
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, ram, storage)
);

-- Row Level Security
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public can read enabled variants
DROP POLICY IF EXISTS "Public read variants" ON product_variants;
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (TRUE);

-- Service role (admin) has full access
DROP POLICY IF EXISTS "Service role full access variants" ON product_variants;
CREATE POLICY "Service role full access variants" ON product_variants
  USING (auth.role() = 'service_role');

-- Index for fast product lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
