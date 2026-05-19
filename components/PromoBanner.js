'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/PromoBanner.module.css';

export default function PromoBanner() {
  const [stats, setStats] = useState({
    count: 0,
    total: 300,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/promo-stats?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // Validate the response shape before setting state
        if (
          typeof data.count !== 'number' ||
          typeof data.total !== 'number' ||
          typeof data.isActive !== 'boolean'
        ) {
          throw new Error('Invalid response shape');
        }

        if (!cancelled) {
          setStats(data);
          setError(false);
        }
      } catch (err) {
        console.error('Failed to fetch promo stats:', err);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    // Refresh every 2 minutes to keep it accurate without hammering the API
    const interval = setInterval(fetchStats, 120000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Don't render anything while loading, on error, or when inactive
  if (loading || error || !stats.isActive) {
    return null;
  }

  // Safety: clamp values to prevent visual glitches
  const clampedCount = Math.max(0, Math.min(stats.count, stats.total));
  const spotsLeft = stats.total - clampedCount;
  const percentage = (clampedCount / stats.total) * 100;

  return (
    <div className={styles.promoWrapper} role="banner" aria-label="Special giveaway promotion">
      <div className={styles.promoContent}>
        <div className={styles.textSection}>
          <span className={styles.badge}>🎉 3,000 ORDERS MILESTONE</span>
          <p className={styles.phrase}>
            We hit 3,000 orders! Next {stats.total} customers get a special giveaway! 🎁
          </p>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span className={styles.spotsText}>
              <strong>{spotsLeft}</strong> spots left
            </span>
            <span className={styles.countText}>
              {clampedCount}/{stats.total} claimed
            </span>
          </div>
          <div
            className={styles.progressBarBg}
            role="progressbar"
            aria-valuenow={clampedCount}
            aria-valuemin={0}
            aria-valuemax={stats.total}
            aria-label={`${clampedCount} of ${stats.total} giveaway spots claimed`}
          >
            <div
              className={styles.progressBarFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className={styles.glow} aria-hidden="true" />
    </div>
  );
}
