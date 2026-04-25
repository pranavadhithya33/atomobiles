// app/layout.js
import '@/app/globals.css';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: 'Only Gadjets – Best Wholesale Mobile Deals',
  description: 'India\'s trusted wholesale mobile dealer. Get the best prices on smartphones with Half COD and Full Prepaid options. No middlemen, direct savings.',
  keywords: 'wholesale mobiles, best phone deals, wholesale dealer, smartphones India, Only Gadjets',
  openGraph: {
    title: 'Only Gadjets – Wholesale Mobile Dealer',
    description: 'Get best prices on top smartphones. Wholesale dealer with Half COD & Full Prepaid options.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Header />
        <main className="page-wrapper">
          {children}
        </main>
        <WhatsAppButton />
        <footer style={{
          background: 'var(--bg-footer)',
          color: 'rgba(255,255,255,0.7)',
          padding: '24px 16px',
          textAlign: 'center',
          fontSize: 13,
          marginTop: 32,
        }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 6 }}>ONLY GADJETS</div>
          <div>Wholesale Mobile Dealer · Best Prices Guaranteed</div>
          <div style={{ marginTop: 8 }}>
            <a href={`https://wa.me/917397189222`} target="_blank" rel="noopener noreferrer"
              style={{ color: '#25d366', fontWeight: 600, fontSize: 13 }}>
              📱 WhatsApp: +91 73971 89222
            </a>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} Only Gadjets. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
