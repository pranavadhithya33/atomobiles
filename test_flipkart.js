const cheerio = require('cheerio');

async function testFlipkart() {
  const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  };

  try {
    const res = await fetch(url, { headers });
    const html = await res.text();
    const $ = cheerio.load(html);

    let title = $('meta[property="og:title"]').attr('content') || $('h1').text().trim();
    let imageUrl = $('meta[property="og:image"]').attr('content') || '';
    
    console.log('Title:', title);
    console.log('Image:', imageUrl);
    
    const jsonldStr = $('script[id="jsonLD"]').html();
    console.log('JSONLD length:', jsonldStr ? jsonldStr.length : 0);
    
    if (jsonldStr) {
      try {
        const data = JSON.parse(jsonldStr);
        console.log('JSON-LD name:', data[0]?.name || data?.name);
        console.log('JSON-LD image:', data[0]?.image || data?.image);
      } catch (e) {
        console.error('Failed to parse JSON-LD', e.message);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testFlipkart();
