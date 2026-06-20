"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import styles from './page.module.css';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setSearched(true);
    // Simulate tracking result
    setTrackingResult({
      id: orderId || 'ATB-2024-001',
      status: 'shipped',
      items: [
        { name: 'iPhone 16 Pro Max', qty: 2 },
        { name: 'Galaxy S24 Ultra', qty: 1 },
      ],
      timeline: [
        { step: 'Order Placed', date: '20 Jun 2026, 10:30 AM', done: true },
        { step: 'Confirmed', date: '20 Jun 2026, 11:15 AM', done: true },
        { step: 'Shipped', date: '21 Jun 2026, 02:00 PM', done: true, active: true },
        { step: 'Out for Delivery', date: 'Expected 22 Jun 2026', done: false },
        { step: 'Delivered', date: 'Expected 22 Jun 2026', done: false },
      ],
    });
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.pageTitle}>Track Order</h1>

          <form onSubmit={handleTrack} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Enter Order ID (e.g., ATB-2024-001)"
              className={styles.searchInput}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <button type="submit" className={`btn btn-primary btn-lg ${styles.searchBtn}`}>
              Track
            </button>
          </form>

          {searched && trackingResult && (
            <div className={styles.result}>
              <div className={styles.resultHeader}>
                <div>
                  <span className={styles.orderId}>Order #{trackingResult.id}</span>
                  <span className={`${styles.status} ${styles[trackingResult.status]}`}>
                    {trackingResult.status}
                  </span>
                </div>
              </div>

              <div className={styles.itemsList}>
                {trackingResult.items.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <span>{item.name}</span>
                    <span>Qty: {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className={styles.timeline}>
                {trackingResult.timeline.map((step, i) => (
                  <div key={i} className={`${styles.timelineStep} ${step.done ? styles.done : ''} ${step.active ? styles.active : ''}`}>
                    <div className={styles.timelineDot}>
                      {step.done && <span>✓</span>}
                    </div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineTitle}>{step.step}</span>
                      <span className={styles.timelineDate}>{step.date}</span>
                    </div>
                    {i < trackingResult.timeline.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searched && !trackingResult && (
            <div className={styles.notFound}>
              <p>Order not found. Please check your Order ID and try again.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
