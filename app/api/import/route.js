import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

export async function POST(request) {
  try {
    const { url, category } = await request.json();

    if (!url || !url.includes('amazon.in') && !url.includes('amazon.com')) {
      return NextResponse.json({ error: 'Please provide a valid Amazon India/US product URL' }, { status: 400 });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Extract Title
    const title = $('#productTitle').text().trim();
    if (!title) throw new Error('Product title not found. Amazon might have blocked the request.');

    // 2. Extract Image
    let imageUrl = '';
    const imgTag = $('#landingImage').attr('data-old-hires') || $('#landingImage').attr('src');
    if (imgTag) {
      imageUrl = imgTag;
    }

    // 3. Extract Price
    let priceText = $('.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen').first().text() ||
                    $('.a-price .a-offscreen').first().text() ||
                    $('#priceblock_ourprice').text() ||
                    $('#priceblock_dealprice').text();
                    
    let amazonPrice = 0;
    if (priceText) {
      amazonPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }

    // 4. Extract Stock Status
    const availability = $('#availability span').text().trim().toLowerCase();
    const isOutOfStock = availability.includes('currently unavailable') || availability.includes('out of stock');
    const stock = isOutOfStock ? 0 : 10;

    if (!amazonPrice || isNaN(amazonPrice)) {
      throw new Error('Price not found on this Amazon page.');
    }

    // 5. Calculate our 10% discount price
    const ourPrice = Math.round(amazonPrice * 0.9);
    
    // Create base product object
    const productSlug = slugify(title.slice(0, 50));
    const newProduct = {
      name: title,
      slug: productSlug,
      images: imageUrl ? [imageUrl] : [],
      amazon_price: amazonPrice,
      flipkart_price: 0,
      online_price: amazonPrice,
      amazon_url: url,
      our_price: ourPrice,
      stock: stock,
      category: category || 'Smartphones',
      prepaid_discount_pct: 3,
      featured: false,
    };

    // Save to Supabase
    const supabase = createAdminClient();
    
    // Check if slug exists to avoid unique constraint error
    const { data: existing } = await supabase.from('products').select('id').eq('slug', productSlug).single();
    
    let result;
    if (existing) {
       // Append timestamp to slug if duplicate
       newProduct.slug = `${productSlug}-${Date.now()}`;
       result = await supabase.from('products').insert(newProduct).select().single();
    } else {
       result = await supabase.from('products').insert(newProduct).select().single();
    }

    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({ success: true, product: result.data });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
