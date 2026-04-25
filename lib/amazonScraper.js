import * as cheerio from 'cheerio';
import { slugify } from '@/lib/utils';

/**
 * Scrape Amazon product page and return normalized data.
 */
export async function scrapeAmazonProduct(url, category) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US,en;q=0.5',
  };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Title
    const title = $('#productTitle').text().trim();
    if (!title) throw new Error('Title missing - Amazon blocked the request');

    // Image – high-res if possible
    let imageUrl = '';
    const imgData = $('#imgTagWrapperId img').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image');
    if (imgData) {
      try {
        const parsed = JSON.parse(imgData);
        const urls = Object.keys(parsed);
        imageUrl = urls[urls.length - 1];
      } catch (_) {}
    }
    if (!imageUrl) {
      imageUrl = $('#landingImage').attr('data-old-hires') || $('#landingImage').attr('src') || $('#main-image').attr('src');
    }

    // Price
    let priceText = $('.a-price-whole').first().text().trim() ||
                    $('.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen').first().text().trim() ||
                    $('.a-price .a-offscreen').first().text().trim() ||
                    $('#priceblock_ourprice').text().trim() ||
                    $('#priceblock_dealprice').text().trim();
    if (!priceText) {
      const alt = $('#corePrice_feature_div .a-offscreen').first().text().trim();
      if (alt) priceText = alt;
    }
    const amazonPrice = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;
    if (!amazonPrice || isNaN(amazonPrice)) throw new Error('Price missing');

    // Description
    let descriptionText = '';
    $('#feature-bullets ul li span').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.toLowerCase().includes('click here')) descriptionText += `• ${text}\n`;
    });
    
    const specs = [];
    $('.prodDetTable tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const val = $(el).find('td').text().trim();
      if (key && val) specs.push(`${key}: ${val}`);
    });
    if (specs.length > 0) descriptionText += `\nTECHNICAL SPECIFICATIONS:\n${specs.join('\n')}`;
    if (!descriptionText) descriptionText = title;

    // Stock
    const availability = $('#availability span').text().trim().toLowerCase();
    const isOut = availability.includes('currently unavailable') || availability.includes('out of stock');
    const stock = isOut ? 0 : 20;

    const productSlug = slugify(title.slice(0, 50));

    return {
      name: title,
      slug: productSlug,
      images: imageUrl ? [imageUrl] : [],
      amazon_price: amazonPrice,
      flipkart_price: 0,
      online_price: amazonPrice,
      amazon_url: url,
      description: descriptionText,
      stock,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: Math.round(amazonPrice * 0.9),
    };
  } catch (err) {
    console.error('Amazon Scraper failed, using failsafe:', err.message);
    
    // FAILSAFE: Extract name from URL if possible
    let fallbackName = 'Unknown Smartphone';
    const match = url.match(/amazon\.in\/([^\/]+)\//);
    if (match && match[1]) {
      fallbackName = match[1].replace(/-/g, ' ');
    }
    
    const fallbackPrice = 50000; // Mock price
    const productSlug = slugify(fallbackName.slice(0, 50)) + '-' + Date.now();
    
    return {
      name: fallbackName,
      slug: productSlug,
      images: [],
      amazon_price: fallbackPrice,
      flipkart_price: 0,
      online_price: fallbackPrice,
      amazon_url: url,
      description: 'Product details temporarily unavailable due to Amazon bot protection. Please update manually.',
      stock: 10,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: Math.round(fallbackPrice * 0.9),
    };
  }
}

