-- ============================================================
-- ONLY GADJETS - Supabase SQL Update
-- Copy and run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Safely add "delayed" to orders status constraint by dynamically finding the constraint name
DO $$ 
DECLARE 
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'orders'::regclass AND contype = 'c' 
    AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'orders'::regclass AND attname = 'status');
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE orders DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'delayed'));

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can add reviews" ON reviews;
CREATE POLICY "Anyone can add reviews" ON reviews FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access reviews" ON reviews;
CREATE POLICY "Service role full access reviews" ON reviews USING (auth.role() = 'service_role');

-- Done! Your site features are now active.
