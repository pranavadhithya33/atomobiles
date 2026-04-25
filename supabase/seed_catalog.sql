-- Full Reset & Seed (V5)
TRUNCATE categories, products CASCADE;

-- Re-Seed Categories with correct slugs
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Smartphones', 'smartphones', '📱', 1),
  ('Tablets', 'tablets', '📟', 2),
  ('Accessories', 'accessories', '🎧', 3),
  ('Smartwatches', 'smartwatches', '⌚', 4),
  ('Audio', 'audio', '🔊', 5),
  ('Other', 'other', '✨', 6);

-- Re-Seed Products with high-res images and correct category slugs
INSERT INTO products (name, slug, images, amazon_price, our_price, stock, category, featured, amazon_url, description)
VALUES
  -- SMARTPHONES
  ('Apple iPhone 16 Pro Max (256GB, Desert Titanium)', 'iphone-16-pro-max-256', ARRAY['https://m.media-amazon.com/images/I/618m051S39L._SX679_.jpg'], 144900, 130410, 10, 'smartphones', TRUE, 'https://www.amazon.in/dp/B0DGJ9N27P', '6.9-inch Super Retina XDR display, A18 Pro chip, 48MP Fusion camera, Titanium design.'),
  ('Samsung Galaxy S24 Ultra (12GB RAM, 256GB Storage, Titanium Gray)', 'samsung-s24-ultra-256', ARRAY['https://m.media-amazon.com/images/I/71RVuS3q9QL._SX679_.jpg'], 129999, 116999, 10, 'smartphones', TRUE, 'https://www.amazon.in/dp/B0CSZ54L68', 'Galaxy AI, 200MP Main Camera, 6.8-inch QHD+ Display, Snapdragon 8 Gen 3.'),
  ('OnePlus 12 (12GB RAM, 256GB Storage, Silky Black)', 'oneplus-12-256', ARRAY['https://m.media-amazon.com/images/I/717v-e-rS+L._SX679_.jpg'], 64999, 58499, 10, 'smartphones', TRUE, 'https://www.amazon.in/dp/B0CQYF6R1S', 'Snapdragon 8 Gen 3, 50MP Hasselblad Camera, 5400mAh Battery, 100W SUPERVOOC.'),
  
  -- TABLETS
  ('Apple iPad Pro 11-inch (M4 Chip, OLED, 256GB)', 'ipad-pro-m4-11-256', ARRAY['https://m.media-amazon.com/images/I/61YpY7G6VBL._SX679_.jpg'], 99900, 89910, 10, 'tablets', TRUE, 'https://www.amazon.in/dp/B0D3CH9P9N', 'Ultra Retina XDR display, M4 chip, Ultra-thin design, Apple Pencil Pro support.'),
  ('Samsung Galaxy Tab S9 Ultra (12GB/256GB, 5G)', 'samsung-tab-s9-ultra-5g', ARRAY['https://m.media-amazon.com/images/I/51f9M7-K7WL._SX679_.jpg'], 119999, 107999, 10, 'tablets', FALSE, 'https://www.amazon.in/dp/B0CC9H5W6R', '14.6-inch Dynamic AMOLED 2X, S Pen included, Snapdragon 8 Gen 2, IP68.'),

  -- SMARTWATCHES
  ('Apple Watch Ultra 2 (GPS + Cellular, 49mm)', 'apple-watch-ultra-2', ARRAY['https://m.media-amazon.com/images/I/91z56VzX56L._SX679_.jpg'], 89900, 80910, 10, 'smartwatches', TRUE, 'https://www.amazon.in/dp/B0DGFY3QW2', 'The most rugged and capable Apple Watch. 3000 nits display, S9 SiP.'),
  ('Samsung Galaxy Watch Ultra (LTE, 47mm)', 'samsung-watch-ultra-47', ARRAY['https://m.media-amazon.com/images/I/71Lm4rIm0cL._SX679_.jpg'], 59999, 53999, 10, 'smartwatches', TRUE, 'https://www.amazon.in/dp/B0D8X8X1C1', 'Titanium design, Dual-frequency GPS, Advanced fitness tracking.'),

  -- ACCESSORIES
  ('Apple AirPods Pro (2nd Generation) with USB-C', 'apple-airpods-pro-2', ARRAY['https://m.media-amazon.com/images/I/61f1YfLf4eL._SX679_.jpg'], 24900, 22410, 10, 'accessories', TRUE, 'https://www.amazon.in/dp/B0CHX7NNDL', 'Active Noise Cancellation, Transparency mode, Adaptive Audio, Spatial Audio.'),
  ('Sony WH-1000XM5 Wireless Noise Cancelling Headphones', 'sony-wh-1000xm5', ARRAY['https://m.media-amazon.com/images/I/51SKu69u2SL._SX679_.jpg'], 29990, 26991, 10, 'accessories', FALSE, 'https://www.amazon.in/dp/B0B1GC8V9F', 'Industry-leading noise cancellation, 30-hour battery life, Multipoint connection.'),

  -- OTHER
  ('Apple 20W USB-C Power Adapter', 'apple-20w-adapter', ARRAY['https://m.media-amazon.com/images/I/219m051S39L._SX679_.jpg'], 1900, 1710, 50, 'other', FALSE, 'https://www.amazon.in/dp/B08L5TNJHG', 'Fast, efficient charging at home, in the office, or on the go.')
ON CONFLICT (slug) DO NOTHING;
