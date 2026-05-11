import { createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Use cookies() to bypass any potential edge caching
  const cookieStore = cookies();
  
  try {
    const adminSupabase = createAdminClient();
    
    // Anniversary reset to 100 on May 8, 2026 (current time)
    const startDate = '2026-05-08T16:40:00Z';
    const endDate = '2026-05-10T23:59:59Z';

    // Bypass aggregate blocks by using a simple select with id
    const { data, count, error } = await adminSupabase
      .from('orders')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const currentCount = count !== null ? count : (data ? data.length : 0);

    return NextResponse.json({
      count: currentCount,
      total: 100,
      isActive: true // Force active for the anniversary period
    });
  } catch (err) {
    console.error('Promo stats error:', err);
    return NextResponse.json({ 
      count: 0, 
      total: 100, 
      isActive: true, // Keep it live even on error to show the banner
      error: true 
    });
  }
}
