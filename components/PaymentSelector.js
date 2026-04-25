'use client';

import styles from '@/styles/ProductDetail.module.css';
import { formatINR, calcPrepaidPrice } from '@/lib/utils';
import { CheckCircle, Truck, CreditCard, Tag } from 'lucide-react';

const PREPAID_DISCOUNT_PCT = Number(process.env.NEXT_PUBLIC_PREPAID_DISCOUNT_PCT) || 3;

export default function PaymentSelector({ ourPrice, selectedOption, onSelect }) {
  const halfAmount = Math.round(ourPrice / 2);
  const prepaidPrice = calcPrepaidPrice(ourPrice, PREPAID_DISCOUNT_PCT);
  const prepaidSavings = ourPrice - prepaidPrice;

  return (
    <div className={styles.paymentSection}>
      <h3 className={styles.paymentTitle}>
        <CreditCard size={18} strokeWidth={2} />
        Choose Payment Option
      </h3>

      {/* Option 1: Half + COD */}
      <button
        id="payment-half-cod"
        className={`${styles.paymentOption} ${selectedOption === 'half_cod' ? styles.paymentOptionActive : ''}`}
        onClick={() => onSelect('half_cod')}
        type="button"
        aria-pressed={selectedOption === 'half_cod'}
      >
        <div className={styles.paymentOptionHeader}>
          <div className={styles.paymentRadio}>
            {selectedOption === 'half_cod' && <div className={styles.paymentRadioDot} />}
          </div>
          <div className={styles.paymentOptionInfo}>
            <div className={styles.paymentOptionName}>
              <Truck size={15} strokeWidth={2} />
              Half Payment + Cash on Delivery
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay advance now, rest on delivery
            </div>
          </div>
        </div>

        {selectedOption === 'half_cod' && (
          <div className={styles.paymentBreakdown}>
            <div className={styles.paymentBreakdownRow}>
              <span>Advance (pay now)</span>
              <strong>{formatINR(halfAmount)}</strong>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Remaining on delivery</span>
              <strong>{formatINR(ourPrice - halfAmount)}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal}`}>
              <span>Total</span>
              <strong>{formatINR(ourPrice)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Option 2: Token Advance (30%) */}
      <button
        id="payment-token-advance"
        className={`${styles.paymentOption} ${selectedOption === 'token_advance' ? styles.paymentOptionActive : ''}`}
        onClick={() => onSelect('token_advance')}
        type="button"
        aria-pressed={selectedOption === 'token_advance'}
      >
        <div className={styles.paymentOptionHeader}>
          <div className={styles.paymentRadio}>
            {selectedOption === 'token_advance' && <div className={styles.paymentRadioDot} />}
          </div>
          <div className={styles.paymentOptionInfo}>
            <div className={styles.paymentOptionName}>
              <Tag size={15} strokeWidth={2} />
              30% Token Advance
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay 30% now, remaining on delivery
            </div>
          </div>
        </div>

        {selectedOption === 'token_advance' && (
          <div className={styles.paymentBreakdown}>
            <div className={styles.paymentBreakdownRow}>
              <span>Token Advance (30%)</span>
              <strong>{formatINR(Math.round(ourPrice * 0.3))}</strong>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Remaining on delivery</span>
              <strong>{formatINR(ourPrice - Math.round(ourPrice * 0.3))}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal}`}>
              <span>Total</span>
              <strong>{formatINR(ourPrice)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Option 2: Full Prepaid */}
      <button
        id="payment-full-prepaid"
        className={`${styles.paymentOption} ${styles.paymentOptionPrepaid} ${selectedOption === 'full_prepaid' ? styles.paymentOptionActive : ''}`}
        onClick={() => onSelect('full_prepaid')}
        type="button"
        aria-pressed={selectedOption === 'full_prepaid'}
      >
        <div className={styles.paymentOptionHeader}>
          <div className={styles.paymentRadio}>
            {selectedOption === 'full_prepaid' && <div className={styles.paymentRadioDot} />}
          </div>
          <div className={styles.paymentOptionInfo}>
            <div className={styles.paymentOptionName}>
              <CheckCircle size={15} strokeWidth={2} />
              Full Prepaid
              <span className={styles.prepaidBadge}>{PREPAID_DISCOUNT_PCT}% EXTRA OFF</span>
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay full amount and save more!
            </div>
          </div>
        </div>

        {selectedOption === 'full_prepaid' && (
          <div className={styles.paymentBreakdown}>
            <div className={styles.paymentBreakdownRow}>
              <span>Original price</span>
              <span style={{ textDecoration: 'line-through', color: '#9aa3b2' }}>{formatINR(ourPrice)}</span>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Prepaid discount ({PREPAID_DISCOUNT_PCT}%)</span>
              <strong style={{ color: '#16a34a' }}>− {formatINR(prepaidSavings)}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal} ${styles.prepaidTotal}`}>
              <span>You Pay</span>
              <strong>{formatINR(prepaidPrice)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Summary line */}
      <div className={styles.paymentSummary}>
        {selectedOption === 'half_cod' ? (
          <p>
            <Tag size={13} strokeWidth={2} />
            Pay <strong>{formatINR(halfAmount)}</strong> advance · ₹{ourPrice - halfAmount} on delivery
          </p>
        ) : selectedOption === 'token_advance' ? (
          <p>
            <Tag size={13} strokeWidth={2} />
            Pay <strong>{formatINR(Math.round(ourPrice * 0.3))}</strong> token advance · ₹{ourPrice - Math.round(ourPrice * 0.3)} on delivery
          </p>
        ) : (
          <p style={{ color: '#16a34a' }}>
            <CheckCircle size={13} strokeWidth={2} />
            You save an extra <strong>{formatINR(prepaidSavings)}</strong> with prepaid!
          </p>
        )}
      </div>
    </div>
  );
}
