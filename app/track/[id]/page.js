'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, XCircle, ArrowLeft, Hash, MapPin, Download, Check } from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';
import { formatINR } from '@/lib/utils';

export default function TrackOrderPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const router = useRouter();

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
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <RefreshCw size={32} className="spin" color="var(--brand-primary)" />
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Syncing with tracking server...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <XCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Order Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The tracking link might be invalid or expired.</p>
        
        <div style={{ width: '100%', maxWidth: 400, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Enter another Order ID"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
                borderRadius: 12, 
                border: '1px solid #e2e8f0', 
                fontSize: 14, 
                outline: 'none',
                background: '#fff'
              }}
            />
            <button 
              onClick={() => searchOrderId.trim() && router.push(`/track/${searchOrderId.trim().toLowerCase()}`)}
              style={{ 
                padding: '0 24px', 
                background: 'var(--brand-primary)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 12, 
                fontSize: 14, 
                fontWeight: 800, 
                cursor: 'pointer' 
              }}
            >
              Track
            </button>
          </div>
        </div>

        <Link href="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>Return to Store</Link>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  // 6-step manual destination system
  const currentStep = order.current_step || 1;
  const steps = [
    { num: 1, text: order.step1 || 'Order Placed' },
    { num: 2, text: order.step2 || 'Pending Hub Update' },
    { num: 3, text: order.step3 || 'Pending Hub Update' },
    { num: 4, text: order.step4 || 'Pending Hub Update' },
    { num: 5, text: order.step5 || 'Pending Hub Update' },
    { num: 6, text: order.step6 || 'Pending Hub Update' }
  ];

  // Active step text for location banner
  const activeStepText = steps[currentStep - 1].text;

  // Status label and colors
  const getStatusStyle = () => {
    if (isCancelled) return { bg: '#fee2e2', color: '#ef4444', label: 'Cancelled' };
    if (isDelivered) return { bg: '#dcfce7', color: '#16a34a', label: 'Delivered' };
    if (order.status === 'shipped') return { bg: '#e0f2fe', color: '#0ea5e9', label: 'Shipped' };
    if (order.status === 'confirmed') return { bg: '#fef3d0', color: '#d4890a', label: 'Confirmed' };
    if (order.status === 'delayed') return { bg: '#fef3cd', color: '#b45309', label: 'Delayed' };
    return { bg: '#f1f5f9', color: '#64748b', label: 'Pending' };
  };
  const statusStyle = getStatusStyle();

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto', minHeight: '80vh' }}>
      <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px dashed var(--border)' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-dark)' }}>Live Tracking</h1>
            <div style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Hash size={14} /> {order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div style={{ 
            background: statusStyle.bg, 
            color: statusStyle.color,
            padding: '6px 14px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {statusStyle.label}
          </div>
        </div>

        {/* Download Invoice Button */}
        <div style={{ marginBottom: 24 }}>
          <button 
            onClick={() => generateInvoice(order)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#f8fafc', 
              color: 'var(--brand-primary)', 
              border: '1px solid #e2e8f0', 
              borderRadius: 12, 
              fontSize: 14, 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              cursor: 'pointer' 
            }}
          >
            <Download size={18} /> Download Invoice PDF
          </button>
        </div>

        {/* Current Destination / Status */}
        <div style={{ marginBottom: 24 }}>
          {isCancelled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#ef4444', background: '#fee2e2', padding: 20, borderRadius: 16, border: '1px solid #fecaca' }}>
              <XCircle size={32} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Order Cancelled</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>This order has been cancelled. Please contact support for more details.</div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(244,167,36,0.1), rgba(244,167,36,0.05))',
              border: '1.5px solid rgba(244,167,36,0.3)',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--brand-accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 6px rgba(244,167,36,0.15)',
                flexShrink: 0,
              }}>
                <Truck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  📍 Current Location
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.3 }}>
                  {activeStepText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6-Step Flowchart Timeline */}
        {!isCancelled && (
          <div style={{ marginBottom: 32, background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 16px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flowchart-timeline" style={{ '--fill-pct': `${((currentStep - 1) / 5) * 100}%` }}>
              <div className="flowchart-line">
                <div className="flowchart-progress-fill" />
              </div>

              {steps.map((step) => {
                const isCompleted = step.num < currentStep;
                const isActive = step.num === currentStep;
                const isPending = step.num > currentStep;
                
                let stateClass = 'pending';
                if (isCompleted) stateClass = 'completed';
                if (isActive) stateClass = 'active';

                return (
                  <div key={step.num} className={`flowchart-node ${stateClass}`}>
                    <div className="flowchart-node-circle">
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : isActive ? (
                        <Truck size={14} strokeWidth={2.5} />
                      ) : (
                        step.num
                      )}
                    </div>
                    <div className="flowchart-node-label">
                      {step.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Info Summary */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9' }}>
          <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="var(--brand-primary)" />
            Order Summary
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Item</span>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)', maxWidth: '60%', textAlign: 'right' }}>{order.product_name}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method</span>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                {order.payment_option === 'full_prepaid' ? 'Full Prepaid' : (order.payment_option === 'half_cod' ? 'Half COD' : 'Token Advance')}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Total Value</span>
              <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: 15 }}>{formatINR(order.final_price)}</span>
            </div>
          </div>
          
          <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
          
          <div style={{ fontSize: 13 }}>
            <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> Shipping To:
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: 2 }}>{order.full_name}</div>
            <div style={{ color: '#64748b', lineHeight: 1.4 }}>{order.address}</div>
            <div style={{ color: '#64748b', fontWeight: 600, marginTop: 4 }}>PIN: {order.pincode}</div>
          </div>
        </div>
      </div>

      {/* Track Another Order Section */}
      <div style={{ marginTop: 32, padding: 24, background: '#fff', borderRadius: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-dark)' }}>Track Another Order</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Enter a different Order ID to check its status or download invoice.</p>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <input 
            type="text" 
            placeholder="e.g. 8b2f1a3c"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '12px 16px', 
              borderRadius: 12, 
              border: '1px solid #e2e8f0', 
              fontSize: 14, 
              outline: 'none',
              background: '#f8fafc'
            }}
          />
          <button 
            onClick={() => searchOrderId.trim() && router.push(`/track/${searchOrderId.trim().toLowerCase()}`)}
            style={{ 
              padding: '0 24px', 
              background: 'var(--brand-primary)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 12, 
              fontSize: 14, 
              fontWeight: 800, 
              cursor: 'pointer' 
            }}
          >
            Track
          </button>
        </div>
      </div>
    </div>
  );
}

// Spinner icon
const RefreshCw = ({ size = 16, className = "", color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);
