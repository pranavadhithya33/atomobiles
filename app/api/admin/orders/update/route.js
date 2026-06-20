import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { orderId, status } = await request.json();
    const supabase = createAdminClient();
    
    // First attempt: Update matching id (uuid)
    let { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select();

    // Second attempt: If it returned no rows and is not a valid UUID format, try partial UUID matching if applicable
    if (error || !data || data.length === 0) {
      if (orderId && orderId.length === 8) {
        const searchId = orderId.toLowerCase();
        // Since we cannot run raw update on ilike filter, retrieve the matching order first
        const { data: list, error: searchError } = await supabase
          .from('orders')
          .select('id')
          .filter('id', 'ilike', `${searchId}%`)
          .limit(1);
          
        if (!searchError && list && list.length > 0) {
          const actualId = list[0].id;
          const { data: updateRes, error: updateErr } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', actualId)
            .select();
          if (!updateErr) {
            data = updateRes;
            error = null;
          }
        }
      }
    }

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
