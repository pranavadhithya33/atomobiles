"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [userCoins, setUserCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUserCoins(data.user.coins_balance || 0);
      }
    }
    loadUser();
  }, []);

  const coinsToRedeem = useCoins ? Math.min(cartTotal, userCoins) : 0;
  const discountedTotal = cartTotal - coinsToRedeem;

  const updateQty = (item, delta) => {
    updateQuantity(item.id, item.paymentOption, item.quantity + delta, item.variantId);
  };

  const removeItem = (item) => {
    removeFromCart(item.id, item.paymentOption, item.variantId);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link href="/" className={styles.shopBtn}>Browse Products</Link>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.itemsList}>
              {cart.map(item => (
                <div key={`${item.id}-${item.paymentOption}-${item.variantId || 'base'}`} className={styles.itemCard}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                    ) : (
                      <div className={styles.imgFallback}>📱</div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    {item.variantInfo && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {item.variantInfo.ram}GB RAM / {item.variantInfo.storage}GB Storage
                      </div>
                    )}
                    <span className={styles.itemBadge}>
                      {item.paymentOption === 'full_prepaid' ? 'Full Prepaid' : item.paymentOption === 'token_advance' ? 'Token Advance' : 'Half COD'}
                    </span>
                    <div className={styles.itemPrice}>{formatINR(item.basePrice * item.quantity)}</div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQty(item, -1)} className={styles.qtyBtn}>-</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button onClick={() => updateQty(item, 1)} className={styles.qtyBtn}>+</button>
                    </div>
                    <button onClick={() => removeItem(item)} className={styles.removeBtn}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              {userCoins > 0 && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  border: useCoins ? '1px solid #39ff14' : '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🪙</span>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700' }}>Use Atom Coins</div>
                        <div style={{ color: '#888888', fontSize: '12px' }}>Balance: {userCoins} coins</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUseCoins(!useCoins)}
                      style={{ 
                        background: useCoins ? '#39ff14' : 'rgba(255,255,255,0.08)',
                        color: useCoins ? '#000' : '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {useCoins ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
              {useCoins && (
                <div className={styles.summaryRow} style={{ color: '#10b981' }}>
                  <span>Atom Coins Discount</span>
                  <span>- {formatINR(coinsToRedeem)}</span>
                </div>
              )}
              <div className={styles.summaryRowTotal}>
                <span>Total Amount</span>
                <span>{formatINR(discountedTotal)}</span>
              </div>
              <p className={styles.taxNote}>Taxes and shipping calculated at checkout.</p>
              <button 
                onClick={() => {
                  if (cart.length === 0) return;
                  const params = new URLSearchParams({
                    fromCart: 'true',
                    ...(useCoins && { redeemedCoins: coinsToRedeem })
                  });
                  window.location.href = `/checkout?${params.toString()}`;
                }}
                className={styles.checkoutBtn}
                style={{ width: '100%', border: 'none', cursor: 'pointer' }}
              >
                Checkout Now →
              </button>
              <Link href="/" className={styles.continueBtn}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
