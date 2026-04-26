const cheerio = require('cheerio');


async function testScraper(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept-Language': 'en-IN,en-US,en;q=0.5',
  };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    let title = $('meta[property="og:title"]').attr('content') || $('h1').text().trim();
    if (title) title = title.replace(/^Buy /, '').replace(/ Online at Best Price.+$/, '').trim();

    let imageUrl = $('meta[property="og:image"]').attr('content') || '';
    if (imageUrl && imageUrl.includes('?q=')) {
      imageUrl = imageUrl.replace(/\/image\/\d+\/\d+\//, '/image/1080/1080/');
    }

    let descriptionText = '';
    let flipkartPrice = 0;
    let jsonldTitle = '';
    let jsonldImage = '';

    // JSON-LD is the most reliable source
    const jsonldStr = $('script[id="jsonLD"]').html();
    if (jsonldStr) {
      try {
        const data = JSON.parse(jsonldStr);
        const productData = Array.isArray(data) ? data[0] : data;
        
        if (productData.description) {
          descriptionText = productData.description;
        }
        
        if (productData.offers) {
          const offer = Array.isArray(productData.offers) ? productData.offers[0] : productData.offers;
          if (offer && offer.price) {
            flipkartPrice = parseFloat(offer.price);
          }
        }
        
        if (productData.name) jsonldTitle = productData.name;
        if (productData.image) jsonldImage = Array.isArray(productData.image) ? productData.image[0] : productData.image;
      } catch (e) {
        console.error('Failed to parse JSON-LD', e);
      }
    }

    // Prioritize JSON-LD over fallback tags
    if (jsonldTitle) title = jsonldTitle;
    if (jsonldImage) imageUrl = jsonldImage;

    // Fallbacks if JSON-LD fails
    if (!title) throw new Error('Title missing - Flipkart blocked the request');
    
    if (!flipkartPrice) {
      const priceMatches = html.match(/₹[0-9,]+/g);
      if (priceMatches && priceMatches.length > 0) {
        flipkartPrice = parseFloat(priceMatches[0].replace(/[^0-9.]/g, ''));
      }
    }
    
    if (!flipkartPrice || isNaN(flipkartPrice)) throw new Error('Price missing');

    if (!descriptionText) {
      descriptionText = $('meta[property="og:description"]').attr('content') || title;
    }

    console.log("Success! Data:", { title, flipkartPrice, imageUrl });
  } catch (err) {
    console.error('Flipkart Scraper failed with error:', err.message);
    console.error(err.stack);
  }
}

testScraper('https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4');
