import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status'); // admin can filter by status

    if (!productId && !status) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // If admin requests all pending reviews (no productId, status=pending)
    if (status && !productId) {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, user_name, rating, comment, status, created_at')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    // Public: only return approved reviews for a product
    let query = supabase
      .from('reviews')
      .select('id, user_name, rating, comment, created_at')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Reviews GET error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { product_id, user_name, rating, comment } = body;

    if (!product_id || !user_name || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id, user_name, rating: parseInt(rating), comment: comment || '', status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Reviews POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Admin: update review status (approve/reject)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid review ID or status' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Reviews PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
