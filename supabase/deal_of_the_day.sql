-- ============================================================
-- ATOMOBILES - Deal of the Day Schema Update
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Add Deal of the Day columns to the existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deal_of_the_day BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_expires_at TIMESTAMPTZ;

-- Ensure only one product can be the deal of the day (optional, but good for data integrity)
-- We'll handle this in the application logic by un-setting all others when a new one is set.
