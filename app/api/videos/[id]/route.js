import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function PUT(req, { params }) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    
    // Check if this is a fallback video ID (1 through 10)
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(id)) {
      throw new Error('This is a fallback video. Please run the SQL INSERT script in your Supabase dashboard before editing videos.');
    }
    
    // We import createAdminClient inside to avoid circular deps if any
    const { createClient } = require('@supabase/supabase-js');
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await adminSupabase
      .from('video_reviews')
      .update({ 
        customer_name: body.customer_name,
        active: body.active
      })
      .eq('id', id);

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Table does not exist yet. Please run the setup SQL in Supabase first.');
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
