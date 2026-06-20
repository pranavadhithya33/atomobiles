"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const image = product.images?.[0] || product.image || "";
  const isExternal = image.includes("amazon") || image.includes("flipkart") || image.startsWith("http");

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          {!imgError && image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className={`${styles.image} ${imgLoaded ? styles.loaded : ""}`}
              referrerPolicy="no-referrer"
              unoptimized={isExternal}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          ) : (
            <div className={styles.fallback}>
              <span>📱</span>
              <small>{product.brand}</small>
            </div>
          )}
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          {product.discount > 0 && (
            <span className={styles.discountBadge}>{product.discount}% OFF</span>
          )}
        </div>
      </Link>

      <div className={styles.content}>
        <span className={styles.brand}>{product.brand}</span>
        <Link href={`/products/${product.slug}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <p className={styles.meta}>Verified | 100% Authentic</p>

        <div className={styles.rating}>
          <span className={styles.stars}>{"★".repeat(Math.floor(product.rating || 4))}{product.rating % 1 >= 0.5 ? "½" : ""}</span>
          <span className={styles.count}>({product.reviewCount || 0})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price?.toLocaleString("en-IN")}</span>
          {product.originalPrice > product.price && (
            <span className={styles.original}>₹{product.originalPrice?.toLocaleString("en-IN")}</span>
          )}
        </div>
        {product.originalPrice > product.price && (
          <span className={styles.save}>Save ₹{(product.originalPrice - product.price)?.toLocaleString("en-IN")}</span>
        )}

        <button className={styles.addBtn}>+ Add to Order</button>
      </div>
    </div>
  );
}
