'use client';
// components/WhatsAppButton.js
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917397189222';

export default function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I want to know more about your products.')}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float-btn"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 20,
        zIndex: 999,
        background: '#25d366',
        color: '#fff',
        width: 54,
        height: 54,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.12)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.55)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)';
      }}
    >
      <MessageCircle size={26} strokeWidth={2} fill="rgba(255,255,255,0.15)" />
    </a>
  );
}
