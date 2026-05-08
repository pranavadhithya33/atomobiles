// app/api/promo-stats/route.js
import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    // Anniversary starts on May 8, 2026
    const startDate = '2026-05-08T00:00:00Z';
    const endDate = '2026-05-10T23:59:59Z';

    const { count, error } = await adminSupabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .neq('status', 'cancelled');

    if (error) throw error;

    return NextResponse.json({
      count: count || 0,
      total: 100,
      isActive: new Date() >= new Date(startDate) && new Date() <= new Date(endDate)
    });
  } catch (err) {
    console.error('Promo stats error:', err);
    return NextResponse.json({ count: 0, total: 100, isActive: false });
  }
}
