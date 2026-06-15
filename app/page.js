'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Award, Zap } from 'lucide-react';

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
      <div style={{
        background: 'radial-gradient(circle at 70% 50%, #4a2c1d 0%, var(--bg-page) 70%)',
        padding: '80px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '40px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '1px' }}>
            ATOMOBILES
          </h1>
          <h2 style={{ fontSize: '24px', color: 'var(--brand-accent)', fontWeight: 500, marginBottom: '40px', letterSpacing: '1px' }}>
            HIGH-TECH WHOLESALE DISTRIBUTION
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Verified B2B-only Pricing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Nationwide Express Shipping
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Flexible Bulk Payment Plans
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3e3d3', fontSize: '16px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> 100% Quality Authenticated
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="#products" style={{ background: 'var(--brand-accent)', color: '#160d0a', padding: '16px 32px', borderRadius: '30px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Zap size={20} fill="#160d0a" /> Shop Now
            </Link>
            <a href="https://wa.me/917397189222" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#fff', padding: '16px 32px', borderRadius: '30px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: '1px solid rgba(37, 211, 102, 0.4)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" style={{ width: '20px', height: '20px' }} /> WhatsApp support
            </a>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <Image src="/hero_devices.png" alt="High-Tech Devices" width={500} height={400} style={{ objectFit: 'contain', width: '100%', height: 'auto', dropShadow: '0 20px 40px rgba(0,0,0,0.5)' }} priority />
        </div>
      </div>

      {/* 2. Deal of the Day Section */}
      <div style={{ padding: '60px 40px 20px' }}>
        <div style={{ background: '#241710', borderRadius: '24px', padding: '40px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: '1 1 300px', background: '#fdfbf7', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'center' }}>
            <Image src="/multi_charger.png" alt="Server-rack-grade high-capacity multi-charger" width={300} height={200} style={{ objectFit: 'contain' }} />
          </div>
          
          <div style={{ flex: '2 1 400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ color: 'var(--brand-accent)', fontWeight: 800, fontSize: '18px', letterSpacing: '1px', marginBottom: '8px' }}>DEAL OF THE DAY</div>
              <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>Server-rack-grade high-capacity<br/>multi-charger</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>A server-rack-grade high-capacity multi-charger.</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
                <span style={{ color: '#fff', fontSize: '40px', fontWeight: 900 }}>₹14,500</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>per unit</span>
              </div>
              
              <button style={{ background: 'var(--brand-accent-light)', color: '#160d0a', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
                BUY NOW - BULK DEAL
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Deal of the Day - Ends In:</div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>02</div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Days</span>
                </div>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>03</div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Hours</span>
                </div>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>40</div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Minutes</span>
                </div>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>42</div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Seconds</span>
                </div>
              </div>
              <button style={{ background: 'transparent', border: '1px solid var(--brand-accent-light)', color: 'var(--brand-accent-light)', padding: '14px 40px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                BUY NOW - BULK DEAL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Bulk Deals */}
      <div id="products" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div style={{ height: '2px', width: '40px', background: 'var(--brand-accent)' }} />
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>FEATURED BULK DEALS</h2>
            <div style={{ height: '2px', width: '40px', background: 'var(--brand-accent)' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>Best deals for businesses & bulk buyers</p>
        </div>

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {products.slice(0, 8).map(p => (
              <div key={p.id} style={{ background: '#fdfbf7', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  {p.images && p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} width={180} height={220} style={{ objectFit: 'contain', maxHeight: '100%' }} />
                  ) : (
                    <div style={{ width: '150px', height: '200px', background: '#eee', borderRadius: '8px' }} />
                  )}
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#160d0a', marginBottom: '8px', lineHeight: 1.3 }}>
                  {p.name} Bulk
                </h3>
                
                <div style={{ color: '#c87941', fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>
                  From ₹41,250/month, min. 10 pcs
                </div>
                
                <div style={{ color: '#5d4037', fontSize: '13px', marginBottom: '20px' }}>
                  Verified | 100% Authentic
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                  <Link href={`/products/${p.slug}`} style={{ display: 'block', textAlign: 'center', background: '#f4d3b6', color: '#160d0a', padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                    Request Bulk Quote
                  </Link>
                </div>
              </div>
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
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Flexible Bulk Payments</div>
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
