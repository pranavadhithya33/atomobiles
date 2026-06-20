"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import styles from './page.module.css';

export default function OrderPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirm' },
  ];

  const orderItems = [
    { name: 'iPhone 16 Pro Max', qty: 2, price: 149900 },
    { name: 'Galaxy S24 Ultra', qty: 1, price: 129999 },
  ];

  const total = orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.pageTitle}>Place Order</h1>

          {/* Stepper */}
          <div className={styles.stepper}>
            {steps.map((s) => (
              <div key={s.num} className={`${styles.step} ${step >= s.num ? styles.stepActive : ''} ${step > s.num ? styles.stepDone : ''}`}>
                <div className={styles.stepNum}>{step > s.num ? '✓' : s.num}</div>
                <span className={styles.stepLabel}>{s.label}</span>
                {s.num < 3 && <div className={styles.stepLine} />}
              </div>
            ))}
          </div>

          <div className={styles.orderLayout}>
            {/* Form */}
            <div className={styles.formSection}>
              {step === 1 && (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h2>Shipping Details</h2>
                  <div className={styles.formGrid}>
                    <input type="text" placeholder="Full Name" className={styles.input} required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input type="email" placeholder="Email Address" className={styles.input} required
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input type="tel" placeholder="Phone Number" className={styles.input} required
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <input type="text" placeholder="City" className={styles.input} required
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input type="text" placeholder="PIN Code" className={styles.input} required
                      value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    <textarea placeholder="Full Address" rows={3} className={styles.input} required
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <button type="submit" className={`btn btn-primary btn-lg ${styles.nextBtn}`}>
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h2>Payment Method</h2>
                  <div className={styles.paymentOptions}>
                    <label className={`${styles.paymentCard} ${paymentMethod === 'cod' ? styles.paymentActive : ''}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div className={styles.paymentIcon}>💵</div>
                      <div>
                        <span className={styles.paymentTitle}>Cash on Delivery</span>
                        <span className={styles.paymentDesc}>Pay when you receive</span>
                      </div>
                    </label>
                    <label className={`${styles.paymentCard} ${paymentMethod === 'prepaid' ? styles.paymentActive : ''}`}>
                      <input type="radio" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                      <div className={styles.paymentIcon}>💳</div>
                      <div>
                        <span className={styles.paymentTitle}>Prepaid (UPI/Bank)</span>
                        <span className={styles.paymentDesc}>5% discount on prepaid</span>
                      </div>
                    </label>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                    <button type="submit" className={`btn btn-primary btn-lg ${styles.nextBtn}`}>
                      Review Order
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className={styles.confirm}>
                  <h2>Confirm Order</h2>
                  <div className={styles.confirmDetails}>
                    <div className={styles.confirmBlock}>
                      <h3>Ship To</h3>
                      <p>{formData.name}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city} — {formData.pincode}</p>
                      <p>{formData.phone}</p>
                    </div>
                    <div className={styles.confirmBlock}>
                      <h3>Payment</h3>
                      <p>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid (UPI/Bank)'}</p>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                    <button className={`btn btn-primary btn-lg ${styles.nextBtn}`} onClick={() => alert('Order placed!')}>
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              <div className={styles.items}>
                {orderItems.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <span>{item.name} x{item.qty}</span>
                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {paymentMethod === 'prepaid' && (
                <div className={styles.summaryRow}>
                  <span>Prepaid Discount (5%)</span>
                  <span style={{ color: '#10b981' }}>-₹{Math.round(total * 0.05).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>₹{paymentMethod === 'prepaid' ? Math.round(total * 0.95).toLocaleString('en-IN') : total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
