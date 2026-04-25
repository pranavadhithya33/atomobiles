import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { scrapeAmazonProduct } from '@/lib/amazonScraper';
import phoneUrls from '@/supabase/phone_urls.json';

export async function GET(request) {
  // Simple protection for the cron job (could also check Vercel Cron header)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // In production, you'd check if secret === process.env.CRON_SECRET
  
  const results = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  const supabase = createAdminClient();

  for (const item of phoneUrls) {
    try {
      results.processed++;
      
      // Scrape data
      const scrapedData = await scrapeAmazonProduct(item.url, item.category);
      
      // Try to find existing product by URL (better than slug for updates)
      const { data: existing } = await supabase
        .from('products')
        .select('id, slug')
        .eq('amazon_url', item.url)
        .single();
        
      if (existing) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            amazon_price: scrapedData.amazon_price,
            online_price: scrapedData.amazon_price,
            our_price: scrapedData.our_price,
            images: scrapedData.images,
            description: scrapedData.description,
            stock: scrapedData.stock,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
          
        if (updateError) throw updateError;
        results.updated++;
      } else {
        // Insert new product
        // Check slug conflict first
        const { data: slugMatch } = await supabase
          .from('products')
          .select('id')
          .eq('slug', scrapedData.slug)
          .single();
          
        if (slugMatch) {
          scrapedData.slug = `${scrapedData.slug}-${Date.now()}`;
        }
        
        const { error: insertError } = await supabase
          .from('products')
          .insert(scrapedData);
          
        if (insertError) throw insertError;
        results.inserted++;
      }
      
      // Small delay to avoid aggressive scraping detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error processing ${item.url}:`, error.message);
      results.skipped++;
      results.errors.push({ url: item.url, error: error.message });
    }
  }

  return NextResponse.json(results);
}
