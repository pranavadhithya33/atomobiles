import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const adminSupabase = createAdminClient();
    
    // Fetch the product that is the deal of the day
    const { data, error } = await adminSupabase
      .from('products')
      .select('*')
      .eq('is_deal_of_the_day', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows found'
      throw error;
    }

    if (!data) {
      return NextResponse.json({ deal: null });
    }

    return NextResponse.json({ deal: data });
  } catch (err) {
    console.error('Error fetching deal of the day:', err);
    return NextResponse.json({ deal: null }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminSupabase = createAdminClient();
    const body = await req.json();
    const { product_id, deal_price, expires_at } = body;

    // First, unset any existing deals
    await adminSupabase
      .from('products')
      .update({ is_deal_of_the_day: false, deal_price: null, deal_expires_at: null })
      .eq('is_deal_of_the_day', true);

    // If product_id is provided, set the new deal
    if (product_id) {
      const { data, error } = await adminSupabase
        .from('products')
        .update({
          is_deal_of_the_day: true,
          deal_price: deal_price,
          deal_expires_at: expires_at
        })
        .eq('id', product_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, deal: data });
    }

    return NextResponse.json({ success: true, deal: null });
  } catch (err) {
    console.error('Error setting deal of the day:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
