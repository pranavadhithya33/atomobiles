const cheerio = require('cheerio');
const https = require('https');

async function scrape(url) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    }
  };
  try {
    const res = await fetch(url, options);
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('#productTitle').text().trim();
    let priceText = $('.a-price-whole').first().text().trim();
    console.log('Title:', title);
    console.log('Price:', priceText);
  } catch (e) {
    console.error(e);
  }
}
scrape('https://www.amazon.in/dp/B0DGJ9N27P');
