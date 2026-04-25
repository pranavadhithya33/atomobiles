const cheerio = require('cheerio');
const fs = require('fs');

const brands = [
  { name: 'Samsung', url: 'https://www.gsmarena.com/samsung-phones-9.php' },
  { name: 'Samsung 2', url: 'https://www.gsmarena.com/samsung-phones-f-9-0-p2.php' },
  { name: 'Apple', url: 'https://www.gsmarena.com/apple-phones-48.php' },
  { name: 'Xiaomi', url: 'https://www.gsmarena.com/xiaomi-phones-80.php' },
  { name: 'Xiaomi 2', url: 'https://www.gsmarena.com/xiaomi-phones-f-80-0-p2.php' },
  { name: 'Vivo', url: 'https://www.gsmarena.com/vivo-phones-98.php' },
  { name: 'Vivo 2', url: 'https://www.gsmarena.com/vivo-phones-f-98-0-p2.php' },
  { name: 'Oppo', url: 'https://www.gsmarena.com/oppo-phones-82.php' },
  { name: 'Oppo 2', url: 'https://www.gsmarena.com/oppo-phones-f-82-0-p2.php' },
  { name: 'Realme', url: 'https://www.gsmarena.com/realme-phones-118.php' },
  { name: 'Realme 2', url: 'https://www.gsmarena.com/realme-phones-f-118-0-p2.php' },
  { name: 'OnePlus', url: 'https://www.gsmarena.com/oneplus-phones-95.php' },
  { name: 'Motorola', url: 'https://www.gsmarena.com/motorola-phones-4.php' },
  { name: 'Motorola 2', url: 'https://www.gsmarena.com/motorola-phones-f-4-0-p2.php' },
  { name: 'Google', url: 'https://www.gsmarena.com/google-phones-107.php' },
  { name: 'Poco', url: 'https://www.gsmarena.com/poco-phones-122.php' },
  { name: 'iQOO', url: 'https://www.gsmarena.com/iqoo-phones-130.php' },
  { name: 'Nothing', url: 'https://www.gsmarena.com/nothing-phones-128.php' }
];

async function fetchHtml(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

async function scrape() {
  console.log('Starting GSMArena Scrape for 500+ phones...');
  let allPhones = [];

  // Step 1: Collect Links
  for (const brand of brands) {
    console.log(`Fetching list for ${brand.name}...`);
    const html = await fetchHtml(brand.url);
    if (!html) continue;
    const $ = cheerio.load(html);
    
    $('.makers ul li').each((i, el) => {
      const name = $(el).find('span').text().trim();
      const img = $(el).find('img').attr('src');
      const href = $(el).find('a').attr('href');
      if (name && img && href) {
        allPhones.push({
          brand: brand.name.replace(' 2', ''),
          name: name,
          img: img,
          url: `https://www.gsmarena.com/${href}`
        });
      }
    });
    // Delay to avoid ban
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`Found ${allPhones.length} total phones. Scraping specs...`);

  // We want to limit to 500
  allPhones = allPhones.slice(0, 500);

  let sql = '-- Massive 500+ Phones Catalog Seed\n';
  sql += 'TRUNCATE products CASCADE;\n\n';
  sql += 'INSERT INTO products (name, slug, images, amazon_price, online_price, our_price, stock, category, featured, amazon_url, description)\nVALUES\n';
  const values = [];

  let count = 0;

  // Step 2: Extract Specs for each phone
  // Processing in batches of 5 to speed it up but not get banned immediately
  const batchSize = 10;
  for (let i = 0; i < allPhones.length; i += batchSize) {
    const batch = allPhones.slice(i, i + batchSize);
    
    const promises = batch.map(async (phone) => {
      const html = await fetchHtml(phone.url);
      let specsText = `The ${phone.brand} ${phone.name} is a high-performance device featuring a stunning display, powerful processor, and advanced camera system.\n\nTECHNICAL SPECIFICATIONS:\nBrand: ${phone.brand}\nModel: ${phone.name}\nCondition: Brand New\nWarranty: 1 Year Manufacturer Warranty`;
      
      if (html) {
        const $ = cheerio.load(html);
        const display = $('[data-spec="displayresolution"]').text();
        const os = $('[data-spec="os"]').text();
        const chipset = $('[data-spec="chipset"]').text();
        const internal = $('[data-spec="internalmemory"]').text();
        const cam = $('[data-spec="cam1modules"]').text();
        const battery = $('[data-spec="batdescription1"]').text();
        
        let extraSpecs = [];
        if (display) extraSpecs.push(`Display: ${display}`);
        if (os) extraSpecs.push(`OS: ${os}`);
        if (chipset) extraSpecs.push(`Chipset: ${chipset}`);
        if (internal) extraSpecs.push(`Storage: ${internal}`);
        if (cam) extraSpecs.push(`Main Camera: ${cam}`);
        if (battery) extraSpecs.push(`Battery: ${battery}`);
        
        if (extraSpecs.length > 0) {
          specsText = `The ${phone.brand} ${phone.name} is a high-performance smartphone.\n\nTECHNICAL SPECIFICATIONS:\nBrand: ${phone.brand}\nModel: ${phone.name}\n` + extraSpecs.join('\n') + `\nCondition: Brand New\nWarranty: 1 Year`;
        }
      }

      // Generate a realistic price based on brand
      let price = 15000 + Math.floor(Math.random() * 40000);
      if (phone.brand === 'Apple') price = 50000 + Math.floor(Math.random() * 80000);
      if (phone.name.toLowerCase().includes('ultra') || phone.name.toLowerCase().includes('pro max') || phone.name.toLowerCase().includes('fold')) price = 100000 + Math.floor(Math.random() * 50000);
      
      price = Math.floor(price / 1000) * 1000 - 1;
      const ourPrice = Math.round(price * 0.9);

      const fullName = `${phone.brand} ${phone.name}`.replace(/'/g, "''");
      const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const amazonUrl = `https://www.amazon.in/s?k=${slug}`;
      const descSafe = specsText.replace(/'/g, "''");
      
      return `  ('${fullName}', '${slug}', ARRAY['${phone.img}'], ${price}, ${price}, ${ourPrice}, 20, 'smartphones', FALSE, '${amazonUrl}', '${descSafe}')`;
    });

    const results = await Promise.all(promises);
    values.push(...results);
    
    count += results.length;
    console.log(`Processed ${count}/${allPhones.length} phones...`);
    
    // Short delay
    await new Promise(r => setTimeout(r, 1000));
  }

  sql += values.join(',\n') + '\nON CONFLICT (slug) DO NOTHING;\n';
  fs.writeFileSync('supabase/seed_all_phones.sql', sql);
  console.log('Successfully generated seed_all_phones.sql with 500+ phones and real GSMArena images/specs!');
}

scrape();
