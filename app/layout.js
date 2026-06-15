// app/layout.js
import '@/app/globals.css';
import '@/app/animations.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: 'Atomobiles – Best Wholesale Mobile Deals',
  description: 'India\'s trusted wholesale mobile dealer. Get the best prices on smartphones with Half COD and Full Prepaid options. No middlemen, direct savings.',
  keywords: 'wholesale mobiles, best phone deals, wholesale dealer, smartphones India, Atomobiles',
  openGraph: {
    title: 'Atomobiles – Wholesale Mobile Dealer',
    description: 'Get best prices on top smartphones. Wholesale dealer with Half COD & Full Prepaid options.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="cafe" enableSystem={false} themes={['cafe', 'neon-dark', 'minimalist-bw']}>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
