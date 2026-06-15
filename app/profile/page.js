'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { User, Package, LogOut, Smartphone, ExternalLink, IndianRupee } from 'lucide-react';
import { formatINR } from '@/lib/utils';

function ProfileContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'orders'; // Default to orders or profile

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch user and profile securely from API
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      if (!meData.user) {
        setLoading(false);
        return;
      }

      setUser(meData.user);
      setProfile(meData.user);

      // Fetch orders via API
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const cardStyle = {
    background: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)'
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '40px 16px', color: 'var(--text-primary)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
                {view === 'profile' ? 'My Profile' : 'My Orders'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {view === 'profile' ? 'Manage your personal details' : 'Track and manage your orders'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* SuperCoins Banner */}
          <div style={{ 
            background: 'var(--brand-primary)', 
            borderRadius: '24px', 
            padding: '32px', 
            marginBottom: '32px', 
            border: '1px solid rgba(244, 167, 36, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Atom Coins Balance</div>
              <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--brand-accent)' }}>🪙</span> {profile?.coins_balance || 0}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'var(--glass-bg)', color: 'var(--brand-accent)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: '1px solid var(--glass-border)' }}>
                ₹1000 Spent = 1 Coin
              </div>
            </div>
          </div>

          {view === 'profile' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Profile Info */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color="var(--brand-accent-dark)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{profile?.name || 'User'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user?.email}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                    <span style={{ fontWeight: '600' }}>{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Atom Coins</span>
                    <span style={{ fontWeight: '800', color: 'var(--brand-accent-dark)' }}>🪙 {profile?.coins_balance || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} color="var(--brand-accent-dark)" />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Orders Overview</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Orders</span>
                    <span style={{ fontWeight: '600' }}>{orders.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Active Shipments</span>
                    <span style={{ fontWeight: '600' }}>{orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Smartphone size={24} /> Recent Orders
              </h2>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
              ) : orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...cardStyle, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ background: 'var(--bg-page)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                          <Smartphone size={32} color="var(--text-muted)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{order.product_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            🪙 <strong style={{ color: 'var(--brand-accent-dark)' }}>Atom Coins</strong>
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '15px' }}>{formatINR(order.final_price)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                          <div style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            textTransform: 'uppercase',
                            background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(244, 167, 36, 0.1)',
                            color: order.status === 'delivered' ? '#22c55e' : 'var(--brand-accent-dark)'
                          }}>
                            {order.status}
                          </div>
                        </div>
                        <Link 
                          href={`/track/${order.id.slice(0, 8)}`}
                          style={{ padding: '10px', background: 'var(--bg-page)', borderRadius: '10px', color: 'var(--brand-accent-dark)', border: '1px solid var(--border)' }}
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 40px' }}>
                  <Package size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No orders yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>You haven&apos;t placed any orders yet. Start shopping to earn Atom coins!</p>
                  <Link href="/" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
                    Browse Products
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
