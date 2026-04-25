// app/api/orders/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      full_name, phone, address, pincode,
      product_id, product_name, product_slug,
      payment_option, base_price, discount_amount, final_price, advance_amount
    } = body;

    // Server-side validation
    if (!full_name?.trim()) return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone?.replace(/\s+/g, ''))) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    if (!/^[1-9][0-9]{5}$/.test(pincode?.trim())) return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
    if (!['half_cod', 'full_prepaid'].includes(payment_option)) return NextResponse.json({ error: 'Invalid payment option' }, { status: 400 });
    if (!final_price || final_price <= 0) return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('orders')
      .insert([{
        full_name: full_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        product_id,
        product_name,
        product_slug,
        payment_option,
        base_price,
        discount_amount: discount_amount || 0,
        final_price,
        advance_amount: advance_amount || null,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Order create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
