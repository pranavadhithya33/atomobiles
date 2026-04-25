import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { scrapeAmazonProduct } from '@/lib/amazonScraper';

export async function POST(request) {
  try {
    const { url, category } = await request.json();

    if (!url || (!url.includes('amazon.in') && !url.includes('amazon.com'))) {
      return NextResponse.json({ error: 'Please provide a valid Amazon India/US product URL' }, { status: 400 });
    }

    const scrapedData = await scrapeAmazonProduct(url, category);
    
    // Save to Supabase
    const supabase = createAdminClient();
    
    // Check if slug exists
    const { data: existing } = await supabase.from('products').select('id').eq('slug', scrapedData.slug).single();
    
    let result;
    if (existing) {
       scrapedData.slug = `${scrapedData.slug}-${Date.now()}`;
       result = await supabase.from('products').insert(scrapedData).select().single();
    } else {
       result = await supabase.from('products').insert(scrapedData).select().single();
    }

    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({ success: true, product: result.data });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
