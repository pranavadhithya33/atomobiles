import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, phone, email, password } = await request.json();

    if (!name || !phone || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // 2. Insert into profiles (bypassing Supabase Auth)
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: cleanEmail,
        password: password, // Storing as plain text as requested by user
        coins_balance: 0,
        total_orders: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // 3. Set secure cookie
    cookies().set({
      name: 'user_token',
      value: newUser.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
