const cheerio = require('cheerio');
async function scrape(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US,en;q=0.5',
  };
  const res = await fetch(url, { headers });
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('#productTitle').text().trim();
  let priceText = $('.a-price-whole').first().text().trim();
  console.log('Title:', title);
  console.log('Price:', priceText);
  let imageUrl = '';
  const imgData = $('#imgTagWrapperId img').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image');
  if (imgData) {
    try {
      const parsed = JSON.parse(imgData);
      imageUrl = Object.keys(parsed).pop();
    } catch(e){}
  }
  console.log('Image:', imageUrl);
}
scrape('https://www.amazon.in/dp/B0DGJ9N27P');
