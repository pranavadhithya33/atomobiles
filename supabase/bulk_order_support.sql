-- ============================================================
-- ATOMOBILES - Bulk Order Support
-- ============================================================

-- Add items column to store multiple products in one order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;

-- Update RLS or policies if necessary (usually not needed for just adding a column)
