"use client";

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    shop: [
      { label: 'All Phones', href: '#products' },
      { label: 'New Arrivals', href: '#new' },
      { label: 'Deals', href: '#deals' },
      { label: 'Best Sellers', href: '#bestsellers' },
    ],
    support: [
      { label: 'Contact Us', href: '#contact' },
      { label: 'Track Order', href: '/track' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Warranty', href: '/warranty' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Dealers', href: '#dealers' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  };

  return (
    <footer className={styles.footer}>
      {/* Massive Watermark */}
      <div className={styles.watermark}>ATOMOBILES</div>

      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>ATOMOBILES</Link>
            <p className={styles.tagline}>
              Premium wholesale mobile devices. Authentic products, unbeatable prices.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>Shop</h4>
              <ul>
                {links.shop.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.link}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4>Support</h4>
              <ul>
                {links.support.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.link}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4>Company</h4>
              <ul>
                {links.company.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.link}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} ATOMOBILES. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <a href="/terms" className={styles.bottomLink}>Terms</a>
            <a href="/privacy" className={styles.bottomLink}>Privacy</a>
            <a href="/cookies" className={styles.bottomLink}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
