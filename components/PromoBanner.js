'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/PromoBanner.module.css';

export default function PromoBanner() {
  const [stats, setStats] = useState({ count: 0, total: 100, isActive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/promo-stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch promo stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // For testing/preview if not yet the 9th
  const isDevelopment = process.env.NODE_ENV === 'development';
  const showBanner = stats.isActive || isDevelopment;

  if (!showBanner || loading) return null;

  const percentage = Math.min((stats.count / stats.total) * 100, 100);
  const spotsLeft = Math.max(stats.total - stats.count, 0);

  return (
    <div className={styles.promoWrapper}>
      <div className={styles.promoContent}>
        <div className={styles.textSection}>
          <span className={styles.badge}>15TH ANNIVERSARY</span>
          <p className={styles.phrase}>
            Celebrating 15 Years of Excellence! 🎂 First 100 orders get an extra anniversary discount!
          </p>
        </div>
        
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span className={styles.spotsText}>
              <strong>{spotsLeft}</strong> spots remaining
            </span>
            <span className={styles.countText}>{stats.count}/{stats.total} claimed</span>
          </div>
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className={styles.glow} />
    </div>
  );
}
