// app/api/orders/route.js
import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const adminSupabase = createAdminClient();
    
    // Check if we're filtering by user
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await adminSupabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    let query = adminSupabase.from('orders').select('*');
    if (userId) query = query.eq('user_id', userId);
    
    const { data, error } = await query
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

    // Validation
    if (!full_name?.trim()) return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone?.replace(/\s+/g, ''))) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    if (!/^[1-9][0-9]{5}$/.test(pincode?.trim())) return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
    if (!['half_cod', 'full_prepaid', 'token_advance'].includes(payment_option)) return NextResponse.json({ error: 'Invalid payment option' }, { status: 400 });
    if (!final_price || final_price <= 0) return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

    const adminSupabase = createAdminClient();
    
    // Check for user session
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    const orderData = {
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
      status: 'pending',
    };

    // Safely add user_id only if column exists
    if (userId) {
      try {
        const { error: checkError } = await adminSupabase.from('orders').select('user_id').limit(1);
        if (!checkError) {
          orderData.user_id = userId;
        }
      } catch (e) {
        console.log('user_id column probably missing, skipping association');
      }
    }

    const { data, error } = await adminSupabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;

    // --- NEW: SuperCoins Logic ---
    if (userId && data) {
      try {
        const { coins_redeemed } = body;
        
        // 1. If coins were redeemed, subtract them from user balance
        if (coins_redeemed && coins_redeemed > 0) {
          await adminSupabase.rpc('decrement_coins', { 
            user_id: userId, 
            amount: coins_redeemed 
          });
          
          // Fallback if RPC doesn't exist
          const { data: profile } = await adminSupabase.from('profiles').select('coins_balance').eq('id', userId).single();
          if (profile) {
            await adminSupabase.from('profiles').update({ 
              coins_balance: Math.max(0, (profile.coins_balance || 0) - coins_redeemed) 
            }).eq('id', userId);
          }
        }

        // 2. Calculate newly earned coins: ₹1 spent = 10 coins (e.g., ₹100 = 1000 coins)
        const earnedCoins = Math.floor(final_price * 10);
        
        if (earnedCoins > 0) {
          // Increment coins in profiles table
          await adminSupabase.rpc('increment_coins', { 
            user_id: userId, 
            amount: earnedCoins 
          });
          
          // Fallback if RPC doesn't exist
          const { data: profile } = await adminSupabase.from('profiles').select('coins_balance').eq('id', userId).single();
          if (profile) {
            await adminSupabase.from('profiles').update({ 
              coins_balance: (profile.coins_balance || 0) + earnedCoins
            }).eq('id', userId);
          }
        }
      } catch (coinErr) {
        console.error('Error handling coins:', coinErr);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Order create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
