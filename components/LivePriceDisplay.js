'use client';

import { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import styles from '@/styles/LivePrice.module.css';

export default function LivePriceDisplay({ product }) {
  const [prices, setPrices] = useState({
    amazon: product.amazon_price || product.online_price || 0,
    flipkart: product.flipkart_price || product.online_price || 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchLivePrices() {
      const newPrices = { ...prices };
      let changed = false;

      // Try Amazon
      if (product.amazon_url) {
        try {
          const res = await fetch(`/api/price?url=${encodeURIComponent(product.amazon_url)}`);
          const data = await res.json();
          if (data.price && data.price > 0 && isMounted) {
            newPrices.amazon = data.price;
            changed = true;
          }
        } catch (e) {
          console.error('Failed to fetch Amazon price');
        }
      }

      // Try Flipkart
      if (product.flipkart_url) {
        try {
          const res = await fetch(`/api/price?url=${encodeURIComponent(product.flipkart_url)}`);
          const data = await res.json();
          if (data.price && data.price > 0 && isMounted) {
            newPrices.flipkart = data.price;
            changed = true;
          }
        } catch (e) {
          console.error('Failed to fetch Flipkart price');
        }
      }

      if (changed && isMounted) {
        setPrices(newPrices);
      }
      if (isMounted) setIsLoading(false);
    }

    // Only try to fetch live prices if URLs are provided, otherwise just use DB prices immediately
    if (product.amazon_url || product.flipkart_url) {
      fetchLivePrices();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [product.amazon_url, product.flipkart_url]);

  // Determine highest competitor price to calculate maximum savings
  const maxCompetitorPrice = Math.max(prices.amazon, prices.flipkart);
  const savings = maxCompetitorPrice > product.our_price ? maxCompetitorPrice - product.our_price : 0;
  const savingsPercent = maxCompetitorPrice > 0 ? Math.round((savings / maxCompetitorPrice) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.pricesRow}>
        <div className={styles.competitorPrices}>
          {prices.amazon > 0 && (
            <div className={styles.compPriceItem}>
              <span className={styles.compLabel}>Amazon:</span>
              <span className={styles.strikethrough}>{formatINR(prices.amazon)}</span>
            </div>
          )}
          {prices.flipkart > 0 && (
            <div className={styles.compPriceItem}>
              <span className={styles.compLabel}>Flipkart:</span>
              <span className={styles.strikethrough}>{formatINR(prices.flipkart)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.ourPriceBox}>
        <div className={styles.ourPriceLabel}>Our Wholesale Price</div>
        <div className={styles.ourPriceValue}>
          {formatINR(product.our_price)}
          {savingsPercent > 0 && (
            <span className={styles.discountBadge}>-{savingsPercent}%</span>
          )}
        </div>
        
        {savings > 0 && (
          <div className={styles.savingsText}>
            You Save: <span className={styles.savingsAmount}>{formatINR(savings)}</span>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className={styles.loadingText}>Fetching live market prices...</div>
      )}
      {!isLoading && (product.amazon_url || product.flipkart_url) && (
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span> Live Prices Updated
        </div>
      )}
    </div>
  );
}
