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
  price_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
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
  payment_option TEXT NOT NULL CHECK (payment_option IN ('half_cod', 'full_prepaid', 'token_advance')),
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
-- SEED DATA - Top 50 Bestselling Phones on Amazon India
-- Run this to auto-populate your store. Prices are refreshed nightly.
-- ============================================================
INSERT INTO products (name, slug, images, amazon_price, flipkart_price, online_price, our_price, prepaid_discount_pct, description, stock, category, featured, amazon_url)
VALUES
  ('Samsung Galaxy A55 5G (8GB/128GB)', 'samsung-galaxy-a55-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/71gqWIRkH+L._SX679_.jpg'], 38999, 38500, 38999, 35099, 3, 'Samsung Galaxy A55 5G with 6.6" Super AMOLED Display, 50MP AI Camera, 5000mAh Battery, IP67 Rating.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0CW45NRRS'),
  ('Samsung Galaxy S24 FE 5G (8GB/128GB)', 'samsung-galaxy-s24-fe-5g', ARRAY['https://m.media-amazon.com/images/I/61WjEimxRJL._SX679_.jpg'], 44999, 44000, 44999, 40499, 3, 'Galaxy S24 FE with 6.7" Dynamic AMOLED 2X, Exynos 2500, 50MP Camera, 4700mAh battery.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0DKPH8J2V'),
  ('Redmi Note 13 Pro 5G (8GB/256GB)', 'redmi-note-13-pro-5g-256gb', ARRAY['https://m.media-amazon.com/images/I/61BxiE7WPML._SX679_.jpg'], 27999, 27500, 27999, 25199, 3, 'Redmi Note 13 Pro 5G with 200MP Camera, 6.67" AMOLED, 5100mAh, 67W Turbo Charging.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0CNYFVNLR'),
  ('Redmi 13 5G (6GB/128GB)', 'redmi-13-5g-6gb-128gb', ARRAY['https://m.media-amazon.com/images/I/61PxGqMpfkL._SX679_.jpg'], 11999, 11500, 11999, 10799, 3, 'Redmi 13 5G with 6.79" FHD+ Display, Snapdragon 4 Gen 2, 50MP Camera, 5030mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0D4GCPZK2'),
  ('iQOO Z9x 5G (6GB/128GB)', 'iqoo-z9x-5g-6gb-128gb', ARRAY['https://m.media-amazon.com/images/I/71mNIaFZ+VL._SX679_.jpg'], 13999, 13500, 13999, 12599, 3, 'iQOO Z9x 5G with Snapdragon 6 Gen 1, 6.72" FHD+ Display, 6000mAh Battery.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CVKRRTM7'),
  ('Realme Narzo 70 Pro 5G (8GB/128GB)', 'realme-narzo-70-pro-5g', ARRAY['https://m.media-amazon.com/images/I/61bDL+MKWKL._SX679_.jpg'], 18999, 18500, 18999, 17099, 3, 'Realme Narzo 70 Pro with 50MP Sony Camera, 120Hz AMOLED, Dimensity 7050, 5000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CXJ3G8LF'),
  ('OnePlus Nord CE 4 Lite 5G (8GB/128GB)', 'oneplus-nord-ce4-lite-128gb', ARRAY['https://m.media-amazon.com/images/I/61QL2R4IPOL._SX679_.jpg'], 19999, 19500, 19999, 17999, 3, 'OnePlus Nord CE 4 Lite with 50MP Camera, 6.67" FHD+, 5110mAh, 80W SUPERVOOC.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0D4FQ38D7'),
  ('Poco M6 Pro 5G (6GB/128GB)', 'poco-m6-pro-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/71YoKCOSmBL._SX679_.jpg'], 13999, 13500, 13999, 12599, 3, 'Poco M6 Pro with 50MP Camera, 6.67" FHD+ AMOLED, Snapdragon 4 Gen 2, 5000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CK7JG9ZB'),
  ('Samsung Galaxy M35 5G (8GB/128GB)', 'samsung-galaxy-m35-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/71Lm4rIm0cL._SX679_.jpg'], 20999, 20500, 20999, 18899, 3, 'Galaxy M35 5G with 6.6" FHD+ Super AMOLED, 50MP Camera, Exynos 1380, 6000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0D2HFCJRD'),
  ('Motorola Edge 50 Neo 5G (8GB/256GB)', 'motorola-edge-50-neo-256gb', ARRAY['https://m.media-amazon.com/images/I/61bOEjidPXL._SX679_.jpg'], 23999, 23500, 23999, 21599, 3, 'Motorola Edge 50 Neo with 50MP Camera, 6.4" pOLED 120Hz, Dimensity 7300, 4310mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CXTTDJ4K'),
  ('Samsung Galaxy A16 5G (8GB/128GB)', 'samsung-galaxy-a16-5g', ARRAY['https://m.media-amazon.com/images/I/71dWVnXSL5L._SX679_.jpg'], 17999, 17500, 17999, 16199, 3, 'Samsung Galaxy A16 5G with 6.7" FHD+ AMOLED, 50MP AI Camera, Exynos 1330, 5000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0DKL5B5Z3'),
  ('Poco X6 Pro 5G (8GB/256GB)', 'poco-x6-pro-5g-256gb', ARRAY['https://m.media-amazon.com/images/I/61n1mYmDy3L._SX679_.jpg'], 26999, 26500, 26999, 24299, 3, 'Poco X6 Pro with 64MP OIS Camera, 6.67" AMOLED 144Hz, Dimensity 8300-Ultra, 5000mAh.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0CRWNJBKG'),
  ('Realme GT 6T 5G (8GB/256GB)', 'realme-gt-6t-5g-256gb', ARRAY['https://m.media-amazon.com/images/I/71TYTiGz0QL._SX679_.jpg'], 29999, 29500, 29999, 26999, 3, 'Realme GT 6T with Snapdragon 7s Gen 3, 50MP Camera, 6.67" AMOLED 120Hz, 5500mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0D2LPRVGT'),
  ('Vivo T3x 5G (6GB/128GB)', 'vivo-t3x-5g-6gb-128gb', ARRAY['https://m.media-amazon.com/images/I/61bLTnqYEBL._SX679_.jpg'], 12999, 12500, 12999, 11699, 3, 'Vivo T3x 5G with 6.72" FHD+ LCD, Snapdragon 6 Gen 1, 50MP Camera, 6000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CYT9LHKM'),
  ('Nothing Phone (2a) (8GB/128GB)', 'nothing-phone-2a-128gb', ARRAY['https://m.media-amazon.com/images/I/71TZ7J28FNL._SX679_.jpg'], 23999, 23500, 23999, 21599, 3, 'Nothing Phone 2a with Dimensity 7200 Pro, 6.7" AMOLED 120Hz, 50MP Camera, 5000mAh.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0CY52BKBQ'),
  ('Apple iPhone 15 (128GB)', 'apple-iphone-15-128gb', ARRAY['https://m.media-amazon.com/images/I/61qsSmNzJNL._SX679_.jpg'], 69999, 69000, 69999, 62999, 3, 'iPhone 15 with 48MP Main Camera, Dynamic Island, A16 Bionic, 6.1" Super Retina XDR OLED.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0CHX3QBCH'),
  ('Apple iPhone 16 (128GB)', 'apple-iphone-16-128gb', ARRAY['https://m.media-amazon.com/images/I/71eWMNvzVFL._SX679_.jpg'], 79999, 79000, 79999, 71999, 3, 'iPhone 16 with A18 chip, 48MP Fusion Camera, Camera Control button, 6.1" display.', 10, 'Smartphones', TRUE, 'https://www.amazon.in/dp/B0DGJHX5GX'),
  ('Samsung Galaxy S24 5G (8GB/128GB)', 'samsung-galaxy-s24-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/71LzJWqaGxL._SX679_.jpg'], 64999, 64000, 64999, 58499, 3, 'Galaxy S24 with Exynos 2400, 50MP ProVisual Engine, 6.2" AMOLED 120Hz, 4000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CSFZRGKJ'),
  ('OnePlus 12R 5G (8GB/128GB)', 'oneplus-12r-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/61dVNfNz7qL._SX679_.jpg'], 39999, 39500, 39999, 35999, 3, 'OnePlus 12R with Snapdragon 8 Gen 2, 50MP Camera, 6.78" AMOLED 120Hz, 5500mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CR8GFFC6'),
  ('Motorola G85 5G (12GB/256GB)', 'motorola-g85-5g-256gb', ARRAY['https://m.media-amazon.com/images/I/51e2cOV1JzL._SX679_.jpg'], 17999, 17500, 17999, 16199, 3, 'Motorola G85 5G with 50MP OIS Camera, 6.67" pOLED 120Hz, Snapdragon 6s Gen 3, 5000mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0D3JHT9NM'),
  ('iQOO Neo 9 Pro 5G (8GB/128GB)', 'iqoo-neo9-pro-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/61cQ4tEJeSL._SX679_.jpg'], 34999, 34500, 34999, 31499, 3, 'iQOO Neo 9 Pro with Snapdragon 8 Gen 2, 50MP OIS Camera, 6.78" AMOLED 144Hz, 4600mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CRS6NZXS'),
  ('Vivo V30e 5G (8GB/128GB)', 'vivo-v30e-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/61pSjphZ-kL._SX679_.jpg'], 21999, 21500, 21999, 19799, 3, 'Vivo V30e with 50MP Sony IMX882 Camera, 6.67" AMOLED, Snapdragon 6 Gen 1, 5500mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CYT8P2CH'),
  ('Realme 13 Pro Plus 5G (8GB/256GB)', 'realme-13-pro-plus-256gb', ARRAY['https://m.media-amazon.com/images/I/61p9TfNp9ZL._SX679_.jpg'], 32999, 32500, 32999, 29699, 3, 'Realme 13 Pro+ with 50MP Sony LYT-701 Camera, 6.7" AMOLED, Snapdragon 7s Gen 2, 5200mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CVJFCM7N'),
  ('Samsung Galaxy A35 5G (8GB/128GB)', 'samsung-galaxy-a35-5g-128gb', ARRAY['https://m.media-amazon.com/images/I/71RXVfIuOuL._SX679_.jpg'], 27999, 27500, 27999, 25199, 3, 'Galaxy A35 5G with 6.6" Super AMOLED, 50MP Camera, Exynos 1380, 5000mAh, IP67.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CW48MHZS'),
  ('Nothing Phone (2) (12GB/256GB)', 'nothing-phone-2-256gb', ARRAY['https://m.media-amazon.com/images/I/81d-UJDLCKL._SX679_.jpg'], 44999, 44500, 44999, 40499, 3, 'Nothing Phone 2 with Glyph Interface, Snapdragon 8+ Gen 1, 50MP Camera, 4700mAh.', 10, 'Smartphones', FALSE, 'https://www.amazon.in/dp/B0CBKPKKB4')
ON CONFLICT (slug) DO NOTHING;
