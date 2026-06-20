"use client";
import styles from "./Marquee.module.css";

export default function Marquee() {
  return (
    <div className={styles.marqueeWrap}>
      <div className={styles.marquee}>
        <div className={styles.track}>
          <span className={styles.item}>🔥 iPhone 16 Pro Max now available at wholesale pricing</span>
          <span className={styles.item}>⚡ Free delivery across Tamil Nadu on orders above ₹50,000</span>
          <span className={styles.item}>✓ 100% authentic products with manufacturer warranty</span>
          <span className={styles.item}>💬 WhatsApp us for bulk pricing and dealer enquiries</span>
          <span className={styles.item}>🔥 iPhone 16 Pro Max now available at wholesale pricing</span>
          <span className={styles.item}>⚡ Free delivery across Tamil Nadu on orders above ₹50,000</span>
          <span className={styles.item}>✓ 100% authentic products with manufacturer warranty</span>
          <span className={styles.item}>💬 WhatsApp us for bulk pricing and dealer enquiries</span>
        </div>
      </div>
    </div>
  );
}
