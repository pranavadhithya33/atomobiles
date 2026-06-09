'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShoppingCart, CheckCircle } from 'lucide-react';
import styles from '@/styles/ProductDetail.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [userCoins, setUserCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins_balance')
          .eq('id', session.user.id)
          .single();
        if (profile) setUserCoins(profile.coins_balance || 0);
      }
    }
    loadUser();
  }, []);

  const discountedTotal = useCoins ? Math.max(0, cartTotal - userCoins) : cartTotal;
  const coinsToRedeem = useCoins ? Math.min(cartTotal, userCoins) : 0;

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
          <div key={`${item.id}-${item.paymentOption}-${item.variantId || 'base'}`} style={{ 
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
              {item.variantInfo && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  {item.variantInfo.ram}GB RAM / {item.variantInfo.storage}GB Storage
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#f4a724', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.paymentOption === 'full_prepaid' ? 'Full Prepaid' : item.paymentOption === 'token_advance' ? 'Token Advance' : 'Half COD'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {formatINR(item.basePrice * item.quantity)}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '4px 12px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.paymentOption, item.quantity - 1, item.variantId)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.paymentOption, item.quantity + 1, item.variantId)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => removeFromCart(item.id, item.paymentOption, item.variantId)}
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
        {/* OG Coins Section */}
        {userCoins > 0 && (
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '16px', 
            marginBottom: '20px',
            border: useCoins ? '1px solid var(--brand-accent)' : '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🪙</span>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Use your OG Coins</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Balance: {userCoins} coins (₹{userCoins})</div>
                </div>
              </div>
              <button 
                onClick={() => setUseCoins(!useCoins)}
                style={{ 
                  background: useCoins ? 'var(--brand-accent)' : 'rgba(255,255,255,0.1)',
                  color: useCoins ? '#000' : '#fff',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  transition: '0.2s'
                }}
              >
                {useCoins ? 'Applied' : 'Apply'}
              </button>
            </div>
            {useCoins && (
              <div style={{ marginTop: '10px', color: 'var(--brand-accent)', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> You are saving ₹{coinsToRedeem}!
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Subtotal ({cartCount} items)</span>
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>{formatINR(cartTotal)}</span>
        </div>

        {useCoins && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--brand-accent)', fontSize: '15px' }}>OG Coins Discount</span>
            <span style={{ color: 'var(--brand-accent)', fontSize: '18px', fontWeight: '700' }}>- {formatINR(coinsToRedeem)}</span>
          </div>
        )}

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}>Total Amount</span>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: '900', color: 'var(--brand-accent)' }}>{formatINR(discountedTotal)}</span>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
          Taxes and shipping calculated at checkout.
        </p>
        
        <button 
          onClick={() => {
            if (cart.length === 0) return;
            const params = new URLSearchParams({
              fromCart: 'true',
              ...(useCoins && { redeemedCoins: coinsToRedeem })
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
