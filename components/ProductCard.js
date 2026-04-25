// components/ProductCard.js
import Link from 'next/link';
import { Smartphone, ShoppingBag } from 'lucide-react';
import styles from '@/styles/ProductCard.module.css';
import { formatINR } from '@/lib/utils';

export default function ProductCard({ product }) {
  // market_price is pre-computed by the API as max(amazon, flipkart, online)
  const marketPrice = product.market_price || Math.max(
    product.amazon_price || 0,
    product.flipkart_price || 0,
    product.online_price || 0
  );

  // our_price is pre-computed by API as exactly 10% off market price
  const ourPrice = product.our_price;
  const savings = marketPrice > ourPrice ? marketPrice - ourPrice : 0;

  return (
    <Link href={`/products/${product.slug}`} className={styles.card} aria-label={product.name}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Smartphone size={40} color="#d1d5db" />
          </div>
        )}

        {/* 10% off badge — always shown when market price exists */}
        {marketPrice > 0 && (
          <span className={styles.discountBadge}>10% OFF</span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {product.category && (
          <span className={styles.category}>{product.category}</span>
        )}
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.priceRow}>
          {/* Our wholesale price — always highlighted */}
          <span className={styles.ourPrice}>{formatINR(ourPrice)}</span>

          {/* Amazon price struck through */}
          {product.amazon_price > 0 && (
            <span className={styles.originalPrice}>
              <span className={styles.compName}>Amazon:</span> {formatINR(product.amazon_price)}
            </span>
          )}
        </div>

        {savings > 0 && (
          <span className={styles.savings}>🎉 You save {formatINR(savings)}</span>
        )}

        <span className={styles.buyBtn}>
          <ShoppingBag size={14} strokeWidth={2.5} />
          Buy Now
        </span>
      </div>
    </Link>
  );
}

// Skeleton Card
export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeletonImage} skeleton`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '50%' }} />
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '90%' }} />
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '70%' }} />
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '60%', height: 32, marginTop: 4 }} />
      </div>
    </div>
  );
}
