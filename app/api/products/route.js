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
      .select('id, name, slug, images, online_price, our_price, stock, category, featured')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (featured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, images, online_price, our_price, description, stock, category, featured, prepaid_discount_pct } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('products')
      .insert([{ name, slug, images, online_price, our_price, description, stock, category, featured: featured || false, prepaid_discount_pct: prepaid_discount_pct || 3 }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Product create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
