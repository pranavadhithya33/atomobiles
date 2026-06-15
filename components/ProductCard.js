// components/ProductCard.js
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '@/styles/ProductCard.module.css';
import { formatINR } from '@/lib/utils';

const MotionLink = motion(Link);

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
    <MotionLink 
      href={`/products/${product.slug}`} 
      className={styles.card} 
      aria-label={product.name}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 12px 24px rgba(62, 39, 35, 0.15)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
            width={300}
            height={300}
            style={{ objectFit: 'contain' }}
            loading="lazy"
            referrerPolicy="no-referrer"
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
          {/* Our wholesale price */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Our Price</span>
            <span className={styles.ourPrice}>{formatINR(ourPrice)}</span>
          </div>

          {/* Online price struck through */}
          {marketPrice > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Online Price</span>
              <span className={styles.originalPrice} style={{ textDecoration: 'line-through' }}>
                {formatINR(marketPrice)}
              </span>
            </div>
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
    </MotionLink>
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
