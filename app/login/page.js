'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) return setError('Please enter your email address');
    if (!form.password) return setError('Please enter your password');

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('invalid_credentials')) {
          setError('Wrong email or password. Please try again, or create a new account.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Ensure profile exists
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
            coins_balance: 0,
          });
        }
      }

      // Redirect back to where they came from
      router.push(decodeURIComponent(redirectTo));
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#1a1a2e',
    border: '1px solid #2d2d3f', borderRadius: '10px', color: '#fff',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '600', color: '#9aa3b2',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '24px' }}>
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            Only <span style={{ color: '#f4a724' }}>Gadjets</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Login to place orders &amp; use your OG Coins</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={labelStyle}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '11px', color: '#f4a724', fontWeight: '700', textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: '#2d1111', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', lineHeight: '1.5' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px', background: 'linear-gradient(135deg, #f4a724, #e09410)', color: '#000', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </button>

          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            New to Only Gadjets?{' '}
            <Link href="/signup" style={{ color: '#f4a724', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
          </div>
        </form>

        <div style={{ marginTop: '24px', padding: '14px 16px', background: '#1a2235', borderRadius: '12px', border: '1px solid #1e3a5f' }}>
          <div style={{ fontSize: '12px', color: '#9aa3b2' }}>
            🪙 <strong style={{ color: '#60a5fa' }}>OG Coins</strong> — Earn 1 coin per ₹100 spent, redeem on next orders.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0f' }} />}>
      <LoginForm />
    </Suspense>
  );
}
