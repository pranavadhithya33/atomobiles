'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DealOfTheDay() {
  const [deal, setDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/deal')
      .then(res => res.json())
      .then(data => {
        if (data.deal) {
          setDeal(data.deal);
          checkActive(data.deal.deal_expires_at);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const checkActive = (expiresAt) => {
    if (!expiresAt) return;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    setIsActive(now < expiry);
  };

  useEffect(() => {
    if (!deal || !deal.deal_expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(deal.deal_expires_at).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsActive(false);
      } else {
        setIsActive(true);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal]);

  if (!isActive || !deal) return null;

  return (
    <div className="responsivePadding" style={{ padding: '60px 40px 20px' }}>
      <div style={{ background: '#241710', borderRadius: '24px', padding: '40px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ flex: '1 1 300px', background: '#fdfbf7', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <Image 
            src={deal.images && deal.images.length > 0 ? deal.images[0] : '/multi_charger.png'} 
            alt={deal.name} 
            width={300} 
            height={200} 
            style={{ objectFit: 'contain' }} 
          />
        </div>
        
        <div style={{ flex: '2 1 400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ color: 'var(--brand-accent)', fontWeight: 800, fontSize: '18px', letterSpacing: '1px', marginBottom: '8px' }}>DEAL OF THE DAY</div>
            <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>{deal.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>{deal.description ? (deal.description.length > 60 ? deal.description.substring(0, 60) + '...' : deal.description) : 'A special offer just for you.'}</p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
              <span style={{ color: '#fff', fontSize: '40px', fontWeight: 900 }}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deal.deal_price)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '16px', textDecoration: 'line-through' }}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deal.our_price)}
              </span>
            </div>
            
            <button 
              onClick={() => router.push(`/products/${deal.slug}`)} 
              style={{ background: 'var(--brand-accent-light)', color: '#160d0a', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
            >
              BUY NOW
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Deal of the Day - Ends In:</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Days</span>
              </div>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Hours</span>
              </div>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                  {timeLeft.mins.toString().padStart(2, '0')}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Mins</span>
              </div>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#1a100c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-accent)', fontSize: '24px', fontWeight: 700 }}>
                  {timeLeft.secs.toString().padStart(2, '0')}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Secs</span>
              </div>
            </div>
            <div style={{ color: '#f3e3d3', fontSize: '14px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Exclusive offer online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
