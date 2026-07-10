import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import puppeteer from 'puppeteer';

async function scrapeAmazon(page) {
    const title = await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => 'Title not found');
    const priceStr = await page.$eval('.a-price-whole', el => el.innerText.trim()).catch(() => '0');
    const price = parseInt(priceStr.replace(/,/g, ''), 10) || 0;
    const img = await page.$eval('#landingImage', el => el.src).catch(() => '');
    return { title, price, img, brand: title.split(' ')[0] };
}

async function scrapeFlipkart(page) {
    const title = await page.$eval('.B_NuCI, .VU-Tyg', el => el.innerText.trim()).catch(() => 'Title not found');
    const priceStr = await page.$eval('._30jeq3, .Nx9bqj', el => el.innerText.trim()).catch(() => '0');
    const price = parseInt(priceStr.replace(/₹|,/g, ''), 10) || 0;
    const img = await page.$eval('._396cs4, ._3exPp9, .v2Vak8', el => el.src).catch(() => '');
    return { title, price, img, brand: title.split(' ')[0] };
}

export async function POST(request) {
  let browser = null;
  try {
    const { url, category } = await request.json();

    if (!url || (!url.includes('amazon') && !url.includes('flipkart'))) {
      return NextResponse.json({ error: 'Please provide a valid Amazon or Flipkart India product URL' }, { status: 400 });
    }

    const isFlipkart = url.includes('flipkart');

    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    let data = {};
    if (isFlipkart) {
        data = await scrapeFlipkart(page);
    } else {
        data = await scrapeAmazon(page);
    }

    if (!data.title || data.title === 'Title not found') {
        throw new Error('Failed to scrape product details. The page might have blocked the request.');
    }

    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const ourPrice = Math.round(data.price * 0.9);

    // Prepare payload based on the scrape script logic
    const scrapedData = {
      name: data.title,
      slug: slug,
      images: data.img ? [data.img] : [],
      amazon_price: isFlipkart ? 0 : data.price,
      flipkart_price: isFlipkart ? data.price : 0,
      online_price: data.price,
      amazon_url: isFlipkart ? '' : url,
      flipkart_url: isFlipkart ? url : '',
      description: data.title, // using title as a basic description
      stock: 20,
      category: category || 'smartphones',
      prepaid_discount_pct: 3,
      featured: false,
      our_price: ourPrice,
    };

    // Save to Supabase — deduplicate slug if needed
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', scrapedData.slug)
      .single();

    if (existing) {
      scrapedData.slug = `${scrapedData.slug}-${Date.now()}`;
    }

    const { data: savedProduct, error } = await supabase
      .from('products')
      .insert(scrapedData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, product: savedProduct });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
        await browser.close();
    }
  }
}
