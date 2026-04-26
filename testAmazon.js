const testUrl = 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY';

async function testAmazon() {
  const cheerio = require('cheerio');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  const res = await fetch(testUrl, { headers });
  console.log('Status:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);
  
  const $ = cheerio.load(html);
  
  console.log('\n--- TITLE ---');
  console.log('#productTitle:', $('#productTitle').text().trim().substring(0, 80));
  console.log('og:title:', $('meta[property="og:title"]').attr('content'));
  
  console.log('\n--- IMAGE ---');
  const imgData = $('#imgTagWrapperId img').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image');
  console.log('imgData exists:', !!imgData);
  if (imgData) {
    try {
      const parsed = JSON.parse(imgData);
      const urls = Object.keys(parsed);
      console.log('Image count:', urls.length);
      console.log('First image:', urls[0]);
      console.log('Last image:', urls[urls.length - 1]);
    } catch(e) { console.log('parse error'); }
  }
  console.log('og:image:', $('meta[property="og:image"]').attr('content'));
  
  // Try alternative image selectors
  console.log('altHires:', $('#landingImage').attr('data-old-hires'));
  console.log('src:', $('#landingImage').attr('src')?.substring(0, 80));
  
  // Check for image list (carousel)
  const imageList = [];
  $('li.a-spacing-small.item img').each((_, el) => {
    const src = $(el).attr('data-old-hires') || $(el).attr('src');
    if (src && !src.includes('gif')) imageList.push(src.substring(0, 60));
  });
  console.log('Carousel images:', imageList.length, imageList[0]);

  console.log('\n--- PRICE ---');
  console.log('.a-price-whole:', $('.a-price-whole').first().text().trim());
  console.log('corePrice:', $('#corePrice_feature_div .a-offscreen').first().text().trim());
  console.log('apexPrice:', $('.apexPriceToPay .a-offscreen').first().text().trim());
  
  const priceMatches = html.match(/"priceAmount":"([0-9.]+)"/);
  console.log('JSON price match:', priceMatches ? priceMatches[1] : 'none');

  console.log('\n--- DESCRIPTION ---');
  let desc = '';
  $('#feature-bullets ul li span').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length > 5) desc += '• ' + t.substring(0,80) + '\n';
  });
  console.log('Bullets count:', desc.split('\n').length);
  console.log('First bullet:', desc.split('\n')[0]);
}

testAmazon().catch(console.error);
