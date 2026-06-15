'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!form.name.trim() || form.name.trim().length < 2) return setError('Enter your full name (at least 2 characters)');
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s+/g, ''))) return setError('Enter a valid 10-digit Indian mobile number');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to profile page after successful signup and login with full reload
      window.location.href = '/profile';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: '24px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>Check your email!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
            We&apos;ve sent a confirmation link to <strong>{form.email}</strong>. Please click it to verify your account and log in.
          </p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--brand-primary)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Atomobiles
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your account to shop & earn coins</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input id="signup-name" type="text" placeholder="Rahul Sharma" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input id="signup-phone" type="tel" placeholder="9876543210" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input id="signup-email" type="email" placeholder="you@email.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input id="signup-password" type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: '10px', padding: '12px 16px', color: 'var(--error)', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}

          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit" disabled={loading}
            style={{ padding: '14px', background: 'var(--brand-primary)', color: 'var(--text-primary)', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </motion.button>

          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand-accent-dark)', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
          </div>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(244, 167, 36, 0.05)', borderRadius: '12px', border: '1px solid rgba(244, 167, 36, 0.2)' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--brand-accent-dark)', marginBottom: '4px' }}>🪙 Welcome Bonus: Atom Coins</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Get 1 coin per ₹1000 spent. Redeem on your next order.</div>
        </div>
      </motion.div>
    </div>
  );
}
