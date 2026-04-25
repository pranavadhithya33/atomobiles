'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/OrderForm.module.css';
import { formatINR, validatePhone, validatePincode, buildWhatsAppUrl } from '@/lib/utils';
import { CheckCircle, ArrowLeft, ShoppingBag, User, Phone, MapPin, Hash, CreditCard } from 'lucide-react';

const WHATSAPP_NUMBER = '917397189222';

function OrderFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get('productId') || '';
  const productName = searchParams.get('productName') || '';
  const productSlug = searchParams.get('productSlug') || '';
  const paymentOption = searchParams.get('paymentOption') || 'half_cod';
  const basePrice = parseInt(searchParams.get('basePrice') || '0');
  const finalPrice = parseInt(searchParams.get('finalPrice') || '0');
  const advanceAmount = parseInt(searchParams.get('advanceAmount') || '0');

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', pincode: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Redirect if no product
  useEffect(() => {
    if (!productId || !finalPrice) {
      router.replace('/');
    }
  }, [productId, finalPrice, router]);

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
          product_id: productId,
          product_name: productName,
          product_slug: productSlug,
          payment_option: paymentOption,
          base_price: basePrice,
          discount_amount: basePrice - finalPrice,
          final_price: finalPrice,
          advance_amount: advanceAmount || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setOrderId(data.id?.slice(0, 8)?.toUpperCase() || 'N/A');
      setSubmitted(true);

      // Auto-open WhatsApp
      const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, {
        name: form.fullName,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        productName,
        paymentOption,
        finalPrice,
        advanceAmount,
      });
      setTimeout(() => window.open(waUrl, '_blank'), 800);

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
      productName,
      paymentOption,
      finalPrice,
      advanceAmount,
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
              className="btn btn-whatsapp btn-full btn-lg">
              💬 Confirm on WhatsApp
            </a>
            <Link href="/" className="btn btn-secondary btn-full">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paymentLabel = paymentOption === 'full_prepaid'
    ? `Full Prepaid (3% extra off)`
    : `Half Payment + Cash on Delivery`;

  return (
    <div className={styles.page}>
      {/* Back */}
      <Link href={productSlug ? `/products/${productSlug}` : '/'} style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600 }}>
        <ArrowLeft size={16} /> Back to Product
      </Link>

      <div>
        <h1 className={styles.pageTitle}>Complete Your Order</h1>
        <p className={styles.pageSubtitle}>Fill in your details to place the order</p>
      </div>

      {/* Order Summary */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>Order Summary</div>
        <div className={styles.summaryRow}>
          <span>Product</span>
          <strong style={{ fontSize:13, maxWidth:180, textAlign:'right' }}>{productName}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Payment</span>
          <span className={styles.summaryPaymentTag}>
            {paymentOption === 'full_prepaid' ? '✅ Full Prepaid' : '🚚 Half + COD'}
          </span>
        </div>
        {paymentOption === 'half_cod' && advanceAmount > 0 && (
          <div className={styles.summaryRow}>
            <span>Advance (Pay Now)</span>
            <strong style={{ color:'var(--brand-accent-dark)' }}>{formatINR(advanceAmount)}</strong>
          </div>
        )}
        {paymentOption === 'half_cod' && advanceAmount > 0 && (
          <div className={styles.summaryRow}>
            <span>On Delivery</span>
            <strong>{formatINR(finalPrice - advanceAmount)}</strong>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span>Total Amount</span>
          <strong style={{ color:'var(--text-primary)', fontSize:19 }}>{formatINR(finalPrice)}</strong>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formCard}>
          <div className={styles.sectionLabel}>
            <User size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
            Personal Details
          </div>

          {/* Full Name */}
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

          {/* Phone */}
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

          {/* Address */}
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

          {/* Pincode */}
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
            <div className={styles.readOnlyField}>{paymentLabel}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Final Price (Auto-calculated)</label>
            <div className={styles.readOnlyField} style={{ fontWeight:700, fontSize:17, color:'var(--text-primary)' }}>
              {formatINR(finalPrice)}
            </div>
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
            <><ShoppingBag size={18} /> Place Order — {formatINR(finalPrice)}</>
          )}
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:12 }}>
          🔒 Your details are safe with us. We'll contact you before dispatching.
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
