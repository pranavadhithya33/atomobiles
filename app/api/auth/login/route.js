import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query profiles using admin bypass
    const supabaseAdmin = createAdminClient();
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', password)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    // Set secure cookie
    cookies().set({
      name: 'user_token',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
