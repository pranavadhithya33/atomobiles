-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  cost_per_item NUMERIC,
  tax_class TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  status TEXT CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')) DEFAULT 'DRAFT',
  track_quantity BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,
  weight NUMERIC,
  dimensions JSONB DEFAULT '{"l": 0, "w": 0, "h": 0}'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Options Table (Axes for Variants)
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  values TEXT[] NOT NULL DEFAULT '{}',
  position INTEGER DEFAULT 0
);

-- Product Variants Table (The Generated Combinations)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT,
  option1_value TEXT,
  option2_value TEXT,
  option3_value TEXT,
  price NUMERIC,
  stock INTEGER DEFAULT 0
);

-- Audit Logs Table (Security Requirement)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Ensure 'profiles' table exists and has a 'role' column (TEXT or ENUM) 
-- that accepts 'SUPER_ADMIN', 'STORE_MANAGER', and 'USER'.
