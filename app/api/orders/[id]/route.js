import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Public GET endpoint to fetch order details for tracking
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const adminSupabase = createAdminClient();
    
    // First attempt: Exact match
    let { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // Second attempt: Short ID match (if id is 8 chars long)
    if (!data && id.length === 8) {
      const searchId = id.toLowerCase();
      const { data: list, error: searchError } = await adminSupabase
        .from('orders')
        .select('*')
        .filter('id', 'ilike', `${searchId}%`)
        .limit(1);
      
      if (!searchError && list && list.length > 0) {
        data = list[0];
      }
    }

    // Third attempt: If ilike fails on UUID (depends on Supabase version), use range
    if (!data && id.length === 8) {
      const searchId = id.toLowerCase();
      const { data: list, error: searchError } = await adminSupabase
        .from('orders')
        .select('*')
        .gte('id', `${searchId}-0000-0000-0000-000000000000`)
        .lte('id', `${searchId}-ffff-ffff-ffff-ffffffffffff`)
        .limit(1);
      
      if (!searchError && list && list.length > 0) {
        data = list[0];
      }
    }

    if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Order fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// Admin PUT endpoint to update order status
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const adminSupabase = createAdminClient();

    const { data: order, error } = await adminSupabase
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
