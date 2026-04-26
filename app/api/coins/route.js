// app/api/coins/route.js — Get and award coins
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/coins?userId=xxx — get user coins balance
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ coins_balance: 0 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('coins_balance, name')
      .eq('id', userId)
      .single();

    if (error) return NextResponse.json({ coins_balance: 0 });
    return NextResponse.json({ coins_balance: data.coins_balance || 0, name: data.name });
  } catch (err) {
    return NextResponse.json({ coins_balance: 0 });
  }
}

// POST /api/coins — award coins after delivery
export async function POST(req) {
  try {
    const { userId, orderId, finalPrice, action } = await req.json();
    const supabase = createAdminClient();

    if (action === 'award') {
      // 1 coin per ₹100 spent
      const coinsToAward = Math.floor(finalPrice / 100);
      if (coinsToAward < 1) return NextResponse.json({ success: true, coins_awarded: 0 });

      // Check if already awarded for this order
      const { data: existing } = await supabase
        .from('coin_transactions')
        .select('id')
        .eq('order_id', orderId)
        .eq('coins_earned', coinsToAward)
        .single();

      if (existing) return NextResponse.json({ success: true, already_awarded: true });

      // Award coins
      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({ user_id: userId, order_id: orderId, coins_earned: coinsToAward, description: `Earned for order delivery` });

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins_balance: supabase.rpc('increment', { x: coinsToAward }) })
        .eq('id', userId);

      // Use raw SQL increment to avoid race conditions
      await supabase.rpc('increment_coins', { user_id_param: userId, amount: coinsToAward });

      return NextResponse.json({ success: true, coins_awarded: coinsToAward });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Coins API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
