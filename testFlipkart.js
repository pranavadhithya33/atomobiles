const cheerio = require('cheerio');

async function test() {
  try {
    const res = await fetch('https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4', { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en-US,en;q=0.5',
      } 
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log('--- OG TAGS ---');
    console.log('OG Title:', $('meta[property="og:title"]').attr('content'));
    console.log('OG Image:', $('meta[property="og:image"]').attr('content'));
    console.log('OG Desc:', $('meta[property="og:description"]').attr('content'));
    
    console.log('--- DOM EXTRACT ---');
    console.log('Price (.Nx9bqj):', $('div.Nx9bqj').first().text());
    console.log('Title (h1):', $('h1').text().trim());
    
    const priceMatches = html.match(/₹[0-9,]+/g);
    console.log('Prices regex:', priceMatches ? Array.from(new Set(priceMatches)).slice(0, 5) : 'none');
    
    // Look for description in class _1mXcCf or .yNsrrc
    console.log('Desc (.yNsrrc):', $('.yNsrrc').text().substring(0, 100));
    
    // Look in JSON-LD
    const jsonld = $('script[id="jsonLD"]').html();
    if (jsonld) {
      try {
        const data = JSON.parse(jsonld);
        console.log('JSON-LD found. Contains desc:', !!data[0]?.description);
        
        let price = null;
        if (data[0] && data[0].offers) {
          if (Array.isArray(data[0].offers)) {
            price = data[0].offers[0]?.price;
          } else {
            price = data[0].offers.price;
          }
        }
        console.log('JSON-LD Price:', price);
      } catch(e) {}
    }
    
  } catch(e) {
    console.error(e);
  }
}
test();
