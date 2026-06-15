'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import { CartProvider } from '@/context/CartContext';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <CartProvider>
      {!isAdmin && <Header />}
      
      <main className={isAdmin ? '' : 'page-wrapper'}>
        {children}
      </main>
      
      {!isAdmin && (
        <footer style={{
          background: 'var(--bg-footer)',
          padding: '48px 32px 24px',
          borderTop: '1px solid var(--glass-bg)',
          marginTop: '60px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {/* Column 1 */}
            <div>
              <h4 style={{ color: 'var(--brand-accent)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Categories</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Server & Back Components</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Phones</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Tablets</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Wearables</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Accessories</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 style={{ color: 'var(--brand-accent)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Promos</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Phones</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Tablets</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Wearables</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Accessories</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 style={{ color: 'var(--brand-accent)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>B2B Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Bulk Quote Requests</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Corporate Gifting</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Solutions</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 style={{ color: 'var(--brand-accent)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Customer Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="https://wa.me/917397189222" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={16} color="#25D366" /> WhatsApp</a></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Email</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Terms</Link></li>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div style={{ maxWidth: '1200px', margin: '48px auto 0', borderTop: '1px solid var(--glass-bg)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', gap: '16px' }}>
            <span>© 2024 Atomobiles. All rights reserved.</span>
            <span>Premium Wholesale Deals for Businesses</span>
            <span>Created by Atomobiles</span>
          </div>
        </footer>
      )}
    </CartProvider>
  );
}
