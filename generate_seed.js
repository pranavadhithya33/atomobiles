const fs = require('fs');

const brands = [
  { name: 'Apple', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone SE (3rd Gen)'] },
  { name: 'Samsung', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23 FE', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy A54', 'Galaxy A34', 'Galaxy M14', 'Galaxy F54'] },
  { name: 'OnePlus', models: ['12', '12R', 'Open', '11 5G', '11R', 'Nord 3', 'Nord CE 3 Lite', '10 Pro', '10T'] },
  { name: 'Google', models: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6a'] },
  { name: 'Xiaomi', models: ['14 Ultra', '14', '13 Pro', 'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi 12 5G', 'Redmi 12C'] },
  { name: 'Vivo', models: ['X100 Pro', 'X100', 'V30 Pro', 'V30', 'V29', 'T2 Pro', 'Y200', 'Y28'] },
  { name: 'Oppo', models: ['Find N3 Flip', 'Reno 11 Pro', 'Reno 11', 'F25 Pro', 'A79', 'A59'] },
  { name: 'Realme', models: ['12 Pro+', '12 Pro', '12+', '11 Pro', 'C67', 'Narzo 60x', 'Narzo N53'] },
  { name: 'Motorola', models: ['Edge 50 Pro', 'Edge 40 Neo', 'Moto G84', 'Moto G54', 'Moto G34', 'Razr 40 Ultra'] },
  { name: 'Nothing', models: ['Phone (2)', 'Phone (2a)', 'Phone (1)'] },
  { name: 'Poco', models: ['X6 Pro', 'X6', 'M6 Pro', 'C65'] },
  { name: 'iQOO', models: ['12 5G', 'Neo 9 Pro', 'Z9', 'Z7 Pro'] }
];

let sql = '-- Massive 80+ Phones Catalog Seed\n';
sql += 'TRUNCATE products CASCADE;\n\n';
sql += 'INSERT INTO products (name, slug, images, amazon_price, our_price, stock, category, featured, amazon_url, description)\nVALUES\n';

const values = [];

brands.forEach(brand => {
  brand.models.forEach((model, idx) => {
    let price = 0;
    if (brand.name === 'Apple') price = 60000 + (10 - idx) * 10000;
    else if (brand.name === 'Samsung' && model.includes('Ultra')) price = 120000;
    else if (brand.name === 'Samsung' && model.includes('Fold')) price = 150000;
    else if (brand.name === 'Samsung') price = 20000 + (10 - idx) * 5000;
    else if (brand.name === 'OnePlus') price = 30000 + (9 - idx) * 5000;
    else price = 15000 + Math.floor(Math.random() * 40000);

    price = Math.floor(price / 1000) * 1000 - 1;
    const ourPrice = Math.round(price * 0.9);

    const imageUrl = `https://ui-avatars.com/api/?name=${brand.name.charAt(0)}+${model.charAt(0)}&size=512&background=f0f2f5&color=0a1628&font-size=0.33`;
    const fullName = `${brand.name} ${model}`;
    const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const desc = `The ${fullName} is a flagship device from ${brand.name}. Featuring a stunning display, powerful processor, and advanced camera system.\n\nTECHNICAL SPECIFICATIONS:\nBrand: ${brand.name}\nModel: ${model}\nCondition: Brand New`;
    const amazonUrl = `https://www.amazon.in/s?k=${slug}`;

    values.push(`  ('${fullName}', '${slug}', ARRAY['${imageUrl}'], ${price}, ${ourPrice}, 20, 'smartphones', FALSE, '${amazonUrl}', '${desc}')`);
  });
});

sql += values.join(',\n') + '\nON CONFLICT (slug) DO NOTHING;\n';

fs.writeFileSync('supabase/seed_all_phones.sql', sql);
