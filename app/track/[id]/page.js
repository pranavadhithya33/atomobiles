'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, CheckCircle, XCircle, ArrowLeft, Clock, Hash, MapPin, Calendar, Download } from 'lucide-react';
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
  
  // Calculate days passed since creation
  const orderDate = new Date(order.created_at);
  const today = new Date();
  const diffTime = Math.max(0, today - orderDate);
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Stages Mapping
  const stages = [
    "Day 1: Ordered",
    "Day 2: Placed order with brand",
    "Day 3: Applied offer price",
    "Day 4: Shipped by road",
    "Day 5: Reached main hub",
    "Day 6: Assigned to local transport",
    "Day 7: Reached Bengaluru hub",
    "Day 8: In transit to Chennai hub",
    "Day 9: Shipped to your orders",
    "Day 10: Delivered"
  ];

  // Current stage index (0 to 9)
  let currentStageIndex = daysPassed;
  if (currentStageIndex > 9) currentStageIndex = 9;

  // Override if order is already marked delivered in DB
  if (order.status === 'delivered') currentStageIndex = 9;

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto', minHeight: '80vh' }}>
      <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px dashed var(--border)' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Live Tracking</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Hash size={14} /> {order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div style={{ 
            background: isCancelled ? '#fee2e2' : currentStageIndex === 9 ? '#dcfce7' : '#e0f2fe', 
            color: isCancelled ? '#ef4444' : currentStageIndex === 9 ? '#16a34a' : '#0ea5e9',
            padding: '6px 14px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isCancelled ? 'Cancelled' : currentStageIndex === 9 ? 'Delivered' : 'In Transit'}
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

        {/* Timeline */}
        <div style={{ marginBottom: 32 }}>
          {isCancelled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#ef4444', background: '#fee2e2', padding: 20, borderRadius: 16, border: '1px solid #fecaca' }}>
              <XCircle size={32} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Order Cancelled</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>This order has been cancelled. Please contact support for more details.</div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 8 }}>
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isFuture = idx > currentStageIndex;
                const isLast = idx === stages.length - 1;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: 20, marginBottom: isLast ? 0 : 20, position: 'relative' }}>
                    {/* Line */}
                    {!isLast && (
                      <div style={{ 
                        position: 'absolute', 
                        left: 14, 
                        top: 30, 
                        bottom: -20, 
                        width: 2, 
                        background: isCompleted ? '#16a34a' : '#f1f5f9',
                        zIndex: 1
                      }} />
                    )}
                    
                    {/* Icon/Dot */}
                    <div style={{ 
                      width: 30, 
                      height: 30, 
                      borderRadius: '50%', 
                      background: isCompleted ? '#16a34a' : (isCurrent ? 'var(--brand-primary)' : '#fff'),
                      border: isFuture ? '2px solid #f1f5f9' : 'none',
                      color: isFuture ? '#94a3b8' : '#fff',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: isCurrent ? '0 0 0 5px rgba(244, 167, 36, 0.15)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : (isCurrent ? <Truck size={16} strokeWidth={3} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />)}
                    </div>
                    
                    {/* Text */}
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ 
                        fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500), 
                        fontSize: 15,
                        color: isFuture ? '#94a3b8' : (isCurrent ? 'var(--text-primary)' : '#16a34a')
                      }}>
                        {stage}
                      </div>
                      {isCurrent && (
                        <div style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> Currently here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Info Summary */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9' }}>
          <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="var(--brand-primary)" />
            Order Summary
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Item</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'right' }}>{order.product_name}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
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
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{order.full_name}</div>
            <div style={{ color: '#64748b', lineHeight: 1.4 }}>{order.address}</div>
            <div style={{ color: '#64748b', fontWeight: 600, marginTop: 4 }}>PIN: {order.pincode}</div>
          </div>
        </div>
      </div>

      {/* Track Another Order Section */}
      <div style={{ marginTop: 32, padding: 24, background: '#fff', borderRadius: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Track Another Order</h3>
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

// Additional icons needed
const RefreshCw = ({ size = 16, className = "", color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);
