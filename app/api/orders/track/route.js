import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query order by id (uuid)
    let { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    // Try short ID check if no exact match (ilike partial match)
    if (!data && orderId.length === 8) {
      const searchId = orderId.toLowerCase();
      const { data: list, error: searchError } = await supabase
        .from('orders')
        .select('*')
        .filter('id', 'ilike', `${searchId}%`)
        .limit(1);
      
      if (!searchError && list && list.length > 0) {
        data = list[0];
      }
    }

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
