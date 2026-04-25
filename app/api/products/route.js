// app/api/products/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('products')
      .select('id, name, slug, images, online_price, amazon_price, flipkart_price, amazon_url, our_price, stock, category, featured, description');

    if (search) {
      query = query.textSearch('fts', search.trim().split(/\s+/).join(' & '));
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (featured) {
      query = query.eq('featured', true);
    }

    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    // Dynamically compute our_price as exactly 10% off the highest market price
    const enriched = (data || []).map(p => {
      const marketPrice = Math.max(p.amazon_price || 0, p.flipkart_price || 0, p.online_price || 0);
      const ourPrice = marketPrice > 0 ? Math.round(marketPrice * 0.9) : p.our_price;
      return { ...p, our_price: ourPrice, market_price: marketPrice };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, images, online_price, our_price, description, stock, category, featured } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('products')
      .insert([{ name, slug, images, online_price, our_price, description, stock, category, featured: featured || false }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Product create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
