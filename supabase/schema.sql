-- ============================================================
-- ONLY GADJETS - Supabase SQL Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  images TEXT[] DEFAULT '{}',
  online_price NUMERIC(10,2) DEFAULT 0,
  amazon_price NUMERIC(10,2) DEFAULT 0,
  flipkart_price NUMERIC(10,2) DEFAULT 0,
  amazon_url TEXT,
  flipkart_url TEXT,
  our_price NUMERIC(10,2) NOT NULL,
  prepaid_discount_pct NUMERIC(5,2) DEFAULT 3,
  description TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  payment_option TEXT NOT NULL CHECK (payment_option IN ('half_cod', 'full_prepaid')),
  base_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL,
  advance_amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read on products and categories
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);

-- Allow authenticated inserts on orders (anon key)
DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
CREATE POLICY "Anyone can place orders" ON orders FOR INSERT WITH CHECK (TRUE);

-- Allow service role to do everything (used by admin panel)
DROP POLICY IF EXISTS "Service role full access products" ON products;
CREATE POLICY "Service role full access products" ON products USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access categories" ON categories;
CREATE POLICY "Service role full access categories" ON categories USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access orders" ON orders;
CREATE POLICY "Service role full access orders" ON orders USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA - Sample Categories
-- ============================================================
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Smartphones', 'smartphones', '📱', 1),
  ('Tablets', 'tablets', '📟', 2),
  ('Accessories', 'accessories', '🎧', 3),
  ('Smartwatches', 'smartwatches', '⌚', 4),
  ('Audio', 'audio', '🔊', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA - Sample Products (Remove/Edit as needed)
-- ============================================================
INSERT INTO products (name, slug, images, online_price, amazon_price, flipkart_price, our_price, prepaid_discount_pct, description, stock, category, featured)
VALUES
  (
    'Samsung Galaxy A55 5G (8GB/128GB)',
    'samsung-galaxy-a55-5g-128gb',
    ARRAY['https://images.samsung.com/is/image/samsung/p6pim/in/sm-a556elgains/gallery/in-galaxy-a55-5g-sm-a556-sm-a556elgains-537967985.jpg'],
    38999,
    38999,
    38500,
    31999,
    3,
    'Samsung Galaxy A55 5G with 6.6" Super AMOLED Display, 50MP AI Camera, 5000mAh Battery, IP67 Rating. Available in Awesome Iceblue, Awesome Lilac, and Awesome Navy.',
    15,
    'Smartphones',
    TRUE
  ),
  (
    'Redmi Note 13 Pro 5G (8GB/256GB)',
    'redmi-note-13-pro-5g-256gb',
    ARRAY['https://i01.appmifile.com/webfile/globalimg/products/m/redmi-note-13-pro-5g/overview/img_7.jpg'],
    27999,
    27999,
    27500,
    22499,
    3,
    'Redmi Note 13 Pro 5G with 200MP Camera, 6.67" AMOLED Display, 5100mAh Battery, 67W Turbo Charging. Snapdragon 7s Gen 2 Processor.',
    20,
    'Smartphones',
    TRUE
  ),
  (
    'OnePlus Nord CE 4 Lite 5G (8GB/128GB)',
    'oneplus-nord-ce-4-lite-5g-128gb',
    ARRAY['https://image01.oneplus.net/ebp/202406/19/1-m00-4a-33-rb8bwmz1f8wabd5uaagrywfr-uk536.png'],
    19999,
    19999,
    19500,
    16499,
    3,
    'OnePlus Nord CE 4 Lite with 50MP AI Camera, 6.67" FHD+ Display, 5110mAh Battery with 80W SUPERVOOC Fast Charging. Snapdragon 695 5G.',
    12,
    'Smartphones',
    FALSE
  )
ON CONFLICT (slug) DO NOTHING;
