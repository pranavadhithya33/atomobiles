import { scrapeFlipkartProduct } from './lib/flipkartScraper.js';

async function testPerfectScraper() {
  const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';
  console.log('Testing Robust Flipkart Scraper...');
  
  try {
    const data = await scrapeFlipkartProduct(url, 'smartphones');
    console.log('\n--- Scraped Data Result ---');
    console.log('Name:', data.name);
    console.log('Market Price:', data.flipkart_price);
    console.log('Our Price:', data.our_price);
    console.log('Images Count:', data.images.length);
    console.log('First Image:', data.images[0]);
    console.log('Description Length:', data.description.length);
    
    if (data.flipkart_price === 50000 && data.images.length === 0) {
      console.log('\n❌ STILL HITTING FALLBACK DATA!');
    } else {
      console.log('\n✅ SUCCESS: REAL DATA EXTRACTED!');
    }
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

testPerfectScraper();
