"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Grid */}
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <h3 className={styles.logo}>ATOMOBILES</h3>
            <p className={styles.tagline}>
              Premium wholesale mobile devices. Authentic products, unbeatable prices.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="WhatsApp">💬</a>
              <a href="#" aria-label="Facebook">📘</a>
            </div>
          </div>

          {/* Shop */}
          <div className={styles.column}>
            <h4>Shop</h4>
            <Link href="/products">All Phones</Link>
            <Link href="/products?filter=new">New Arrivals</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/products?filter=bestseller">Best Sellers</Link>
          </div>

          {/* Support */}
          <div className={styles.column}>
            <h4>Support</h4>
            <Link href="/contact">Contact Us</Link>
            <Link href="/track">Track Order</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/warranty">Warranty</Link>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/dealers">Dealers</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p>© 2026 ATOMOBILES. All rights reserved.</p>
          <p>Premium Wholesale Deals for Businesses</p>
        </div>
      </div>
    </footer>
  );
}
