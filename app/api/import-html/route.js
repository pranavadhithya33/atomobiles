import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import * as cheerio from 'cheerio';
import { slugify } from '@/lib/utils';

export async function POST(request) {
  try {
    const { html, url, source } = await request.json();

    if (!html || !url) {
      return NextResponse.json({ error: 'Missing html or url' }, { status: 400 });
    }

    let scrapedData;
    if (source === 'flipkart') {
      scrapedData = parseFlipkartHtml(html, url);
    } else {
      return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    // Save to Supabase
    const supabase = createAdminClient();
    const { data: existing } = await supabase.from('products').select('id').eq('slug', scrapedData.slug).single();
    if (existing) {
      scrapedData.slug = `${scrapedData.slug}-${Date.now()}`;
    }

    const result = await supabase.from('products').insert(scrapedData).select().single();
    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({ success: true, product: result.data });

  } catch (error) {
    console.error('import-html error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseFlipkartHtml(html, url) {
  const $ = cheerio.load(html);

  // 1. Title — OG tag first, then h1
  let title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim();
  if (title) title = title.replace(/^Buy /, '').replace(/ Online at Best Price.+$/i, '').trim();

  // 2. Image — OG tag upgraded to 1080x1080
  let imageUrl = $('meta[property="og:image"]').attr('content') || '';
  if (imageUrl) {
    imageUrl = imageUrl.replace(/\/image\/\d+\/\d+\//, '/image/1080/1080/');
    // Remove query params that downscale
    imageUrl = imageUrl.split('?')[0] + '?q=90';
  }

  // 3. JSON-LD structured data (most reliable for price + description)
  let flipkartPrice = 0;
  let descriptionText = '';

  $('script[type="application/ld+json"], script[id="jsonLD"]').each((_, el) => {
    if (flipkartPrice && descriptionText) return; // already found
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const productData = Array.isArray(data) ? data[0] : data;
      if (!productData['@type'] || !productData['@type'].toLowerCase().includes('product')) return;

      if (productData.name && !title) title = productData.name;
      if (productData.image && !imageUrl) {
        imageUrl = Array.isArray(productData.image) ? productData.image[0] : productData.image;
      }
      if (productData.description && !descriptionText) descriptionText = productData.description;
      if (productData.offers && !flipkartPrice) {
        const offer = Array.isArray(productData.offers) ? productData.offers[0] : productData.offers;
        if (offer && offer.price) flipkartPrice = parseFloat(offer.price);
      }
    } catch (e) { /* skip bad JSON */ }
  });

  // 4. Price regex fallback — scan for ₹ amounts
  if (!flipkartPrice) {
    const priceMatches = html.match(/₹([0-9,]+)/g);
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches
        .map(p => parseFloat(p.replace(/[^0-9]/g, '')))
        .filter(p => p > 999 && p < 999999);
      if (prices.length > 0) flipkartPrice = Math.min(...prices); // lowest = selling price
    }
  }

  // 5. Description fallback
  if (!descriptionText) {
    descriptionText = $('meta[property="og:description"]').attr('content') || '';
  }

  // 6. Fallback title from URL
  if (!title || title.length < 3) {
    const match = url.match(/flipkart\.com\/([^\/]+)\//);
    title = match && match[1] ? match[1].replace(/-/g, ' ') : 'Flipkart Product';
  }

  if (!flipkartPrice || isNaN(flipkartPrice)) flipkartPrice = 25000;
  if (!descriptionText) descriptionText = title;

  console.log(`Parsed Flipkart HTML: title="${title.substring(0, 40)}" price=${flipkartPrice} image=${imageUrl ? 'YES' : 'NO'}`);

  return {
    name: title,
    slug: slugify(title.slice(0, 50)),
    images: imageUrl ? [imageUrl] : [],
    amazon_price: 0,
    flipkart_price: flipkartPrice,
    online_price: flipkartPrice,
    flipkart_url: url,
    description: descriptionText,
    stock: 20,
    category: 'smartphones',
    featured: false,
    our_price: Math.round(flipkartPrice * 0.9),
  };
}
