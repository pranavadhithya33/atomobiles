'use client';

import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import styles from '@/styles/ProductDetail.module.css'; // Reusing some styles

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <ShoppingCart size={40} color="#9aa3b2" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>Your cart is empty</h1>
        <p style={{ color: '#9aa3b2', marginBottom: '32px', maxWidth: '300px' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link href="/" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        Your Shopping Cart
      </h1>

      <div style={{ display: 'grid', gap: '16px' }}>
        {cart.map((item) => (
          <div key={`${item.id}-${item.paymentOption}`} style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '16px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#f8fafc', 
              borderRadius: '12px', 
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid var(--border)'
            }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                referrerPolicy="no-referrer"
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '12px', color: '#f4a724', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.paymentOption === 'full_prepaid' ? 'Full Prepaid' : item.paymentOption === 'token_advance' ? 'Token Advance' : 'Half COD'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {formatINR(item.basePrice * item.quantity)}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '4px 12px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.paymentOption, item.quantity - 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.paymentOption, item.quantity + 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => removeFromCart(item.id, item.paymentOption)}
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: 'none', 
                color: '#ef4444', 
                padding: '10px', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '24px', 
        background: 'var(--brand-primary)', 
        borderRadius: '24px',
        border: '1px solid rgba(244, 167, 36, 0.2)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Subtotal ({cartCount} items)</span>
          <span style={{ color: '#fff', fontSize: '24px', fontWeight: '900' }}>{formatINR(cartTotal)}</span>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
          Taxes and shipping calculated at checkout. OG Coins can be applied in the next step.
        </p>
        
        {/* Bulk Checkout Link - For now, we'll just link to the first item for simplicity or explain it's coming soon */}
        <button 
          onClick={() => {
            // For now, let's just alert that multi-item checkout is in progress
            // or we can just redirect to the first item's checkout page
            const first = cart[0];
            const params = new URLSearchParams({
              productId: first.id,
              productName: first.name,
              productSlug: first.slug,
              paymentOption: first.paymentOption,
              basePrice: first.basePrice,
              finalPrice: first.basePrice, // Simplification
            });
            window.location.href = `/order?${params.toString()}`;
          }}
          className="btn btn-primary btn-full btn-lg" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }}
        >
          Checkout Now <ArrowRight size={20} />
        </button>
      </div>
      
      <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: '24px', color: '#9aa3b2', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>
        ← Continue Shopping
      </Link>
    </div>
  );
}
