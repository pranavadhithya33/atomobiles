// app/api/products/[id]/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // Support both numeric id and slug
    const isUUID = /^[0-9a-f-]{36}$/.test(id);
    const query = isUUID
      ? supabase.from('products').select('*').eq('id', id).single()
      : supabase.from('products').select('*').eq('slug', id).single();

    const { data, error } = await query;
    if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Dynamically compute our_price as exactly 10% off the highest market price
    const marketPrice = Math.max(data.amazon_price || 0, data.flipkart_price || 0, data.online_price || 0);
    const ourPrice = marketPrice > 0 ? Math.round(marketPrice * 0.9) : data.our_price;
    const enriched = { ...data, our_price: ourPrice, market_price: marketPrice };

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    const fields = ['name', 'images', 'online_price', 'our_price', 'description', 'stock', 'category', 'featured', 'prepaid_discount_pct'];
    fields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
