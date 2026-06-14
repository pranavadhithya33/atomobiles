import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const userToken = cookies().get('user_token')?.value;

    if (!userToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Query profiles using admin bypass
    const supabaseAdmin = createAdminClient();
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone, email, coins_balance, total_orders')
      .eq('id', userToken)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me Error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
