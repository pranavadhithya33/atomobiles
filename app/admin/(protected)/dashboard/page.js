"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import styles from './page.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
    fetchProducts();
  }, []);

  const stats = [
    { label: 'Total Orders', value: '1,234', change: '+12%', up: true },
    { label: 'Revenue', value: '₹2.4Cr', change: '+8%', up: true },
    { label: 'Pending', value: '45', change: '-3%', up: false },
    { label: 'Dealers', value: '9', change: '+2', up: true },
  ];

  const orders = [
    { id: 'ATB-001', customer: 'Rahul K.', items: 'iPhone 16 Pro Max x2', total: 299800, status: 'shipped', date: '20 Jun 2026' },
    { id: 'ATB-002', customer: 'Priya S.', items: 'Galaxy S24 Ultra x1', total: 129999, status: 'pending', date: '20 Jun 2026' },
    { id: 'ATB-003', customer: 'Karthik M.', items: 'OnePlus 12 x3', total: 194997, status: 'delivered', date: '19 Jun 2026' },
    { id: 'ATB-004', customer: 'Anitha R.', items: 'iPhone 15 x5', total: 399500, status: 'confirmed', date: '19 Jun 2026' },
    { id: 'ATB-005', customer: 'Vijay P.', items: 'Pixel 8 Pro x2', total: 199998, status: 'shipped', date: '18 Jun 2026' },
  ];

  const getStatusStyle = (status) => {
    const map = {
      pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
      confirmed: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
      shipped: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
      delivered: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>ATOMOBILES</Link>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {[
            { id: 'orders', label: 'Orders', icon: '📦' },
            { id: 'products', label: 'Products', icon: '📱' },
            { id: 'dealers', label: 'Dealers', icon: '🤝' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙' },
          ].map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarLink}>← Back to Store</Link>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <div className={styles.topActions}>
            <span className={styles.adminBadge}>Admin</span>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={`${styles.statChange} ${stat.up ? styles.up : styles.down}`}>
                {stat.up ? '↑' : '↓'} {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Content Based on Tab */}
        {activeTab === 'orders' && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Recent Orders</h2>
              <button className="btn btn-ghost">View All</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr key={order.id}>
                        <td className={styles.orderId}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.items}</td>
                        <td className={styles.orderTotal}>₹{order.total.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={styles.status} style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td className={styles.orderDate}>{order.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Products Inventory</h2>
              <button className="btn btn-primary">Add Product</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className={styles.orderId}>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>{product.category}</td>
                      <td className={styles.orderTotal}>₹{product.price?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={styles.status} style={{
                          background: product.stock > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: product.stock > 0 ? '#10b981' : '#ef4444',
                          border: `1px solid ${product.stock > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                          {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
