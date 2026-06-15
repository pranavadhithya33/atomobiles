'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, User, CheckCircle } from 'lucide-react';

export default function ReviewsSection({ productId, onStatsChange }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [form, setForm] = useState({ user_name: '', rating: 5, comment: '', selected_product_id: '', product_search_query: '' });

  useEffect(() => {
    // Check for auto-open link on mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isReview = urlParams.get('review') === 'true' || window.location.hash === '#review';
      if (isReview) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowForm(true);
        
        const scrollToReviews = () => {
          const el = document.getElementById('reviews-section');
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80; // Account for header
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        };

        setTimeout(scrollToReviews, 300);
        setTimeout(scrollToReviews, 1200); // Fallback for slower devices/image loads
      }
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setReviews(data);
        if (onStatsChange && data.length > 0) {
          const avg = (data.reduce((acc, r) => acc + r.rating, 0) / data.length).toFixed(1);
          onStatsChange({ avg, count: data.length });
        } else if (onStatsChange) {
          onStatsChange({ avg: 0, count: 0 });
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
    if (productId === 'store') {
      fetch('/api/products')
        .then(r => r.json())
        .then(data => setStoreProducts(data))
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_name.trim()) return alert('Please enter your name');
    setSubmitting(true);
    
    try {
      const payload_product_id = productId === 'store' 
        ? (form.selected_product_id || 'store') 
        : productId;
        
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: payload_product_id, ...form })
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      
      setForm({ user_name: '', rating: 5, comment: '', selected_product_id: '', product_search_query: '' });
      setShowForm(false);
      setSubmitSuccess(true);
      // Don't refetch — the new review won't appear until admin approves it
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>Loading reviews...</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div id="reviews-section" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Ratings & Reviews</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', background: '#16a34a', color: 'var(--text-primary)', 
              padding: '4px 10px', borderRadius: '16px', fontWeight: '700', fontSize: '15px' 
            }}>
              {averageRating} <Star size={14} fill="currentColor" />
            </div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
              {reviews.length} Ratings & Reviews
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            background: 'var(--bg-card)', color: '#2874f0', border: '1px solid var(--border)', padding: '8px 16px', 
            borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          Rate Product
        </button>
      </div>

      {submitSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#065f46' }}>Review submitted!</div>
            <div style={{ fontSize: '12px', color: '#047857' }}>Your review will be visible after admin approval.</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Write a Review</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Rating</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  type="button" 
                  key={star}
                  onClick={() => setForm({...form, rating: star})}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: star <= form.rating ? '#facc15' : '#d1d5db' }}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Your Name</label>
            <input 
              type="text" 
              required
              value={form.user_name}
              onChange={e => setForm({...form, user_name: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Detailed Review (Optional)</label>
            <textarea 
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }}
              placeholder="What did you like or dislike?"
            />
          </div>

          {productId === 'store' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Which product did you buy? (Optional)</label>
              <input 
                list="store-products-list"
                placeholder="-- Type to search or select a product --"
                value={form.product_search_query || ''}
                onChange={e => {
                  const val = e.target.value;
                  const p = storeProducts.find(prod => prod.name === val);
                  setForm({
                    ...form, 
                    product_search_query: val,
                    selected_product_id: p ? p.id : ''
                  });
                }}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'var(--bg-card)' }}
              />
              <datalist id="store-products-list">
                {storeProducts.map(p => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#4b5563', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ padding: '8px 24px', background: '#fb641b', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      <div>
        {reviews.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280' }}>
            <MessageSquare size={32} style={{ opacity: 0.5, margin: '0 auto 12px' }} />
            <div>No reviews yet. Be the first to review this product!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    background: review.rating >= 3 ? '#16a34a' : '#ef4444', 
                    color: 'var(--text-primary)', fontSize: '12px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}>
                    {review.rating} <Star size={10} fill="currentColor" />
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                    {review.rating === 5 ? 'Excellent!' : review.rating === 4 ? 'Very Good' : review.rating === 3 ? 'Good' : 'Poor'}
                  </span>
                </div>
                
                {review.comment && (
                  <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px', lineHeight: '1.5' }}>
                    {review.comment}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#878787' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#4b5563' }}>{review.user_name}</span>
                    {review.products?.name ? (
                      <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                        Bought: {review.products.name}
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#878787' }}>
                        <CheckCircle size={12} color="#878787" /> Certified Buyer
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>{new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#878787', cursor: 'pointer' }}>
                      <ThumbsUp size={14} /> <span style={{ fontSize: '12px' }}>Helpful</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
