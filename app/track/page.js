'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Search, ArrowLeft, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrackingLandingPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleTrack = (e) => {
    e.preventDefault();
    const id = orderId.trim().toLowerCase();
    if (id) {
      // Force direct navigation to bypass any router issues
      window.location.href = `/track/${id}`;
    } else {
      alert('Please enter a valid Order ID');
    }
  };

  return (
    <div style={{ padding: '60px 16px', maxWidth: 600, margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:14, fontWeight:600, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Back to Shopping
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="darkTextCard"
        style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', textAlign: 'center' }}
      >
        <div style={{ width: 64, height: 64, background: 'rgba(244, 167, 36, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Truck size={32} color="var(--brand-accent)" />
        </div>
        
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Track Your Shipment</h1>
        <p style={{ fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Enter your Order ID to view real-time delivery status, tracking timeline, and download your invoice.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. 8b2f1a3c)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              className="tracking-input"
              style={{ 
                width: '100%', 
                padding: '16px 20px', 
                borderRadius: 16, 
                border: '2px solid var(--border)', 
                fontSize: 16, 
                outline: 'none',
                transition: 'border-color 0.2s',
                fontWeight: 600,
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'var(--brand-primary)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 16, 
              fontSize: 16, 
              fontWeight: 800, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Search size={20} /> Track Now
          </motion.button>
        </form>
        
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px dashed var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
          Need help? Contact us on <a href="https://wa.me/917397189222" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>WhatsApp</a>
        </div>
      </motion.div>
    </div>
  );
}
