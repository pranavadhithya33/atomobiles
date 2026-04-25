import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Headers to mimic a real browser to bypass basic anti-bot measures
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    const response = await fetch(url, { headers, next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    let priceText = null;

    if (url.includes('amazon.in')) {
      // Common Amazon price selectors
      priceText = $('.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen').first().text() ||
                  $('.a-price .a-offscreen').first().text() ||
                  $('#priceblock_ourprice').text() ||
                  $('#priceblock_dealprice').text();
    } else if (url.includes('flipkart.com')) {
      // Common Flipkart price selectors
      priceText = $('div.Nx9bqj.CxhGGd').first().text() || 
                  $('div._30jeq3._16Jk6d').first().text() ||
                  $('div.hl05eU').first().text();
    }

    // Detect Stock Status
    let outOfStock = false;
    const pageText = $('body').text().toLowerCase();
    if (url.includes('amazon.in')) {
      const availability = $('#availability span').text().toLowerCase();
      outOfStock = availability.includes('currently unavailable') || availability.includes('out of stock');
    } else if (url.includes('flipkart.com')) {
      outOfStock = pageText.includes('this item is currently out of stock') || pageText.includes('sold out');
    }

    if (!priceText) {
      return NextResponse.json({ price: null, error: 'Price element not found' });
    }

    // Clean up price text (e.g., "₹38,999.00" -> 38999)
    const numericPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    if (isNaN(numericPrice)) {
      return NextResponse.json({ price: null, error: 'Failed to parse price' });
    }

    return NextResponse.json({ price: numericPrice, outOfStock });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ price: null, error: error.message }, { status: 500 });
  }
}
