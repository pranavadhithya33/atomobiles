'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DealOfTheDay() {
  const [deal, setDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const checkActive = (expiresAt) => {
    if (!expiresAt) return;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    setIsActive(now < expiry);
  };

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
      <div className="deal-card-wrap">
        <div className="deal-image-wrap">
          <Image 
            src={deal.images && deal.images.length > 0 ? deal.images[0] : '/multi_charger.png'} 
            alt={deal.name} 
            width={300} 
            height={200} 
            style={{ objectFit: 'contain' }} 
          />
        </div>
        
        <div className="deal-info-wrap">
          <div className="deal-subtitle">DEAL OF THE DAY</div>
          <h3 className="deal-title">{deal.name}</h3>
          <p className="deal-desc">{deal.description ? (deal.description.length > 60 ? deal.description.substring(0, 60) + '...' : deal.description) : 'A special offer just for you.'}</p>
          
          <div className="deal-price-wrap">
            <span className="deal-price-our">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deal.deal_price)}
            </span>
            <span className="deal-price-original">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deal.our_price)}
            </span>
          </div>
          
          <button 
            onClick={() => router.push(`/products/${deal.slug}`)} 
            className="deal-buy-btn"
          >
            BUY NOW
          </button>
        </div>

        <div className="deal-timer-container">
            <div style={{ color: 'var(--text-white)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Deal of the Day - Ends In:</div>
            <div className="deal-timer-wrap">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="deal-timer-box">
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <span style={{ color: '#a69385', fontSize: '12px', marginTop: '8px' }}>Days</span>
              </div>
              <span style={{ color: 'var(--text-white)', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="deal-timer-box">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span style={{ color: '#a69385', fontSize: '12px', marginTop: '8px' }}>Hours</span>
              </div>
              <span style={{ color: 'var(--text-white)', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="deal-timer-box">
                  {timeLeft.mins.toString().padStart(2, '0')}
                </div>
                <span style={{ color: '#a69385', fontSize: '12px', marginTop: '8px' }}>Mins</span>
              </div>
              <span style={{ color: 'var(--text-white)', fontSize: '24px', fontWeight: 700, margin: '0 4px', paddingBottom: '20px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="deal-timer-box" style={{ color: 'var(--brand-accent)' }}>
                  {timeLeft.secs.toString().padStart(2, '0')}
                </div>
                <span style={{ color: '#a69385', fontSize: '12px', marginTop: '8px' }}>Secs</span>
              </div>
            </div>
            <div style={{ color: 'var(--text-white)', fontSize: '14px', background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--brand-accent)' }}>✓</span> Exclusive offer online
            </div>
          </div>
        </div>
      </div>
  );
}
