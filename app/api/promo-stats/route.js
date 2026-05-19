import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    // Giveaway: 3,000 orders milestone already achieved.
    // Next 300 orders placed after the giveaway launch get a special gift.
    const GIVEAWAY_LIMIT = 300;

    // The exact date/time the giveaway was announced and goes live
    const GIVEAWAY_START = '2026-05-19T05:45:00Z';

    // Count non-cancelled orders placed AFTER the giveaway launch
    const { count, error } = await adminSupabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', GIVEAWAY_START)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Supabase promo-stats error:', error);
      throw error;
    }

    const claimed = typeof count === 'number' ? Math.min(count, GIVEAWAY_LIMIT) : 0;
    const isActive = claimed < GIVEAWAY_LIMIT;

    return NextResponse.json({
      count: claimed,
      total: GIVEAWAY_LIMIT,
      isActive,
    });
  } catch (err) {
    console.error('Promo stats error:', err);
    // On error, hide the banner — never show broken data
    return NextResponse.json({
      count: 0,
      total: 300,
      isActive: false,
    });
  }
}
