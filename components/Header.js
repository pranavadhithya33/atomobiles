'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Smartphone, MessageCircle } from 'lucide-react';
import styles from '@/styles/Header.module.css';
import { formatINR } from '@/lib/utils';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917397189222';

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const pathname = usePathname();

  // Fetch categories for nav bar
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data || []))
      .catch(() => {});
  }, []);

  // Search handler with debounce
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I have a query about your products.')}`;

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.topBar} ${styles.headerWithDropdown}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Smartphone size={18} color="#0a1628" strokeWidth={2.5} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>Only Gadjets</span>
            <span className={styles.logoTagline}>Wholesale Dealer</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className={styles.searchBar} ref={searchRef}>
          <input
            id="header-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search phones, brands..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            autoComplete="off"
          />
          <button className={styles.searchBtn} aria-label="Search">
            <Search size={17} strokeWidth={2.5} />
          </button>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className={styles.searchDropdown}>
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
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className={styles.searchResultImg}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.searchResultImg} style={{ background: '#f0f2f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Smartphone size={20} color="#9aa3b2" />
                      </div>
                    )}
                    <div className={styles.searchResultInfo}>
                      <div className={styles.searchResultName}>{product.name}</div>
                      <div className={styles.searchResultPrice}>
                        {formatINR(product.our_price)}
                        {product.online_price > product.our_price && (
                          <span style={{ textDecoration: 'line-through', marginLeft: 6, color: '#aab' }}>
                            {formatINR(product.online_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.searchEmpty}>No products found for "{query}"</div>
              )}
            </div>
          )}
        </div>

        {/* WhatsApp CTA */}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.waBtn} aria-label="Chat on WhatsApp">
          <MessageCircle size={17} strokeWidth={2.5} />
          <span className={styles.waText}>Chat</span>
        </a>
      </div>

      {/* Category Nav Bar */}
      {categories.length > 0 && (
        <nav className={styles.navBar} aria-label="Product categories">
          <Link href="/" className={styles.navLink}>All</Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/?category=${cat.slug}`} className={styles.navLink}>
              {cat.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
