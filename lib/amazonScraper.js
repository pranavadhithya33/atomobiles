import * as cheerio from 'cheerio';
import { slugify } from '@/lib/utils';

/**
 * Scrape Amazon India product page.
 * Extracts: title, all images (high-res), price, description, stock.
 * our_price = 10% discount from amazon price.
 */
export async function scrapeAmazonProduct(url, category) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  try {
    let html = '';
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (res.ok) {
      html = await res.text();
    } else {
      // Amazon blocks Vercel datacenter IPs — fall back to allorigins proxy
      console.log(`Direct Amazon fetch failed (${res.status}), trying proxy...`);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl, { cache: 'no-store' });
      if (!proxyRes.ok) throw new Error(`Amazon unavailable (${res.status}). Try again in a moment.`);
      html = await proxyRes.text();
    }

    if (!html || html.length < 5000) throw new Error('Amazon returned an empty page. Please try again.');
    const $ = cheerio.load(html);

    // ── TITLE ──────────────────────────────────────────────────────────
    const title =
      $('#productTitle').text().trim() ||
      $('meta[name="title"]').attr('content') ||
      $('title').text().replace(/[:\|].*$/, '').trim() ||
      'Amazon Product';

    // ── IMAGES ─────────────────────────────────────────────────────────
    // Strategy 1: Parse the dynamic image data JSON (contains all sizes)
    const images = [];
    const addImage = (src) => {
      if (!src || src.includes('gif') || src.includes('transparent') || src.includes('pixel')) return;
      // Upgrade to high-res by replacing size suffix
      const hiRes = src.replace(/\._[A-Z0-9_,]+_\./g, '._SL1500_.');
      if (!images.includes(hiRes)) images.push(hiRes);
    };

    // Main image – altHires is always highest quality
    const mainAltHires = $('#landingImage').attr('data-old-hires') || 
                         $('#imgTagWrapperId img').attr('data-old-hires');
    if (mainAltHires) addImage(mainAltHires);

    // Dynamic image map (the JSON blob Amazon embeds)
    const imgDataStr = $('#imgTagWrapperId img').attr('data-a-dynamic-image') ||
                       $('#landingImage').attr('data-a-dynamic-image');
    if (imgDataStr) {
      try {
        const imgMap = JSON.parse(imgDataStr);
        // Sort by resolution (width*height) descending, take top
        const sorted = Object.entries(imgMap).sort((a, b) => (b[1][0]*b[1][1]) - (a[1][0]*a[1][1]));
        for (const [imgUrl] of sorted.slice(0, 1)) addImage(imgUrl);
      } catch (_) {}
    }

    // Carousel thumbnails — each has a data-old-hires attribute
    $('li.a-spacing-small.item img, #altImages li img').each((_, el) => {
      const hiRes = $(el).attr('data-old-hires');
      const src   = $(el).attr('src');
      if (hiRes) addImage(hiRes);
      else if (src) addImage(src);
    });

    // Fallback
    if (images.length === 0) {
      const fallback = $('#landingImage').attr('src') || $('#main-image').attr('src');
      if (fallback) addImage(fallback);
    }

    // ── PRICE ──────────────────────────────────────────────────────────
    // Try multiple selectors Amazon uses
    const rawPrice =
      $('.a-price-whole').first().text().replace(/[^0-9]/g, '') ||
      $('#corePrice_feature_div .a-offscreen').first().text().replace(/[^0-9]/g, '') ||
      $('.apexPriceToPay .a-offscreen').first().text().replace(/[^0-9]/g, '') ||
      $('#priceblock_ourprice').text().replace(/[^0-9]/g, '') ||
      $('#priceblock_dealprice').text().replace(/[^0-9]/g, '');

    let amazonPrice = rawPrice ? parseInt(rawPrice, 10) : 0;

    // Regex fallback — scan raw HTML
    if (!amazonPrice) {
      const m = html.match(/"priceAmount":"([0-9.]+)"/) ||
                html.match(/"price":"([0-9.]+)"/) ||
                html.match(/₹\s*([0-9,]+)/);
      if (m) amazonPrice = parseFloat(m[1].replace(/,/g, ''));
    }

    if (!amazonPrice || isNaN(amazonPrice) || amazonPrice < 100) {
      throw new Error('Could not extract a valid price from this Amazon page.');
    }

    // ── DESCRIPTION ────────────────────────────────────────────────────
    let descParts = [];

    // Feature bullets (most important — first ~6)
    let bulletCount = 0;
    $('#feature-bullets ul li span.a-list-item').each((_, el) => {
      if (bulletCount >= 8) return;
      const text = $(el).text().trim();
      if (text && text.length > 5 && !text.toLowerCase().includes('make sure this fits')) {
        descParts.push(`• ${text}`);
        bulletCount++;
      }
    });

    // Tech specs table
    const specs = [];
    $('.prodDetTable tr, #productDetails_techSpec_section_1 tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const val = $(el).find('td').text().replace(/\s+/g, ' ').trim();
      if (key && val && val !== '-') specs.push(`${key}: ${val}`);
    });
    if (specs.length > 0) {
      descParts.push('\nTECHNICAL SPECIFICATIONS:');
      descParts = descParts.concat(specs.slice(0, 15));
    }

    const descriptionText = descParts.join('\n') || title;

    // ── STOCK ──────────────────────────────────────────────────────────
    const availability = $('#availability span').text().trim().toLowerCase();
    const isOut = availability.includes('currently unavailable') || availability.includes('out of stock');
    const stock = isOut ? 0 : 20;

    // ── OUR PRICE = 10% off Amazon price ─────────────────────────────
    const ourPrice = Math.round(amazonPrice * 0.9);

    console.log(`Amazon scraped OK: "${title.substring(0, 40)}" ₹${amazonPrice} → ₹${ourPrice} | ${images.length} images`);

    return {
      name: title,
      slug: slugify(title.slice(0, 50)),
      images,
      amazon_price: amazonPrice,
      flipkart_price: 0,
      online_price: amazonPrice,
      amazon_url: url,
      description: descriptionText,
      stock,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: ourPrice,
    };

  } catch (err) {
    console.error('Amazon Scraper error:', err.message);

    // Graceful fallback using URL slug
    let fallbackName = 'Amazon Product';
    const match = url.match(/amazon\.in\/([^\/]+)\//);
    if (match?.[1]) fallbackName = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const fallbackPrice = 50000;
    return {
      name: fallbackName,
      slug: slugify(fallbackName.slice(0, 50)) + '-' + Date.now(),
      images: [],
      amazon_price: fallbackPrice,
      flipkart_price: 0,
      online_price: fallbackPrice,
      amazon_url: url,
      description: `Could not fetch full product details. Error: ${err.message}. Please edit product manually.`,
      stock: 10,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: Math.round(fallbackPrice * 0.9),
    };
  }
}
