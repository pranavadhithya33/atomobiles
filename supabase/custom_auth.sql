-- ============================================================
-- CUSTOM AUTH MIGRATION SCRIPT
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Remove the foreign key that links profiles to Supabase Auth
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Allow profiles to generate their own UUIDs instead of relying on Auth
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Add email and password columns for custom login
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- 4. Drop the trigger that tied profiles to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Done! Your profiles table is now fully independent of Supabase Auth rate limits.
