import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('final_price');
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.final_price || 0), 0) || 0;

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total dealers (safe check in case dealers table does not exist)
    let totalDealers = 0;
    try {
      const { count: dealersCount, error: dealersError } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true });
      if (!dealersError) {
        totalDealers = dealersCount || 0;
      }
    } catch (e) {
      console.log('Dealers table not queryable:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
        totalDealers,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
