'use client';

import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ForgotPasswordPage() {
  const WHATSAPP_NUMBER = '917397189222';
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I forgot my account password. Can you please help me reset it?')}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '24px' }}>
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9aa3b2', fontSize: '13px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageSquare size={24} color="#f4a724" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>Forgot Password?</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Since we don&apos;t send emails for security, please contact us on WhatsApp to reset your password.
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'block', 
            textAlign: 'center',
            padding: '14px', 
            background: '#25d366', 
            color: 'var(--text-primary)', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '15px', 
            fontWeight: '800', 
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          Contact on WhatsApp →
        </a>

        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
          Our team will verify your identity and help you regain access.
        </div>
      </div>
    </div>
  );
}
