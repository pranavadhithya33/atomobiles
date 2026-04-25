const fs = require('fs');

const realPhones = [
  { name: 'Apple iPhone 15 Pro Max', slug: 'apple-iphone-15-pro-max', imgSlug: 'apple-iphone-15-pro-max', price: 159999 },
  { name: 'Apple iPhone 15 Pro', slug: 'apple-iphone-15-pro', imgSlug: 'apple-iphone-15-pro', price: 134900 },
  { name: 'Apple iPhone 15', slug: 'apple-iphone-15', imgSlug: 'apple-iphone-15', price: 79900 },
  { name: 'Apple iPhone 14', slug: 'apple-iphone-14', imgSlug: 'apple-iphone-14', price: 69900 },
  { name: 'Apple iPhone 13', slug: 'apple-iphone-13', imgSlug: 'apple-iphone-13', price: 59900 },
  { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', imgSlug: 'samsung-galaxy-s24-ultra-5g-sm-s928', price: 129999 },
  { name: 'Samsung Galaxy S24+', slug: 'samsung-galaxy-s24-plus', imgSlug: 'samsung-galaxy-s24-plus-5g-sm-s926', price: 99999 },
  { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', imgSlug: 'samsung-galaxy-s24-5g-sm-s921', price: 79999 },
  { name: 'Samsung Galaxy S23 Ultra', slug: 'samsung-galaxy-s23-ultra', imgSlug: 'samsung-galaxy-s23-ultra-5g', price: 104999 },
  { name: 'Samsung Galaxy A54', slug: 'samsung-galaxy-a54', imgSlug: 'samsung-galaxy-a54-5g', price: 35999 },
  { name: 'Samsung Galaxy Z Fold5', slug: 'samsung-galaxy-z-fold5', imgSlug: 'samsung-galaxy-z-fold5-5g', price: 154999 },
  { name: 'Samsung Galaxy Z Flip5', slug: 'samsung-galaxy-z-flip5', imgSlug: 'samsung-galaxy-z-flip5-5g', price: 85999 },
  { name: 'OnePlus 12', slug: 'oneplus-12', imgSlug: 'oneplus-12', price: 64999 },
  { name: 'OnePlus 12R', slug: 'oneplus-12r', imgSlug: 'oneplus-12r', price: 39999 },
  { name: 'OnePlus 11', slug: 'oneplus-11', imgSlug: 'oneplus-11', price: 56999 },
  { name: 'OnePlus Nord 3', slug: 'oneplus-nord-3', imgSlug: 'oneplus-nord-3-5g', price: 33999 },
  { name: 'OnePlus Open', slug: 'oneplus-open', imgSlug: 'oneplus-open', price: 139999 },
  { name: 'Google Pixel 8 Pro', slug: 'google-pixel-8-pro', imgSlug: 'google-pixel-8-pro', price: 106999 },
  { name: 'Google Pixel 8', slug: 'google-pixel-8', imgSlug: 'google-pixel-8', price: 75999 },
  { name: 'Google Pixel 7a', slug: 'google-pixel-7a', imgSlug: 'google-pixel-7a', price: 43999 },
  { name: 'Google Pixel 7 Pro', slug: 'google-pixel-7-pro', imgSlug: 'google-pixel-7-pro', price: 70999 },
  { name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra', imgSlug: 'xiaomi-14-ultra', price: 99999 },
  { name: 'Xiaomi 14', slug: 'xiaomi-14', imgSlug: 'xiaomi-14', price: 69999 },
  { name: 'Xiaomi 13 Pro', slug: 'xiaomi-13-pro', imgSlug: 'xiaomi-13-pro', price: 79999 },
  { name: 'Xiaomi Redmi Note 13 Pro+', slug: 'xiaomi-redmi-note-13-pro-plus', imgSlug: 'xiaomi-redmi-note-13-pro-plus', price: 31999 },
  { name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13-pro', imgSlug: 'xiaomi-redmi-note-13-pro', price: 25999 },
  { name: 'Vivo X100 Pro', slug: 'vivo-x100-pro', imgSlug: 'vivo-x100-pro', price: 89999 },
  { name: 'Vivo X100', slug: 'vivo-x100', imgSlug: 'vivo-x100', price: 63999 },
  { name: 'Vivo V30 Pro', slug: 'vivo-v30-pro', imgSlug: 'vivo-v30-pro', price: 41999 },
  { name: 'Vivo V30', slug: 'vivo-v30', imgSlug: 'vivo-v30', price: 33999 },
  { name: 'Oppo Find N3 Flip', slug: 'oppo-find-n3-flip', imgSlug: 'oppo-find-n3-flip', price: 94999 },
  { name: 'Oppo Reno 11 Pro', slug: 'oppo-reno-11-pro', imgSlug: 'oppo-reno-11-pro', price: 39999 },
  { name: 'Oppo Reno 11', slug: 'oppo-reno-11', imgSlug: 'oppo-reno-11', price: 29999 },
  { name: 'Realme 12 Pro+', slug: 'realme-12-pro-plus', imgSlug: 'realme-12-pro-plus', price: 29999 },
  { name: 'Realme 12 Pro', slug: 'realme-12-pro', imgSlug: 'realme-12-pro', price: 25999 },
  { name: 'Realme 11 Pro+', slug: 'realme-11-pro-plus', imgSlug: 'realme-11-pro-plus', price: 27999 },
  { name: 'Motorola Edge 50 Pro', slug: 'motorola-edge-50-pro', imgSlug: 'motorola-edge-50-pro', price: 31999 },
  { name: 'Motorola Razr 40 Ultra', slug: 'motorola-razr-40-ultra', imgSlug: 'motorola-razr-40-ultra', price: 79999 },
  { name: 'Nothing Phone (2)', slug: 'nothing-phone-2', imgSlug: 'nothing-phone-2', price: 39999 },
  { name: 'Nothing Phone (2a)', slug: 'nothing-phone-2a', imgSlug: 'nothing-phone-2a', price: 23999 },
  { name: 'Poco X6 Pro', slug: 'poco-x6-pro', imgSlug: 'poco-x6-pro', price: 26999 },
  { name: 'iQOO 12', slug: 'iqoo-12', imgSlug: 'vivo-iqoo-12', price: 52999 },
  { name: 'iQOO Neo 9 Pro', slug: 'iqoo-neo-9-pro', imgSlug: 'vivo-iqoo-neo-9-pro', price: 35999 }
];

let sql = '-- Massive Real Phones Catalog Seed\n';
sql += 'TRUNCATE products CASCADE;\n\n';
sql += 'INSERT INTO products (name, slug, images, amazon_price, online_price, our_price, stock, category, featured, amazon_url, description)\nVALUES\n';

const values = [];

realPhones.forEach(phone => {
  const ourPrice = Math.round(phone.price * 0.9);
  const imageUrl = `https://fdn2.gsmarena.com/vv/bigpic/${phone.imgSlug}.jpg`;
  const desc = `The ${phone.name} is a premium smartphone featuring a stunning display, powerful processor, and advanced camera system.\n\nTECHNICAL SPECIFICATIONS:\nBrand: ${phone.name.split(' ')[0]}\nModel: ${phone.name}\nCondition: Brand New\nWarranty: 1 Year Manufacturer Warranty`;
  const amazonUrl = `https://www.amazon.in/s?k=${phone.slug}`;

  values.push(`  ('${phone.name}', '${phone.slug}', ARRAY['${imageUrl}'], ${phone.price}, ${phone.price}, ${ourPrice}, 20, 'smartphones', FALSE, '${amazonUrl}', '${desc}')`);
});

sql += values.join(',\n') + '\nON CONFLICT (slug) DO NOTHING;\n';

fs.writeFileSync('supabase/seed_all_phones.sql', sql);
