'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatINR, validatePhone, validatePincode, buildWhatsAppUrl, calcPaymentDetails } from '@/lib/utils';
import { CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';
import styles from './page.module.css';

const WHATSAPP_NUMBER = '917397189222';

function CheckoutContent() {
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
  const [userCoins, setUserCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(searchParams.get('redeemedCoins') ? true : false);

  // Calculate items
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

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
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

  useEffect(() => {
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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className={styles.main}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h1 className={styles.successTitle}>Order Placed! 🎉</h1>
          <p className={styles.successSubtitle}>
            Your order has been received successfully. Our team will contact you on <strong>{form.phone}</strong> shortly.
          </p>
          <div className={styles.successOrderId}>
            Order ID: <span>#{orderId}</span>
          </div>
          <div className={styles.successActions}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.placeOrderBtn} style={{ background: '#25d366', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💬 Confirm on WhatsApp
            </a>
            {fullOrderId && (
              <Link href={`/track/${orderId}`} className={styles.placeOrderBtn} style={{ background: '#111111', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                📍 Track Order Live
              </Link>
            )}
            <button onClick={() => generateInvoice(orderData)} className={styles.placeOrderBtn} style={{ background: '#0a0a0a', color: '#ffffff', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={18} /> Download Invoice
            </button>
            <Link href="/" className={styles.backBtn} style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        ← Back
      </button>

      <h1 className={styles.title}>Checkout</h1>
      <p className={styles.subtitle}>Complete your purchase details below.</p>

      <div className={styles.grid}>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.sectionLabel}>Shipping Information</div>
          
          {userCoins > 0 && (
            <div className={styles.coinBanner}>
              <span className={styles.coinIcon}>🪙</span>
              <div>
                <div className={styles.coinTitle}>Use Atom Coins</div>
                <div className={styles.coinSub}>You have {userCoins} coins (₹{userCoins} off)</div>
              </div>
              <button type="button" onClick={() => setUseCoins(!useCoins)} className={styles.loginLink}>
                {useCoins ? 'Remove' : 'Apply'}
              </button>
            </div>
          )}

          <div className={styles.field}>
            <label>Full Name <span className={styles.required}>*</span></label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              placeholder="Your full name"
              value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              required
            />
            {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
          </div>

          <div className={styles.field}>
            <label>Phone Number <span className={styles.required}>*</span></label>
            <input 
              type="tel" 
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              required
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.field}>
            <label>Complete Address <span className={styles.required}>*</span></label>
            <textarea 
              className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
              placeholder="Flat/House no., Street, Area"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              required
            />
            {errors.address && <span className={styles.errorText}>{errors.address}</span>}
          </div>

          <div className={styles.field}>
            <label>Pincode <span className={styles.required}>*</span></label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
              placeholder="6-digit PIN code"
              value={form.pincode}
              onChange={e => handleChange('pincode', e.target.value)}
              required
            />
            {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: 24 }}>Payment Method</div>
          
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'half_cod', title: '🚚 Half COD', desc: 'Pay 50% now, 50% on delivery' },
              { id: 'full_prepaid', title: '✅ Full Prepaid', desc: 'Get extra ₹2,000 off' },
              { id: 'token_advance', title: '🎫 Token Advance', desc: 'Pay 30% advance, rest on delivery' }
            ].map(opt => (
              <label 
                key={opt.id} 
                className={`${styles.paymentOption || ''} ${selectedPayment === opt.id ? styles.paymentActive : ''}`}
                style={{ 
                  display: 'block', 
                  padding: '14px 16px', 
                  background: '#111111', 
                  border: selectedPayment === opt.id ? '2px solid #39ff14' : '2px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedPayment === opt.id}
                  onChange={() => setSelectedPayment(opt.id)}
                  style={{ display: 'none' }}
                />
                <div className={styles.paymentTitle}>{opt.title}</div>
                <div className={styles.paymentDesc}>{opt.desc}</div>
              </label>
            ))}
          </div>

          {submitError && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{submitError}</div>}

          <button type="submit" disabled={submitting} className={styles.placeOrderBtn}>
            {submitting ? 'Placing Order...' : 'Confirm Order'}
          </button>
          
          <p className={styles.safeText}>🔒 Secure Checkout via WhatsApp Confirmation</p>
        </form>

        <div className={styles.summaryCard}>
          <div className={styles.sectionLabel}>Order Summary</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <div>
                  <div style={{ fontWeight: '700' }}>{item.name}</div>
                  {item.variantInfo && (
                    <div style={{ fontSize: 11, color: '#888888' }}>
                      {item.variantInfo.ram}GB RAM / {item.variantInfo.storage}GB Storage
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#888888' }}>Qty: {item.quantity || 1}</div>
                </div>
                <div>{formatINR(item.basePrice * (item.quantity || 1))}</div>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.row}>
            <span>Subtotal</span>
            <span>{formatINR(totals.baseTotal)}</span>
          </div>

          <div className={styles.row}>
            <span>Payment Discount</span>
            <span>- {formatINR(totals.discountTotal)}</span>
          </div>

          {useCoins && (
            <div className={styles.row} style={{ color: '#39ff14' }}>
              <span>Coins Discount</span>
              <span>- {formatINR(Math.min(totals.finalTotal, userCoins))}</span>
            </div>
          )}

          <div className={styles.divider} />

          <div className={styles.rowTotal}>
            <span>Total</span>
            <span>{formatINR(finalOrderPrice)}</span>
          </div>

          {totals.advanceTotal > 0 && (
            <div className={styles.paymentBox} style={{ marginTop: 12 }}>
              <div className={styles.paymentLabel}>Payable Advance Now</div>
              <div className={styles.paymentValue} style={{ color: '#39ff14', fontSize: 18, fontWeight: 800 }}>
                {formatINR(totals.advanceTotal)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
