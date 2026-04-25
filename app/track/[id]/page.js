'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import styles from '@/styles/ProductDetail.module.css'; // Reusing some base styles or we can use inline styles for the timeline

export default function TrackOrderPage({ params }) {
  // Next.js 15+ way to unwrap params
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <XCircle size={48} color="var(--danger)" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Order Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The tracking link might be invalid or expired.</p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    if (status === 'delivered') return 2;
    if (status === 'shipped') return 1;
    return 0; // pending
  };

  const currentStep = getStatusIndex(order.status);
  const isCancelled = currentStep === -1;

  const steps = [
    { label: 'Order Placed', icon: <Package size={20} />, description: 'We have received your order.' },
    { label: 'Shipped', icon: <Truck size={20} />, description: 'Your package is on the way.' },
    { label: 'Delivered', icon: <CheckCircle size={20} />, description: 'Package delivered successfully.' },
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto', minHeight: '70vh' }}>
      <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }}>Order Tracking</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hash size={12} /> {order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div style={{ 
            background: isCancelled ? '#fee2e2' : currentStep === 2 ? '#dcfce7' : '#fef9c3', 
            color: isCancelled ? '#991b1b' : currentStep === 2 ? '#166534' : '#854d0e',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            {order.status}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 32 }}>
          {isCancelled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--danger)', background: '#fee2e2', padding: 16, borderRadius: 8 }}>
              <XCircle size={24} />
              <div>
                <div style={{ fontWeight: 600 }}>Order Cancelled</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>This order has been cancelled.</div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 12 }}>
              {steps.map((step, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const isLast = idx === steps.length - 1;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 24, position: 'relative' }}>
                    {!isLast && (
                      <div style={{ 
                        position: 'absolute', 
                        left: 15, 
                        top: 32, 
                        bottom: -16, 
                        width: 2, 
                        background: isActive ? 'var(--brand-accent)' : '#e5e7eb',
                        zIndex: 1
                      }} />
                    )}
                    
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      background: isActive ? 'var(--brand-accent)' : '#f3f4f6',
                      color: isActive ? '#fff' : '#9ca3af',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(255, 107, 0, 0.2)' : 'none'
                    }}>
                      {step.icon}
                    </div>
                    
                    <div style={{ paddingTop: 6 }}>
                      <div style={{ fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div style={{ background: 'var(--bg-page)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Order Details</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Product</span>
            <span style={{ fontWeight: 600, maxWidth: 160, textAlign: 'right' }}>{order.product_name}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Payment</span>
            <span style={{ fontWeight: 600 }}>{order.payment_option === 'full_prepaid' ? 'Full Prepaid' : 'Half + COD'}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
            <span style={{ fontWeight: 600 }}>{formatINR(order.final_price)}</span>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '12px 0' }} />
          
          <div style={{ fontSize: 13 }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Shipping Address:</div>
            <div style={{ fontWeight: 600 }}>{order.full_name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{order.address}</div>
            <div style={{ color: 'var(--text-secondary)' }}>PIN: {order.pincode}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Hash icon component since we forgot to import it from lucide-react
const Hash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);
