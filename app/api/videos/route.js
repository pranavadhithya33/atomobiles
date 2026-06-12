import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fallback data if table doesn't exist yet
const FALLBACK_VIDEOS = [
  { id: '1', url: '/videos/4.mp4', customer_name: 'Verified Customer', active: true },
  { id: '2', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.31 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '3', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.32 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '4', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.33 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '5', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM (1).mp4', customer_name: 'Verified Customer', active: true },
  { id: '6', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM (2).mp4', customer_name: 'Verified Customer', active: true },
  { id: '7', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.34 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '8', url: '/videos/WhatsApp Video 2026-06-06 at 9.37.35 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '9', url: '/videos/WhatsApp Video 2026-06-06 at 9.38.33 PM.mp4', customer_name: 'Verified Customer', active: true },
  { id: '10', url: '/videos/WhatsApp Video 2026-06-06 at 9.39.34 PM.mp4', customer_name: 'Verified Customer', active: true }
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const adminMode = searchParams.get('admin') === 'true';

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let query = supabase.from('video_reviews').select('*').order('created_at', { ascending: false });
    if (!adminMode) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    
    // If the table doesn't exist yet, return fallback
    if (error && error.code === '42P01') {
      return NextResponse.json(adminMode ? FALLBACK_VIDEOS : FALLBACK_VIDEOS.filter(v => v.active));
    }
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(adminMode ? FALLBACK_VIDEOS : FALLBACK_VIDEOS.filter(v => v.active));
  }
}
