"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist, addToCart } = useCart();

  const handleAddToCart = (product) => {
    // Add to cart with default "half_cod" payment option
    addToCart(product, 1, 'half_cod');
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Your Wishlist</h1>
          <span className={styles.countBadge}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products here to track them or buy later</p>
            <Link href="/" className={styles.shopBtn}>Explore Phones</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlist.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
