'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/OrderForm.module.css';
import { formatINR, validatePhone, validatePincode, buildWhatsAppUrl, calcPaymentDetails } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { CheckCircle, ArrowLeft, ShoppingBag, User, Phone, MapPin, Hash, CreditCard, Download, Trash2, ChevronRight } from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';
import { useCart } from '@/context/CartContext';

const WHATSAPP_NUMBER = '917397189222';

function OrderFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, clearCart, isLoaded } = useCart();

  const isFromCart = searchParams.get('fromCart') === 'true';
  const productId = searchParams.get('productId') || '';
  const productName = searchParams.get('productName') || '';
  const productSlug = searchParams.get('productSlug') || '';
  const initialPaymentOption = searchParams.get('paymentOption') || 'half_cod';
  const urlBasePrice = parseInt(searchParams.get('basePrice') || '0');
  const variantRam = searchParams.get('ram');
  const variantStorage = searchParams.get('storage');

  const [selectedPayment, setSelectedPayment] = useState(initialPaymentOption);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', pincode: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [fullOrderId, setFullOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [user, setUser] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(searchParams.get('redeemedCoins') ? true : false);

  // Calculate prices based on current selection
  const items = isFromCart ? cart : [{
    id: productId,
    name: productName,
    slug: productSlug,
    basePrice: urlBasePrice,
    quantity: 1,
    ...(variantRam && variantStorage && { 
      variantInfo: { ram: variantRam, storage: variantStorage } 
    })
  }];

  const totals = items.reduce((acc, item) => {
    const details = calcPaymentDetails(item.basePrice, selectedPayment);
    return {
      baseTotal: acc.baseTotal + (item.basePrice * (item.quantity || 1)),
      finalTotal: acc.finalTotal + (details.finalPrice * (item.quantity || 1)),
      advanceTotal: acc.advanceTotal + (details.advance * (item.quantity || 1)),
      discountTotal: acc.discountTotal + (details.discount * (item.quantity || 1))
    };
  }, { baseTotal: 0, finalTotal: 0, advanceTotal: 0, discountTotal: 0 });

  const finalOrderPrice = useCoins ? Math.max(0, totals.finalTotal - userCoins) : totals.finalTotal;

  // Fetch user profile on load
  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setForm(prev => ({
          ...prev,
          fullName: data.user.name || prev.fullName,
          phone: data.user.phone || prev.phone
        }));
        setUserCoins(data.user.coins_balance || 0);
      }
    }
    loadUser();
  }, []);

  // Redirect if no products
  useEffect(() => {
    // Only check for empty cart after context has loaded
    if (!isLoaded) return;

    if (!isFromCart && (!productId || !urlBasePrice)) {
      router.replace('/');
    }
    if (isFromCart && cart.length === 0 && !submitted) {
      router.replace('/cart');
    }
  }, [productId, urlBasePrice, isFromCart, cart, router, submitted, isLoaded]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) errs.fullName = 'Enter your full name (at least 2 characters)';
    if (!validatePhone(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.address.trim() || form.address.trim().length < 10) errs.address = 'Enter complete delivery address (at least 10 characters)';
    if (!validatePincode(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');

    try {
      const headers = { 'Content-Type': 'application/json' };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          pincode: form.pincode.trim(),
          product_id: isFromCart ? null : productId,
          product_name: isFromCart ? `${items.length} items from cart` : productName,
          product_slug: isFromCart ? 'cart' : productSlug,
          payment_option: selectedPayment,
          base_price: totals.baseTotal,
          discount_amount: totals.discountTotal + (useCoins ? userCoins : 0),
          final_price: finalOrderPrice,
          advance_amount: totals.advanceTotal || null,
          coins_redeemed: useCoins ? userCoins : 0,
          items: items.map(i => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            price: i.basePrice,
            quantity: i.quantity || 1,
            variant_id: i.variantId || (i.variantInfo ? `${i.variantInfo.ram}GB-${i.variantInfo.storage}GB` : null),
            variant_info: i.variantInfo || null
          }))
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setOrderId(data.id?.slice(0, 8)?.toUpperCase() || 'N/A');
      setFullOrderId(data.id || '');
      setOrderData(data);
      setSubmitted(true);
      
      if (isFromCart) clearCart();

      // Auto-open WhatsApp
      const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, {
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        productName: isFromCart ? `${items.length} Items (Cart Order)` : productName,
        paymentOption: selectedPayment,
        finalPrice: finalOrderPrice,
        advanceAmount: totals.advanceTotal,
        orderId: data.id
      });
      window.open(waUrl, '_blank');

    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, {
      name: form.fullName,
      phone: form.phone,
      address: form.address,
      pincode: form.pincode,
      productName: isFromCart ? `${items.length} Items (Cart Order)` : productName,
      paymentOption: selectedPayment,
      finalPrice: finalOrderPrice,
      advanceAmount: totals.advanceTotal,
      orderId: fullOrderId,
    });

    return (
      <div className={styles.page} style={{ justifyContent: 'center', minHeight: '70vh' }}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>
            <CheckCircle size={36} color="var(--success)" strokeWidth={2} />
          </div>
          <h1 className={styles.successTitle}>Order Placed! 🎉</h1>
          <p className={styles.successSubtitle}>
            Your order has been received successfully. Our team will contact you on <strong>{form.phone}</strong> shortly.
          </p>
          <div className={styles.successOrderId}>
            Order ID: <span>#{orderId}</span>
          </div>
          <div className={styles.successActions}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp btn-full btn-lg" style={{ marginBottom: 12 }}>
              💬 Confirm on WhatsApp
            </a>
            {fullOrderId && (
              <Link href={`/track/${orderId}`} className="btn btn-primary btn-full btn-lg" style={{ background: '#f8f9fa', color: '#1a1a2e', border: '1px solid #e2e8f0' }}>
                📍 Track Order Live
              </Link>
            )}
            <button 
              onClick={() => generateInvoice(orderData)}
              className="btn btn-full btn-lg" 
              style={{ background: '#fff', color: '#1a1a2e', border: '1px solid #e2e8f0', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={18} /> Download Invoice
            </button>
            <Link href="/" className="btn btn-secondary btn-full" style={{ marginTop: 12 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let paymentLabel = '';
  if (selectedPayment === 'full_prepaid') {
    paymentLabel = 'Full Prepaid (₹2,000 off per item)';
  } else if (selectedPayment === 'token_advance') {
    paymentLabel = '30% Token Advance + Cash on Delivery';
  } else {
    paymentLabel = 'Half Payment + Cash on Delivery';
  }

  return (
    <div className={styles.page}>
      {/* Back */}
      <Link href={isFromCart ? '/cart' : (productSlug ? `/products/${productSlug}` : '/')} style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600 }}>
        <ArrowLeft size={16} /> Back to {isFromCart ? 'Cart' : 'Product'}
      </Link>

      <div>
        <h1 className={styles.pageTitle}>Complete Your Order</h1>
        <p className={styles.pageSubtitle}>Fill in your details to place the order</p>
      </div>

      {/* Order Summary */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>Order Summary</div>
        
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: idx === items.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>{item.name}</div>
                {item.variantInfo && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {item.variantInfo.ram}GB RAM / {item.variantInfo.storage}GB Storage
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quantity: {item.quantity || 1}</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>{formatINR(item.basePrice * (item.quantity || 1))}</div>
            </div>
          ))}
        </div>

        {/* Payment Selection */}
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dark)' }}>Choose Payment Method</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { id: 'half_cod', label: '🚚 Half COD', sub: 'Pay 50% now, 50% on delivery' },
              { id: 'full_prepaid', label: '✅ Full Prepaid', sub: 'Extra ₹2,000 OFF per item' },
              { id: 'token_advance', label: '🎫 Token Advance', sub: 'Pay 30% now, rest on delivery' }
            ].map((opt) => (
              <label key={opt.id} style={{ 
                display: 'block', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: '1.5px solid',
                borderColor: selectedPayment === opt.id ? 'var(--brand-accent)' : 'var(--border)',
                background: selectedPayment === opt.id ? 'var(--brand-accent-light)' : '#fff',
                cursor: 'pointer',
                transition: '0.2s'
              }}>
                <input 
                  type="radio" 
                  name="payment_option" 
                  checked={selectedPayment === opt.id}
                  onChange={() => setSelectedPayment(opt.id)}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '13px', fontWeight: '700', color: selectedPayment === opt.id ? 'var(--brand-accent-dark)' : 'var(--text-dark)' }}>{opt.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{opt.sub}</div>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <strong>{formatINR(totals.baseTotal)}</strong>
        </div>
        
        {totals.discountTotal > 0 && (
          <div className={styles.summaryRow}>
            <span style={{ color: 'var(--success)' }}>Discount</span>
            <strong style={{ color: 'var(--success)' }}>- {formatINR(totals.discountTotal)}</strong>
          </div>
        )}

        {useCoins && (
          <div className={styles.summaryRow}>
            <span style={{ color: 'var(--brand-accent-dark)' }}>Atom Coins Applied</span>
            <strong style={{ color: 'var(--brand-accent-dark)' }}>- {formatINR(userCoins)}</strong>
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '12px 0' }} />

        <div className={styles.summaryRow}>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>Payable Amount</span>
          <strong style={{ color: 'var(--text-dark)', fontSize: '20px', fontWeight: '900' }}>
            {formatINR(finalOrderPrice)}
          </strong>
        </div>

        {selectedPayment !== 'full_prepaid' && (
          <>
            <div className={styles.summaryRow} style={{ marginTop: '12px', opacity: 0.8 }}>
              <span style={{ fontSize: '13px' }}>Advance (Pay Now)</span>
              <strong style={{ fontSize: '14px' }}>{formatINR(totals.advanceTotal)}</strong>
            </div>
            <div className={styles.summaryRow} style={{ opacity: 0.8 }}>
              <span style={{ fontSize: '13px' }}>On Delivery</span>
              <strong style={{ fontSize: '14px' }}>{formatINR(finalOrderPrice - totals.advanceTotal)}</strong>
            </div>
          </>
        )}
      </div>
      
      {/* Coin Redemption Section */}
      {user && userCoins > 0 && (
        <div style={{ 
          background: useCoins ? 'var(--brand-accent-light)' : '#fff', 
          border: '1.5px solid',
          borderColor: useCoins ? 'var(--brand-accent)' : 'var(--border)',
          borderRadius: '16px', 
          padding: '16px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🪙</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>Redeem Atom Coins</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>You have ₹{userCoins} savings available</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setUseCoins(!useCoins)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              background: useCoins ? 'var(--brand-accent)' : '#f1f5f9', 
              color: useCoins ? '#000' : 'var(--text-dark)',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            {useCoins ? 'Applied ✓' : 'Use Coins'}
          </button>
        </div>
      )}

      {/* Auth Notice for Guests */}
      {!user && (
        <div style={{ background: 'rgba(244, 167, 36, 0.05)', border: '1px solid rgba(244, 167, 36, 0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '20px' }}>🪙</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Login to earn Atom Coins</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Earn 1 coin per ₹1000 spent on this order.</div>
            </div>
          </div>
          <Link href={typeof window !== 'undefined' ? `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : '/login'} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px' }}>Login Now</Link>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formCard}>
          <div className={styles.sectionLabel}>
            <User size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
            Personal Details
          </div>

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name *</label>
            <input
              id="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              autoComplete="name"
            />
            {errors.fullName && <span className="form-error">⚠ {errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
            />
            {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
          </div>

          <div className={styles.sectionLabel} style={{ marginTop:4 }}>
            <MapPin size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
            Delivery Address
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Full Address *</label>
            <textarea
              id="address"
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="House/Flat No., Street, Area, City, State"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              rows={3}
              style={{ resize:'vertical', minHeight:80 }}
              autoComplete="street-address"
            />
            {errors.address && <span className="form-error">⚠ {errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pincode" className="form-label">Pincode *</label>
            <input
              id="pincode"
              type="text"
              className={`form-input ${errors.pincode ? 'error' : ''}`}
              placeholder="6-digit pincode"
              value={form.pincode}
              onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
            />
            {errors.pincode && <span className="form-error">⚠ {errors.pincode}</span>}
          </div>

          {/* Read-only fields */}
          <div className={styles.sectionLabel} style={{ marginTop:4 }}>
            <CreditCard size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
            Payment Details (System Calculated)
          </div>

          <div className="form-group">
            <label className="form-label">Selected Payment Option</label>
            <input
              className={styles.readOnlyField}
              value={paymentLabel}
              readOnly
              style={{ width: '100%', color: 'var(--text-dark)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Final Price (Auto-calculated)</label>
            <input
              className={styles.readOnlyField}
              value={formatINR(finalOrderPrice)}
              readOnly
              style={{ width: '100%', fontWeight: 800, color: 'var(--text-dark)', fontSize: '17px' }}
            />
          </div>
        </div>

        {submitError && (
          <div className="notice notice-error">⚠ {submitError}</div>
        )}

        <button
          type="submit"
          id="submit-order-btn"
          disabled={submitting}
          className={styles.submitBtn}
        >
          {submitting ? (
            <><div className={styles.spinner} /> Processing…</>
          ) : (
            <><ShoppingBag size={18} /> Place Order — {formatINR(finalOrderPrice)}</>
          )}
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:12 }}>
          🔒 Your details are safe with us. We&apos;ll contact you before dispatching.
        </p>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ padding:32, textAlign:'center' }}>Loading…</div>}>
      <OrderFormContent />
    </Suspense>
  );
}
