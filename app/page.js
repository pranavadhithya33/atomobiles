'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard, { SkeletonCard } from '@/components/ProductCard';
import ReviewsSection from '@/components/ReviewsSection';
import { motion } from 'framer-motion';
import { Smartphone, Tag, Star, TrendingUp, ChevronRight, Zap, Truck, CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(prodData => {
        setProducts(prodData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 60%, var(--brand-primary) 100%)',
          padding: '28px 16px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'var(--brand-accent)', filter: 'blur(40px)', pointerEvents:'none' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position:'absolute', bottom:-30, left:-20, width:120, height:120, borderRadius:'50%', background:'#fff', filter: 'blur(30px)', pointerEvents:'none' }} 
        />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <span style={{ background:'#f4a724', color:'#0a1628', fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:99, letterSpacing:'0.8px', textTransform:'uppercase' }}>
              ⚡ Wholesale Price
            </span>
            <span style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:99 }}>
              Direct from Dealer
            </span>
          </div>
          <h1 className="glitch-text" data-text="ATOMOBILES" style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:'-0.5px', marginBottom:8, textTransform: 'uppercase' }}>
            ATOMOBILES<br />
            <span style={{ color:'var(--brand-accent)', fontSize: 22, display: 'block', marginTop: 4 }}>High-Tech Wholesale Deals</span>
          </h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:20, lineHeight:1.5 }}>
            Wholesale deals · Half COD available · Full prepaid gets extra savings
          </p>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <a href="#products" style={{
              background:'#f4a724', color:'#0a1628', padding:'11px 22px',
              borderRadius:12, fontWeight:800, fontSize:14, display:'inline-flex',
              alignItems:'center', gap:6, textDecoration:'none'
            }}>
              <Zap size={15} strokeWidth={2.5} />
              Shop Now
            </a>
            <a href={`https://wa.me/917397189222?text=${encodeURIComponent('Hi! I want to know about your deals.')}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                background:'rgba(37,211,102,0.15)', color:'#25d366', padding:'11px 22px',
                borderRadius:12, fontWeight:700, fontSize:14, display:'inline-flex',
                alignItems:'center', gap:6, border:'1px solid rgba(37,211,102,0.3)', textDecoration:'none'
              }}>
              📱 WhatsApp Us
            </a>
          </div>
        </div>
      </motion.div>

      {/* USP Strip - Premium Feature Grid */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px' }}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '16px', scrollSnapType: 'x mandatory' }}
        >
          {[
            { icon: <Tag size={20} color="var(--brand-accent)" />, title: 'Unbeatable Dealer Pricing', desc: 'Direct-to-retailer margins' },
            { icon: <Truck size={20} color="var(--brand-accent)" />, title: 'Express Nationwide Shipping', desc: 'Secure transit across India' },
            { icon: <CreditCard size={20} color="var(--brand-accent)" />, title: 'Flexible Payment Terms', desc: 'Pay 50% advance, rest on delivery' },
            { icon: <ShieldCheck size={20} color="var(--brand-accent)" />, title: '100% Verified Authenticity', desc: 'Quality guaranteed on every unit' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              style={{
                display: 'flex', flexDirection: 'column', gap: '4px',
                padding: '16px', background: 'var(--bg-page)', borderRadius: '12px',
                minWidth: '220px', scrollSnapAlign: 'start', border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {item.icon}
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Top Selling Section */}
      {!loading && products.some(p => p.featured && p.stock > 0) && (
        <div style={{ padding: '0 16px', marginTop: 32 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={24} color="var(--brand-accent)" /> Top <span>Selling</span>
            </h2>
          </div>
          <div className="product-grid" style={{ marginBottom: 20 }}>
            {products
              .filter(p => p.featured && p.stock > 0)
              .slice(0, 4)
              .map(p => <ProductCard key={`featured-${p.id}`} product={p} />)
            }
          </div>
        </div>
      )}



      {/* Products Grid */}
      <div id="products" style={{ padding:'12px 12px 0' }}>
        <div className="section-header" style={{ padding:'0 4px', marginBottom:12 }}>
          <h2 className="section-title">
            All <span>Smartphones</span>
          </h2>
          {!loading && (
            <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>
              {products.length} item{products.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign:'center', padding:'48px 16px',
            background:'#fff', borderRadius:16, margin:'0 4px'
          }}>
            <div style={{ fontSize:48, marginBottom:12, display: 'flex', justifyContent: 'center' }}><Smartphone size={48} color="var(--brand-accent)" /></div>
            <div style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:6 }}>
              No products found
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>
              Products will appear here once added.
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {products
              .filter(p => p.stock > 0)
              .map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        )}
      </div>

      {/* Why Choose Us */}
      <div style={{ padding:'32px 16px 16px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ background:'linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))', borderRadius:20, padding:'24px 16px' }}
        >
          <h2 style={{ color:'#fff', fontWeight:900, fontSize:20, marginBottom:20, textAlign:'center' }}>
            Why <span style={{ color:'var(--brand-accent)' }}>Atomobiles?</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon: <Tag size={24} color="var(--brand-accent)" />, title:'Best Wholesale Rates', desc:'No middlemen, direct savings' },
              { icon: <Truck size={24} color="var(--brand-accent)" />, title:'Pan India Delivery', desc:'Fast & reliable shipping' },
              { icon: <CreditCard size={24} color="var(--brand-accent)" />, title:'Half COD Available', desc:'Pay 50% advance, rest on delivery' },
              { icon: <ShieldCheck size={24} color="var(--brand-accent)" />, title:'Genuine Products', desc:'100% authentic, verified stock' },
            ].map((item, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.05)', borderRadius:16,
                padding:'16px 12px', border:'1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ marginBottom:10 }}>{item.icon}</div>
                <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Video Reviews Removed */}

      {/* Store Reviews */}
      <div style={{ padding: '0 16px' }}>
        <ReviewsSection productId="store" />
      </div>

      {/* Track Order CTA */}
      <div style={{ padding:'24px 16px 0' }}>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:'24px', textAlign:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:48, height:48, background:'#e0f2fe', borderRadius:12, marginBottom:16 }}>
            <Truck size={24} color="#0ea5e9" />
          </div>
          <h2 style={{ fontSize:18, fontWeight:800, marginBottom:8, color:'#0a1628' }}>Track Your Shipment</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Check your delivery status and download your invoice instantly.</p>
          <Link href="/track" style={{ 
            display:'block', width:'100%', padding:'14px', background:'#0a1628', color:'#fff', 
            borderRadius:12, fontWeight:700, fontSize:14, textDecoration:'none' 
          }}>
            Track Order Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{ padding:16 }}>
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
