'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { User, Package, LogOut, Smartphone, ExternalLink, IndianRupee } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setProfile(profileData);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const cardStyle = {
    background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '24px', marginBottom: '24px'
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '40px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>My Account</h1>
              <p style={{ color: '#9aa3b2', fontSize: '14px' }}>Manage your profile and track orders</p>
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
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '24px', 
            padding: '32px', 
            marginBottom: '32px', 
            border: '1px solid rgba(244, 167, 36, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your SuperCoins Balance</div>
              <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#f4a724' }}>🪙</span> {profile?.coins_balance || 0}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'rgba(244, 167, 36, 0.1)', color: '#f4a724', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(244, 167, 36, 0.2)' }}>
                ₹100 Spent = 10 Coins
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Profile Info */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(244, 167, 36, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="#f4a724" />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{profile?.name || 'User'}</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>{user?.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9aa3b2' }}>Phone</span>
                  <span style={{ fontWeight: '600' }}>{profile?.phone || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9aa3b2' }}>OG Coins</span>
                  <span style={{ fontWeight: '800', color: '#f4a724' }}>🪙 {profile?.coins_balance || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} color="#60a5fa" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Orders Overview</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9aa3b2' }}>Total Orders</span>
                  <span style={{ fontWeight: '600' }}>{orders.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9aa3b2' }}>Active Shipments</span>
                  <span style={{ fontWeight: '600' }}>{orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length}</span>
                </div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '900', marginTop: '40px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Smartphone size={24} /> Recent Orders
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
          ) : orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div key={order.id} style={{ ...cardStyle, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: '#1a1a2e', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2d2d3f' }}>
                      <Smartphone size={32} color="#9aa3b2" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{order.product_name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#9aa3b2', marginBottom: '4px' }}>Amount</div>
                      <div style={{ fontWeight: '800', fontSize: '15px' }}>{formatINR(order.final_price)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#9aa3b2', marginBottom: '4px' }}>Status</div>
                      <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        textTransform: 'uppercase',
                        background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(244, 167, 36, 0.1)',
                        color: order.status === 'delivered' ? '#22c55e' : '#f4a724'
                      }}>
                        {order.status}
                      </div>
                    </div>
                    <Link 
                      href={`/track/${order.id.slice(0, 8)}`}
                      style={{ padding: '10px', background: '#1a1a2e', borderRadius: '10px', color: '#f4a724', border: '1px solid #2d2d3f' }}
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 40px' }}>
              <Package size={48} color="#2d2d3f" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No orders yet</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>You haven't placed any orders yet. Start shopping to earn OG coins!</p>
              <Link href="/" style={{ padding: '12px 24px', background: '#f4a724', color: '#000', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
