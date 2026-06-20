"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';

export default function Header({ cartCount: propCartCount }) {
  const { wishlistCount, user, cartCount: contextCartCount } = useCart();
  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#products', label: 'Products', isHash: true },
    { href: '/#deals', label: 'Deals', isHash: true },
    { href: '/#reviews', label: 'Reviews', isHash: true },
    { href: '/#contact', label: 'Contact', isHash: true },
    { href: '/track', label: 'Track Order', isHash: false },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>ATOMOBILES</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav}>
            {navLinks.map((link) => (
              link.isHash ? (
                <a key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && <span className={styles.wishlistBadge}>{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>

            {/* Profile / Auth Option */}
            {user ? (
              <Link href="/profile" className={styles.iconBtn} aria-label="Profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/login" className={styles.authLink}>Login</Link>
                <Link href="/signup" className={`${styles.authLink} ${styles.signUpBtn}`}>Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`${styles.menuLine} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.menuLine} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.menuLine} ${menuOpen ? styles.open : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <div className={`${styles.searchOverlay} ${searchOpen ? styles.active : ''}`}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search phones, brands..."
              className={styles.searchInput}
              autoFocus={searchOpen}
            />
            <button className={styles.searchClose} onClick={() => setSearchOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuContent}>
          {navLinks.map((link, i) => (
            link.isHash ? (
              <a
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {link.label}
              </Link>
            )
          ))}
          <div className={styles.mobileMenuFooter}>
            <Link href="/login" className={styles.mobileMenuBtn}>Login</Link>
            <Link href="/signup" className={styles.mobileMenuBtn}>Sign Up</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ''}`}
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
}
