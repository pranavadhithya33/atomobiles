-- Run this in your Supabase Dashboard SQL Editor
CREATE TABLE IF NOT EXISTS video_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 10 hardcoded videos
INSERT INTO video_reviews (url, customer_name, active) VALUES
('/videos/4.mp4', 'Customer 1', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.31 PM.mp4', 'Customer 2', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.32 PM.mp4', 'Customer 3', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.33 PM.mp4', 'Customer 4', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM (1).mp4', 'Customer 5', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM (2).mp4', 'Customer 6', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM.mp4', 'Customer 7', true),
('/videos/WhatsApp Video 2026-06-06 at 9.37.35 PM.mp4', 'Customer 8', true),
('/videos/WhatsApp Video 2026-06-06 at 9.38.33 PM.mp4', 'Customer 9', true),
('/videos/WhatsApp Video 2026-06-06 at 9.39.34 PM.mp4', 'Customer 10', true);
