'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Smartphone, Truck, User, LogOut, LayoutGrid } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Header.module.css';
import { formatINR } from '@/lib/utils';

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data || []))
      .catch(() => {});
  }, []);

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
    <header className={styles.header} style={{ height: 'auto', paddingBottom: '12px' }}>
      {/* Row 1: Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" className={styles.logo} style={{ gap: '10px' }}>
          <div className={styles.logoIcon} style={{ width: '36px', height: '36px' }}>
            <Smartphone size={20} color="#0a1628" strokeWidth={2.5} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName} style={{ fontSize: '16px' }}>Only Gadjets</span>
            <span className={styles.logoTagline} style={{ fontSize: '10px' }}>Wholesale Dealer</span>
          </div>
        </Link>
      </div>

      {/* Row 2: Categories, Track, Login Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '10px 16px', 
        overflowX: 'auto', 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Fixed Options */}
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', background: user ? 'rgba(255,255,255,0.08)' : 'rgba(244, 167, 36, 0.15)', border: user ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(244, 167, 36, 0.3)' }}>
          <User size={16} /> {user ? (user.user_metadata?.name?.split(' ')[0] || 'Profile') : 'Login'}
        </Link>

        <Link href="/track" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#f4a724', whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Truck size={16} /> Track
        </Link>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Dynamic Categories */}
        <Link href="/" className={`${styles.categoryPill} ${!pathname?.includes('cat=') ? styles.categoryPillActive : ''}`} style={{ margin: 0 }}>
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id || cat.slug}
            href={`/?cat=${cat.slug}`}
            className={`${styles.categoryPill} ${pathname?.includes(`cat=${cat.slug}`) ? styles.categoryPillActive : ''}`}
            style={{ margin: 0 }}
          >
            {cat.icon && <span style={{ marginRight: '4px' }}>{cat.icon}</span>}
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Row 3: Search Bar */}
      <div style={{ padding: '10px 16px' }}>
        <div className={styles.searchBar} ref={searchRef} style={{ maxWidth: '600px', margin: '0 auto', height: '42px' }}>
          <input
            id="header-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search for phones, brands, accessories..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            autoComplete="off"
            style={{ fontSize: '15px' }}
          />
          <button className={styles.searchBtn} aria-label="Search" style={{ width: '50px' }}>
            <Search size={18} strokeWidth={2.5} />
          </button>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className={styles.searchDropdown} style={{ top: '42px', borderRadius: '12px', marginTop: '4px' }}>
              {isSearching ? (
                <div className={styles.searchEmpty}>Searching…</div>
              ) : results.length > 0 ? (
                results.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className={styles.searchResultItem}
                    onClick={() => { setShowDropdown(false); setQuery(''); }}
                  >
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className={styles.searchResultImg} referrerPolicy="no-referrer" />
                    ) : (
                      <div className={styles.searchResultImg} style={{ background: '#f0f2f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Smartphone size={18} color="#9aa3b2" />
                      </div>
                    )}
                    <div className={styles.searchResultInfo}>
                      <div className={styles.searchResultName}>{product.name}</div>
                      <div className={styles.searchResultPrice}>{formatINR(product.our_price)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.searchEmpty}>No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
