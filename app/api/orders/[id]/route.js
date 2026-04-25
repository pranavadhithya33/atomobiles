import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase';

// Public GET endpoint to fetch order details for tracking (requires exact UUID)
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    
    // We use the admin client because the regular user doesn't have RLS access to orders
    // The exact UUID acts as the secure secret key for tracking.
    const adminSupabase = createAdminClient();
    
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// Admin PUT endpoint to update order status
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    // Using admin client
    const adminSupabase = createAdminClient();
    
    const { data, error } = await adminSupabase
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
