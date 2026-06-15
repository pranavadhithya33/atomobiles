'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Award, Zap } from 'lucide-react';
import DealOfTheDay from '@/components/DealOfTheDay';

export default function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(prodData => {
        setProducts(prodData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 80, background: 'var(--bg-page)', fontFamily: 'var(--font-base)' }}>
      {/* 1. Hero Section */}
      <div className="heroSection" style={{
        background: 'radial-gradient(circle at 70% 50%, #4a2c1d 0%, var(--bg-page) 70%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <h1 className="hero-title">
            ATOMOBILES
          </h1>
          <h2 className="hero-subtitle">
            HIGH-TECH WHOLESALE DISTRIBUTION
          </h2>
          
          <div className="hero-features-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Verified B2B-only Pricing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Nationwide Express Shipping
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Flexible Payment Plans
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> 100% Quality Authenticated
            </div>
          </div>

          <div className="hero-buttons">
            <Link href="#products" className="hero-btn" style={{ background: 'var(--brand-accent)', color: '#160d0a', padding: '16px 32px', borderRadius: '30px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Zap size={20} fill="#160d0a" /> Shop Now
            </Link>
            <a href="https://wa.me/917397189222" target="_blank" rel="noopener noreferrer" className="hero-btn" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#fff', padding: '16px 32px', borderRadius: '30px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: '1px solid rgba(37, 211, 102, 0.4)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" style={{ width: '20px', height: '20px' }} /> WhatsApp support
            </a>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <Image src="/hero_devices.png" alt="High-Tech Devices" width={500} height={400} style={{ objectFit: 'contain', width: '100%', height: 'auto', dropShadow: '0 20px 40px rgba(0,0,0,0.5)' }} priority />
        </div>
      </div>

      {/* 2. Dynamic Deal of the Day Section */}
      <DealOfTheDay />

      {/* 3. Featured Products */}
      <div id="products" className="responsivePadding" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div style={{ height: '2px', width: '40px', background: 'var(--brand-accent)' }} />
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>FEATURED PRODUCTS</h2>
            <div style={{ height: '2px', width: '40px', background: 'var(--brand-accent)' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>Best deals for our customers</p>
        </div>

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <Link href={`/products/${p.slug}`} key={p.id} style={{ background: '#fdfbf7', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  {p.images && p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} width={180} height={220} style={{ objectFit: 'contain', maxHeight: '100%' }} unoptimized referrerPolicy="no-referrer" />
                  ) : (
                    <div style={{ width: '150px', height: '200px', background: '#eee', borderRadius: '8px' }} />
                  )}
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#160d0a', marginBottom: '8px', lineHeight: 1.3 }}>
                  {p.name}
                </h3>
                
                <div style={{ color: '#c87941', fontWeight: 800, fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {p.is_deal_of_the_day && p.deal_expires_at && new Date(p.deal_expires_at).getTime() > new Date().getTime() ? (
                    <>
                      <span>₹{p.deal_price?.toLocaleString('en-IN')} <span style={{fontSize: 10, background: '#c87941', color: '#fff', padding: '2px 4px', borderRadius: 4, marginLeft: 4}}>🔥 DEAL</span></span>
                      <span style={{ color: '#9aa3b2', textDecoration: 'line-through', fontSize: '12px' }}>₹{p.our_price?.toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    p.our_price ? `₹${p.our_price.toLocaleString('en-IN')}` : 'Price not set'
                  )}
                </div>
                
                <div style={{ color: '#5d4037', fontSize: '13px', marginBottom: '20px' }}>
                  Verified | 100% Authentic
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'block', textAlign: 'center', background: '#f4d3b6', color: '#160d0a', padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                    Buy Now
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 4. Trust Badges */}
      <div style={{ padding: '20px 40px' }}>
        <div style={{ background: '#3e2820', borderRadius: '16px', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ShieldCheck size={36} color="var(--brand-accent)" />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Verified B2B-only</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Verified for retailer only pricing</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Truck size={36} color="var(--brand-accent)" />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Nationwide Shipping</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Secure transit across India</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CreditCard size={36} color="var(--brand-accent)" />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Flexible Payments</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pay 50% advance, rest on delivery</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Award size={36} color="var(--brand-accent)" />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>100% Quality Authenticity</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Quality guaranteed on every unit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
