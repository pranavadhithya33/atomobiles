// app/api/products/[id]/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

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

    // Keep admin-set our_price as-is; attach market_price for display only
    const marketPrice = Math.max(data.amazon_price || 0, data.flipkart_price || 0, data.online_price || 0);
    const enriched = { ...data, market_price: marketPrice, stock: 10 };

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  // Admin auth guard
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    const fields = ['name', 'images', 'online_price', 'amazon_price', 'flipkart_price', 'amazon_url', 'flipkart_url', 'our_price', 'description', 'category', 'featured', 'prepaid_discount_pct'];
    fields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });
    // Always keep stock at 10 (always in stock)
    updateData.stock = 10;

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
  // Admin auth guard
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const adminSupabase = createAdminClient();
    
    // 1. Delete associated variants (Cascade)
    await adminSupabase.from('product_variants').delete().eq('product_id', id);
    
    // 2. Delete associated reviews (Cascade)
    await adminSupabase.from('reviews').delete().eq('product_id', id);

    // 3. Delete the product itself
    const { error } = await adminSupabase.from('products').delete().eq('id', id);
    if (error) {
      // If it still fails (e.g. FK constraint on orders), throw a clear message
      if (error.code === '23503') {
        throw new Error('Cannot delete this product because it has existing orders.');
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
