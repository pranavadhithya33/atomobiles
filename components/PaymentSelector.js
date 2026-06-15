'use client';

import styles from '@/styles/ProductDetail.module.css';
import { formatINR, calcPaymentDetails } from '@/lib/utils';
import { CheckCircle, Truck, CreditCard, Tag } from 'lucide-react';

export default function PaymentSelector({ ourPrice, selectedOption, onSelect }) {
  const halfDetails = calcPaymentDetails(ourPrice, 'half_cod');
  const tokenDetails = calcPaymentDetails(ourPrice, 'token_advance');
  const fullDetails = calcPaymentDetails(ourPrice, 'full_prepaid');

  return (
    <div className={`${styles.paymentSection} darkTextCard`}>
      <h3 className={styles.paymentTitle}>
        <CreditCard size={18} strokeWidth={2} />
        Choose Payment Option
      </h3>

      {/* Option 1: Full Prepaid */}
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
              <span className={styles.prepaidBadge} style={{ background: 'var(--success)', color: '#fff' }}>₹{fullDetails.discount} OFF</span>
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay full amount and save ₹{fullDetails.discount} instantly!
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
              <span>Prepaid Discount</span>
              <strong style={{ color: 'var(--brand-accent)' }}>− {formatINR(fullDetails.discount)}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal} ${styles.prepaidTotal}`}>
              <span>You Pay</span>
              <strong>{formatINR(fullDetails.finalPrice)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Option 2: Half + COD */}
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
              <span className={styles.prepaidBadge} style={{ background: 'var(--glass-border)', color: 'var(--text-primary)', marginLeft: '6px' }}>₹{halfDetails.discount} OFF</span>
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay advance now, rest on delivery
            </div>
          </div>
        </div>

        {selectedOption === 'half_cod' && (
          <div className={styles.paymentBreakdown}>
            <div className={styles.paymentBreakdownRow}>
              <span>Original price</span>
              <span style={{ textDecoration: 'line-through', color: '#9aa3b2' }}>{formatINR(ourPrice)}</span>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Discount</span>
              <strong style={{ color: 'var(--brand-accent)' }}>− {formatINR(halfDetails.discount)}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal}`}>
              <span>Advance (pay now)</span>
              <strong>{formatINR(halfDetails.advance)}</strong>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Remaining on delivery</span>
              <strong>{formatINR(halfDetails.remaining)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Option 3: Token Advance (30%) */}
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
              <span className={styles.prepaidBadge} style={{ background: 'var(--glass-border)', color: 'var(--text-primary)', marginLeft: '6px' }}>₹{tokenDetails.discount} OFF</span>
            </div>
            <div className={styles.paymentOptionDesc}>
              Pay 30% now, remaining on delivery
            </div>
          </div>
        </div>

        {selectedOption === 'token_advance' && (
          <div className={styles.paymentBreakdown}>
            <div className={styles.paymentBreakdownRow}>
              <span>Original price</span>
              <span style={{ textDecoration: 'line-through', color: '#9aa3b2' }}>{formatINR(ourPrice)}</span>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Discount</span>
              <strong style={{ color: 'var(--brand-accent)' }}>− {formatINR(tokenDetails.discount)}</strong>
            </div>
            <div className={`${styles.paymentBreakdownRow} ${styles.paymentTotal}`}>
              <span>Token Advance (pay now)</span>
              <strong>{formatINR(tokenDetails.advance)}</strong>
            </div>
            <div className={styles.paymentBreakdownRow}>
              <span>Remaining on delivery</span>
              <strong>{formatINR(tokenDetails.remaining)}</strong>
            </div>
          </div>
        )}
      </button>

      {/* Summary line */}
      <div className={styles.paymentSummary}>
        {selectedOption === 'half_cod' ? (
          <p>
            <Tag size={13} strokeWidth={2} />
            Pay <strong>{formatINR(halfDetails.advance)}</strong> advance · ₹{halfDetails.remaining} on delivery
          </p>
        ) : selectedOption === 'token_advance' ? (
          <p>
            <Tag size={13} strokeWidth={2} />
            Pay <strong>{formatINR(tokenDetails.advance)}</strong> token advance · ₹{tokenDetails.remaining} on delivery
          </p>
        ) : (
          <p style={{ color: 'var(--brand-accent)' }}>
            <CheckCircle size={13} strokeWidth={2} />
            You save an extra <strong>{formatINR(fullDetails.discount)}</strong> with prepaid!
          </p>
        )}
      </div>
    </div>
  );
}
