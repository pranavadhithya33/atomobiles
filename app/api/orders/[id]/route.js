import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';

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

// Admin PUT endpoint to update order status or custom step
export async function PUT(req, context) {
  // Admin auth guard
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await context.params;
    const body = await req.json();
    const adminSupabase = createAdminClient();

    const updateData = {};

    // If status is being updated (from dropdown), clear custom_step
    if (body.status !== undefined) {
      updateData.status = body.status;
      updateData.custom_step = null;
    }

    // If custom_step is being updated (from text input)
    if (body.custom_step !== undefined) {
      updateData.custom_step = body.custom_step || null;
    }

    // Allow updating step1 through step6
    ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].forEach(s => {
      if (body[s] !== undefined) {
        updateData[s] = body[s] || '';
      }
    });

    // Allow updating current_step
    if (body.current_step !== undefined) {
      updateData.current_step = Number(body.current_step);
    }

    const { data: order, error } = await adminSupabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}

// Admin DELETE endpoint to remove an order
export async function DELETE(req, context) {
  // Admin auth guard
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await context.params;
    const adminSupabase = createAdminClient();

    // 1. Delete associated coin transactions to prevent foreign key constraint errors
    await adminSupabase.from('coin_transactions').delete().eq('order_id', id);

    // 2. Delete the order
    const { error } = await adminSupabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 });
  }
}
