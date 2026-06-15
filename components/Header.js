'use client';
// Header redesign v5 - SuperCoins & Orders Update - 2026-04-26-1758

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Smartphone, Truck, User, LogOut, LayoutGrid, ShoppingCart, Coins } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Header.module.css';
import { formatINR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const { cartCount } = useCart();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null);
        if (data.user) {
          setCoins(data.user.coins_balance || 0);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCoins(0);
    window.location.href = '/';
  };
  const handleSearch = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(val)}&limit=6`);
        const data = await res.json();
        setResults(data || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'var(--bg-header)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, gap: '24px', flexWrap: 'wrap' }}>
      {/* Left: Logo */}
      <Link href="/" className={styles.logo} style={{ gap: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div className={styles.logoIcon} style={{ width: '40px', height: '40px', background: 'rgba(232, 164, 104, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={24} color="var(--brand-accent)" strokeWidth={2} />
        </div>
        <div className={styles.logoText} style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.logoName} style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '0.5px' }}>ATOMOBILES</span>
          <span className={styles.logoTagline} style={{ fontSize: '10px', color: 'var(--brand-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Wholesale Dealer</span>
        </div>
      </Link>

      {/* Center: Search Bar */}
      <div style={{ flex: '1 1 300px', maxWidth: '600px', position: 'relative' }} ref={searchRef}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <input
            id="header-search"
            type="text"
            placeholder="Search for phones, brands..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '12px 16px', outline: 'none', fontSize: '14px' }}
          />
          <button onClick={() => handleSearch(query)} style={{ background: 'var(--brand-accent)', border: 'none', padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} color="#160d0a" />
          </button>
        </div>
        
        {showDropdown && (
          <div className={styles.searchDropdown} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-page)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '8px', zIndex: 10, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            {isSearching ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching…</div>
            ) : results.length > 0 ? (
              results.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => { setShowDropdown(false); setQuery(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} width={40} height={40} style={{ objectFit: 'contain', background: '#fff', borderRadius: '4px' }} referrerPolicy="no-referrer" />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={18} color="var(--brand-accent)" />
                    </div>
                  )}
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{product.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatINR(product.our_price)}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <User size={18} color="#fff" />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Account</span>
            </Link>
            <Link href="/profile" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-accent)', overflow: 'hidden', display: 'flex' }}>
               <img src={`https://ui-avatars.com/api/?name=${user.email || 'User'}&background=c87941&color=fff`} style={{ width: '100%', height: '100%' }} alt="User" />
            </Link>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
              <LogOut size={14} color="#fff" />
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <User size={18} color="#fff" />
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Account</span>
          </Link>
        )}

        <Link href="/track" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Truck size={18} color="#fff" />
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Track</span>
        </Link>

        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px' }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Account settings</span>
        </Link>

        <Link href="/profile?view=orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <LayoutGrid size={18} color="#fff" />
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Bulk Orders</span>
        </Link>

        <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: 'var(--brand-accent)', padding: '10px 16px', borderRadius: '6px' }}>
          <ShoppingCart size={16} color="#160d0a" strokeWidth={2.5} />
          <span style={{ color: '#160d0a', fontSize: '15px', fontWeight: 700 }}>Checkout</span>
          {cartCount > 0 && <span style={{ marginLeft: '4px', background: '#160d0a', color: 'var(--brand-accent)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}
