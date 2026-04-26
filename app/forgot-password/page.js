'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage('Check your email for a password reset link!');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
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
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9aa3b2', fontSize: '13px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mail size={24} color="#f4a724" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Forgot Password?</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No worries! Enter your email and we'll send you a link to reset it.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {message && (
            <div style={{ background: '#112d11', border: '1px solid #1d7f1d', borderRadius: '10px', padding: '12px 16px', color: '#a5fca5', fontSize: '13px', lineHeight: '1.5' }}>
              ✅ {message}
            </div>
          )}

          {error && (
            <div style={{ background: '#2d1111', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', lineHeight: '1.5' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!message}
            style={{ padding: '14px', background: 'linear-gradient(135deg, #f4a724, #e09410)', color: '#000', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: (loading || !!message) ? 'not-allowed' : 'pointer', opacity: (loading || !!message) ? 0.7 : 1 }}
          >
            {loading ? 'Sending link...' : 'Send Reset Link →'}
          </button>
        </form>
      </div>
    </div>
  );
}
