// components/ProductCard.js
import Link from 'next/link';
import { Smartphone, ShoppingBag } from 'lucide-react';
import styles from '@/styles/ProductCard.module.css';
import { formatINR, calcDiscountPct, calcSavings } from '@/lib/utils';

export default function ProductCard({ product }) {
  const discountPct = calcDiscountPct(product.online_price, product.our_price);
  const savings = calcSavings(product.online_price, product.our_price);
  const inStock = product.stock > 0;

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

        {discountPct > 0 && (
          <span className={styles.discountBadge}>{discountPct}% OFF</span>
        )}

        {!inStock && (
          <div className={styles.outOfStock}>
            <span className={styles.outOfStockLabel}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {product.category && (
          <span className={styles.category}>{product.category}</span>
        )}
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.priceRow}>
          <span className={styles.ourPrice}>{formatINR(product.our_price)}</span>
          {product.online_price > product.our_price && (
            <span className={styles.originalPrice}>{formatINR(product.online_price)}</span>
          )}
        </div>

        {savings > 0 && (
          <span className={styles.savings}>You save {formatINR(savings)}</span>
        )}

        <span className={styles.buyBtn}>
          <ShoppingBag size={14} strokeWidth={2.5} />
          {inStock ? 'Buy Now' : 'Notify Me'}
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
