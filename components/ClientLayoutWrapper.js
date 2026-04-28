'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CartProvider } from '@/context/CartContext';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <CartProvider>
      {!isAdmin && <Header />}
      
      <main className={isAdmin ? '' : 'page-wrapper'}>
        {children}
      </main>
      
      {!isAdmin && <WhatsAppButton />}
      
      {!isAdmin && (
        <footer style={{
          background: 'var(--bg-footer)',
          color: 'rgba(255,255,255,0.7)',
          padding: '32px 16px',
          textAlign: 'center',
          fontSize: 13,
          marginTop: 48,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 18, marginBottom: 8, letterSpacing: '-0.5px' }}>ONLY GADJETS</div>
          <div style={{ fontSize: 14 }}>India's Premium Wholesale Mobile Dealer</div>
          <div style={{ marginTop: 12 }}>
            <a href={`https://wa.me/917397189222`} target="_blank" rel="noopener noreferrer"
              style={{ color: '#25d366', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37, 211, 102, 0.1)', padding: '8px 16px', borderRadius: 20 }}>
              <span style={{ fontSize: 16 }}>📱</span> WhatsApp: +91 73971 89222
            </a>
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Only Gadjets. All rights reserved.
          </div>
        </footer>
      )}
    </CartProvider>
  );
}
