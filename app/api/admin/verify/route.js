// app/api/admin/verify/route.js
import { NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/adminAuth';

export async function POST(req) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If env var is missing, refuse to authenticate
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password not configured on server' }, { status: 500 });
    }

    if (password === adminPassword) {
      // Generate a token that the client will send with admin API requests
      const token = generateAdminToken();
      const response = NextResponse.json({ success: true, token });
      
      response.cookies.set({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
