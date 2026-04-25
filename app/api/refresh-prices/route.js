// app/api/refresh-prices/route.js
// Called by Vercel Cron every night at 2 AM IST
// Scrapes live Amazon prices and updates Supabase. Traffic hits Supabase, not Amazon.

import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const SCRAPER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'no-cache',
};

async function scrapeAmazonPrice(url) {
  try {
    const res = await fetch(url, { headers: SCRAPER_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try multiple selectors (Amazon updates their HTML structure)
    const priceSelectors = [
      '.a-price.aok-align-center.reinventPricePriceToPayMargin .a-offscreen',
      '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
      '#corePrice_feature_div .a-offscreen',
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.priceToPay .a-offscreen',
    ];

    let priceText = null;
    for (const sel of priceSelectors) {
      const val = $(sel).first().text().trim();
      if (val) { priceText = val; break; }
    }

    if (!priceText) return null;

    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || price <= 0) return null;

    // Check stock status
    const availability = $('#availability span').text().toLowerCase();
    const outOfStock = availability.includes('currently unavailable') ||
                       availability.includes('out of stock') ||
                       availability.includes('unavailable');

    return { price, outOfStock };
  } catch {
    return null; // Silently fail — keep old price
  }
}

export async function GET(req) {
  // Security: only allow Vercel Cron or admin secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'og-cron-2024';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  
  // Fetch all products that have an Amazon URL
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, amazon_url, amazon_price, our_price, stock')
    .not('amazon_url', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { updated: 0, failed: 0, skipped: 0, errors: [] };

  for (const product of products) {
    if (!product.amazon_url) { results.skipped++; continue; }

    // Stagger requests: wait 2-4s between each to avoid bot detection
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

    const scraped = await scrapeAmazonPrice(product.amazon_url);

    if (!scraped || !scraped.price) {
      results.failed++;
      results.errors.push(`${product.name}: scrape failed, keeping last price`);
      continue;
    }

    // Calculate our 10% discount price
    const newOurPrice = Math.round(scraped.price * 0.9);
    const newStock = scraped.outOfStock ? 0 : (product.stock > 0 ? product.stock : 10);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        amazon_price: scraped.price,
        online_price: scraped.price,
        our_price: newOurPrice,
        stock: newStock,
        price_refreshed_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    if (updateError) {
      results.failed++;
      results.errors.push(`${product.name}: DB update failed`);
    } else {
      results.updated++;
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
