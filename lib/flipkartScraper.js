import * as cheerio from 'cheerio';
import { slugify } from '@/lib/utils';

/**
 * Scrape Flipkart product page.
 * Extracts: title, images, price, specifications.
 * our_price = 10% discount from flipkart price.
 */
export async function scrapeFlipkartProduct(url, category) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  try {
    let html = '';
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (res.ok) {
      html = await res.text();
    } else {
      // Fall back to Proxy 1 (AllOrigins)
      console.log(`Direct Flipkart fetch failed (${res.status}), trying proxy 1...`);
      const proxyUrl1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyRes1 = await fetch(proxyUrl1, { cache: 'no-store' });
      
      if (proxyRes1.ok) {
        html = await proxyRes1.text();
      } else {
        // Fall back to Proxy 2 (CorsProxy.io)
        console.log(`Proxy 1 failed (${proxyRes1.status}), trying proxy 2...`);
        const proxyUrl2 = `https://api.corsproxy.io/?url=${encodeURIComponent(url)}`;
        try {
          const proxyRes2 = await fetch(proxyUrl2, { cache: 'no-store' });
          if (proxyRes2.ok) {
            html = await proxyRes2.text();
          } else {
            throw new Error(`Flipkart unavailable (Status ${proxyRes2.status}).`);
          }
        } catch (err) {
          throw new Error(`Flipkart connection overloaded (529). Try again in a minute or add details manually.`);
        }
      }
    }

    if (!html || html.length < 5000) throw new Error('Flipkart returned an empty page. Please try again.');
    const $ = cheerio.load(html);

    // ── TITLE ──────────────────────────────────────────────────────────
    const title =
      $('h1').text().trim() ||
      $('.B_NuCI').text().trim() ||
      $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() ||
      'Flipkart Product';

    // ── IMAGES ─────────────────────────────────────────────────────────
    const images = [];
    const addImage = (src) => {
      if (!src || src.includes('gif') || src.includes('base64')) return;
      // Convert thumbnail URLs to high-res
      let hiRes = src.replace(/\/\d+\/\d+\//, '/800/800/').replace(/q=\d+/, 'q=90');
      if (!images.includes(hiRes)) images.push(hiRes);
    };

    // Main image
    const mainImg = $('img.DByo73, img._396cs4, img._2r_T1_, img._53u0Z-').first().attr('src');
    if (mainImg) addImage(mainImg);

    // Gallery images
    $('li._208S6Y img, img.q6DClP, img._1B0S_8').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) addImage(src);
    });

    // Fallback: search for all product-like images in DOM
    if (images.length === 0) {
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && (src.includes('/image/') || src.includes('/blobio/')) && !src.includes('placeholder')) {
          addImage(src);
        }
      });
    }

    // Deep Fallback: search for JSON data in script tags (Flipkart embeds product data)
    if (images.length === 0) {
      $('script').each((_, el) => {
        const content = $(el).html();
        if (content && content.includes('http') && content.includes('/image/')) {
          const matches = content.match(/https:\/\/rukminim[0-9]\.flixcart\.com\/image\/[^\s"']+/g);
          if (matches) {
            matches.forEach(m => addImage(m));
          }
        }
      });
    }

    // ── PRICE ──────────────────────────────────────────────────────────
    const rawPrice =
      $('.Nx9bqj._1e069J').first().text().replace(/[^0-9]/g, '') ||
      $('.Nx9bqj').first().text().replace(/[^0-9]/g, '') ||
      $('._30jeq3._16Jk6d').first().text().replace(/[^0-9]/g, '') ||
      $('._30jeq3').first().text().replace(/[^0-9]/g, '') ||
      $('[class*="Nx9bqj"]').first().text().replace(/[^0-9]/g, '');

    let flipkartPrice = rawPrice ? parseInt(rawPrice, 10) : 0;

    // Regex fallback for price
    if (!flipkartPrice || flipkartPrice < 100) {
      const priceMatches = html.match(/₹([0-9,]+)/g);
      if (priceMatches) {
        // Usually the largest price or the one near "MRP" is the one
        const values = priceMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10)).filter(v => v > 100);
        if (values.length > 0) flipkartPrice = values[0];
      }
    }

    if (!flipkartPrice || isNaN(flipkartPrice)) {
      throw new Error('Could not extract a valid price from this Flipkart page.');
    }

    // ── SPECIFICATIONS ─────────────────────────────────────────────────
    let descParts = [];
    
    // Summary points if available
    $('._21A6_g li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) descParts.push(`• ${text}`);
    });

    // Specifications table
    const specs = [];
    $('tr._1s_OAs').each((_, el) => {
      const key = $(el).find('td._24L_S_').text().trim();
      const val = $(el).find('td._3z6n_V').text().trim();
      if (key && val) specs.push(`${key}: ${val}`);
    });

    if (specs.length > 0) {
      if (descParts.length > 0) descParts.push(''); // spacer
      descParts.push('TECHNICAL SPECIFICATIONS:');
      descParts = descParts.concat(specs.slice(0, 20));
    }

    const descriptionText = descParts.join('\n') || title;

    // ── OUR PRICE = 10% off Flipkart price ─────────────────────────────
    const ourPrice = Math.round(flipkartPrice * 0.9);

    console.log(`Flipkart scraped OK: "${title.substring(0, 40)}" ₹${flipkartPrice} → ₹${ourPrice} | ${images.length} images`);

    return {
      name: title,
      slug: slugify(title.slice(0, 50)) + '-' + Date.now().toString().slice(-4),
      images: images.slice(0, 6),
      amazon_price: 0,
      flipkart_price: flipkartPrice,
      online_price: flipkartPrice,
      amazon_url: '',
      flipkart_url: url,
      description: descriptionText,
      stock: 20,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: ourPrice,
    };

  } catch (err) {
    console.error('Flipkart Scraper error:', err.message);
    
    // Graceful fallback
    let fallbackName = 'Flipkart Product';
    const match = url.match(/flipkart\.com\/([^\/]+)\//);
    if (match?.[1]) fallbackName = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const fallbackPrice = 50000;
    return {
      name: fallbackName,
      slug: slugify(fallbackName.slice(0, 50)) + '-' + Date.now(),
      images: [],
      amazon_price: 0,
      flipkart_price: fallbackPrice,
      online_price: fallbackPrice,
      amazon_url: '',
      flipkart_url: url,
      description: `Could not fetch full product details. Error: ${err.message}. Please edit product manually.`,
      stock: 10,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: Math.round(fallbackPrice * 0.9),
    };
  }
}
