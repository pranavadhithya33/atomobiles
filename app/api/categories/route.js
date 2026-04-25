// app/api/categories/route.js
import { supabase, createAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Categories fetch error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('categories')
      .insert([{ name: body.name, slug: body.slug, icon: body.icon, display_order: body.display_order || 0 }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
