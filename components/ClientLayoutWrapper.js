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
          <div style={{ 
            marginTop: 32, 
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)', 
            padding: '32px 24px', 
            borderRadius: '16px', 
            maxWidth: '700px', 
            margin: '32px auto 0',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.5px' }}>Contact Us</h3>
            
            <div style={{ marginBottom: 32 }}>
              <a href={`https://wa.me/917397189222`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#25d366', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37, 211, 102, 0.12)', padding: '14px 28px', borderRadius: 30, textDecoration: 'none', border: '1px solid rgba(37, 211, 102, 0.25)', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 18 }}>📱</span> WhatsApp: +91 73971 89222
              </a>
            </div>

            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🚚</span> Cash on Delivery Locations
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Ahamed:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Thondi, Ramanathapuram</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Rathina:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Tenkasi</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Jaganraj:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Attur</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Sarbudeen:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Trichy Central</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Sevagan:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Thitakudi, Cuddalore</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Karthick C:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Hosur</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Gerald:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Chinalapatti</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>Lawrence:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>Taramani, Chennai</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#25d366', fontSize: 14 }}>JK YASHWANTH RAJ:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: '0.2px' }}>RAJAPALAYAM</span>
              </div>
            </div>
          </div>
          
          <div suppressHydrationWarning style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Only Gadjets. All rights reserved.
          </div>
        </footer>
      )}
    </CartProvider>
  );
}
