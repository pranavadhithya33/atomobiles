// app/api/products/[id]/variants/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/products/[id]/variants
// Returns all enabled variants for a product (public)
// Pass ?all=true to get all variants including disabled (admin use)
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    // Resolve product_id — support both UUID and slug
    let productId = id;
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id')
        .eq('slug', id)
        .single();
      if (error || !product) return NextResponse.json([], { status: 200 });
      productId = product.id;
    }

    let query = supabase
      .from('product_variants')
      .select('id, ram, storage, price, enabled')
      .eq('product_id', productId)
      .order('ram', { ascending: true })
      .order('storage', { ascending: true });

    if (!all) {
      query = query.eq('enabled', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Variants GET error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/products/[id]/variants
// Body: { variants: [{ram, storage, price, enabled}, ...] }
// Replaces ALL variants for this product (admin only — uses service role)
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { variants } = body;

    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: 'variants must be an array' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Resolve UUID
    let productId = id;
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      const { data: product, error } = await adminSupabase
        .from('products')
        .select('id')
        .eq('slug', id)
        .single();
      if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      productId = product.id;
    }

    // Delete existing variants for this product
    await adminSupabase.from('product_variants').delete().eq('product_id', productId);

    // Insert new variants (only those with a valid price)
    const toInsert = variants
      .filter(v => v.price && Number(v.price) > 0)
      .map(v => ({
        product_id: productId,
        ram: Number(v.ram),
        storage: Number(v.storage),
        price: Number(v.price),
        enabled: v.enabled !== false, // default true
      }));

    if (toInsert.length > 0) {
      const { error } = await adminSupabase.from('product_variants').insert(toInsert);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, saved: toInsert.length });
  } catch (err) {
    console.error('Variants POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
