import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { scrapeAmazonProduct } from '@/lib/amazonScraper';

export async function POST(request) {
  try {
    const { url, category } = await request.json();

    if (!url || !url.includes('amazon')) {
      return NextResponse.json({ error: 'Please provide a valid Amazon India product URL' }, { status: 400 });
    }

    const scrapedData = await scrapeAmazonProduct(url, category);

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

    const { data, error } = await supabase
      .from('products')
      .insert(scrapedData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, product: data });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
