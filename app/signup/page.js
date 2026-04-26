'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
      // Step 1: Create account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { name: form.name.trim(), phone: form.phone.trim() }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Step 2: Auto-login immediately after signup (works when email confirmation is disabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        // Email confirmation might be required — show success with instruction
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Step 3: Create profile record
      if (signInData?.user) {
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          coins_balance: 0,
        });
      }

      // Redirect to home
      router.push('/');
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
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            Only <span style={{ color: '#f4a724' }}>Gadjets</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Create your account to shop &amp; earn coins</div>
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
            <div style={{ background: '#2d1111', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ padding: '14px', background: 'linear-gradient(135deg, #f4a724, #e09410)', color: '#000', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </button>

          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#f4a724', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
          </div>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#1a2235', borderRadius: '12px', border: '1px solid #1e3a5f' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#60a5fa', marginBottom: '6px' }}>🪙 Earn OG Coins on every purchase!</div>
          <div style={{ fontSize: '12px', color: '#9aa3b2' }}>Get 1 coin per ₹100 spent. Redeem on your next order.</div>
        </div>
      </div>
    </div>
  );
}
