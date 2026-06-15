'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#1a1a2e',
    border: '1px solid #2d2d3f', borderRadius: '10px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '600', color: '#9aa3b2',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '24px' }}>
        <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Password Updated!</h2>
          <p style={{ color: '#9aa3b2', fontSize: '14px' }}>Your password has been changed successfully. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '24px' }}>
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={24} color="#f4a724" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>Reset Password</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Set a strong new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? 'Updating Password...' : 'Reset Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}
