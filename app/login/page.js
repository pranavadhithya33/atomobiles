'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Redirect back to where they came from with a full reload to update Header
      window.location.href = decodeURIComponent(redirectTo) || '/';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#fff',
    border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Atomobiles
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Login to place orders & use your Atom Coins</div>
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
              <Link href="/forgot-password" style={{ fontSize: '11px', color: 'var(--brand-accent-dark)', fontWeight: '700', textDecoration: 'none' }}>Forgot?</Link>
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
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: '10px', padding: '12px 16px', color: 'var(--error)', fontSize: '13px', lineHeight: '1.5' }}>
              ❌ {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            style={{ padding: '14px', background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </motion.button>

          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            New to Atomobiles?{' '}
            <Link href="/signup" style={{ color: 'var(--brand-accent-dark)', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
          </div>
        </form>

        <div style={{ marginTop: '24px', padding: '14px 16px', background: 'rgba(244, 167, 36, 0.05)', borderRadius: '12px', border: '1px solid rgba(244, 167, 36, 0.2)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            🪙 <strong style={{ color: 'var(--brand-accent-dark)' }}>Atom Coins</strong> — Earn 1 coin per ₹1000 spent, redeem on next orders.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-page)' }} />}>
      <LoginForm />
    </Suspense>
  );
}
