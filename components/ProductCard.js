"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product, variant = 'grid', onAddToCart }) {
  const { toggleWishlist, isInWishlist } = useCart();
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    id,
    name,
    brand,
    specs,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    badge,
    savings,
  } = product;

  const liked = isInWishlist(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    onAddToCart?.(product);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className={styles.stars}>
        {'★'.repeat(fullStars)}
        {hasHalf && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </span>
    );
  };

  // Image component with error fallback
  const ProductImage = ({ className, sizes }) => (
    <>
      {!imageError ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes={sizes}
          className={`${styles.productImage} ${imageLoaded ? styles.imageVisible : styles.imageHidden}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ objectFit: 'contain' }}
          referrerPolicy="no-referrer"
          unoptimized={image?.includes('amazon') || image?.includes('flipkart')}
        />
      ) : null}
      {(imageError || !image) && (
        <div className={styles.fallback}>
          <span className={styles.fallbackIcon}>📱</span>
          <span className={styles.fallbackText}>{brand || "ATOMOBILES"}</span>
        </div>
      )}
    </>
  );

  if (variant === 'horizontal') {
    return (
      <Link href={`/products/${id}`} className={styles.horizontalCard}>
        <div className={styles.horizontalImageWrap}>
          <div className={styles.imageContainer}>
            <ProductImage sizes="200px" />
          </div>
          {badge && (
            <span className={`${styles.badge} ${styles[`badge${badge.toUpperCase()}`]}`}>
              {badge}
            </span>
          )}
        </div>
        <div className={styles.horizontalInfo}>
          <span className={styles.brand}>{brand}</span>
          <h3 className={styles.name}>{name}</h3>
          <div className={styles.rating}>
            {renderStars()}
            <span className={styles.reviewCount}>({reviewCount})</span>
          </div>
          <div className={styles.priceRow}>
            <span className={styles.price}>₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className={styles.originalPrice}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className={styles.savings}>Save ₹{savings.toLocaleString('en-IN')}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className={styles.cardWrapper}>
      <Link href={`/products/${id}`} className={styles.card}>
        {/* Image Area */}
        <div className={styles.imageArea}>
          <div className={styles.imageContainer}>
            <ProductImage sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw" />
          </div>

          {/* Badge */}
          {badge && (
            <span className={`${styles.badge} ${styles[`badge${badge.toUpperCase()}`]}`}>
              {badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            className={`${styles.wishlistBtn} ${liked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className={styles.discountBadge}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Info Area */}
        <div className={styles.infoArea}>
          <span className={styles.brand}>{brand}</span>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.specs}>{specs}</p>

          <div className={styles.rating}>
            {renderStars()}
            <span className={styles.reviewCount}>({reviewCount})</span>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className={styles.originalPrice}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {savings > 0 && (
            <span className={styles.savings}>Save ₹{savings.toLocaleString('en-IN')}</span>
          )}
        </div>
      </Link>

      {/* Add Button */}
      <button
        className={`${styles.addButton} ${added ? styles.added : ''}`}
        onClick={handleAdd}
        aria-label={added ? 'Added to cart' : 'Add to cart'}
      >
        {added ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Added
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add to Order
          </>
        )}
      </button>
    </div>
  );
}
