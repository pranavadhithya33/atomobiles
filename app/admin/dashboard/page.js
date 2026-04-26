'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Admin.module.css';
import { formatINR } from '@/lib/utils';
import {
  Smartphone, Package, ShoppingBag, Plus, Edit2, Trash2,
  LogOut, Check, X, RefreshCw, TrendingUp, Users, Star, MessageSquare, FileText
} from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';

const CATEGORIES = [
  { label: 'Smartphones', value: 'smartphones' },
  { label: 'Tablets', value: 'tablets' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Smartwatches', value: 'smartwatches' },
  { label: 'Audio', value: 'audio' },
  { label: 'Other', value: 'other' }
];

const EMPTY_PRODUCT = {
  name: '', images: [''], online_price: '', amazon_price: '', flipkart_price: '',
  amazon_url: '', flipkart_url: '', our_price: '',
  description: '', stock: 0, category: 'smartphones',
  featured: false, prepaid_discount_pct: 3,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Importer state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // Reviews moderation state
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('og_admin');
      if (!auth) router.replace('/admin/login');
    }
  }, [router]);

  // Fetch data
  const fetchProducts = () => {
    return fetch('/api/products').then(r => r.json()).then(setProducts);
  };
  const fetchOrders = () => {
    return fetch('/api/orders').then(r => r.json()).then(setOrders);
  };
  const fetchPendingReviews = () => {
    setReviewsLoading(true);
    return fetch('/api/reviews?status=pending')
      .then(r => r.json())
      .then(data => setPendingReviews(Array.isArray(data) ? data : []))
      .catch(() => setPendingReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchOrders(), fetchPendingReviews()]).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('og_admin');
    router.replace('/admin/login');
  };

  // Product Modal
  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || '',
      images: p.images?.length ? p.images : [''],
      online_price: p.online_price || '',
      amazon_price: p.amazon_price || '',
      flipkart_price: p.flipkart_price || '',
      amazon_url: p.amazon_url || '',
      flipkart_url: p.flipkart_url || '',
      our_price: p.our_price || '',
      description: p.description || '',
      stock: p.stock ?? 0,
      category: p.category || 'smartphones',
      featured: p.featured || false,
      prepaid_discount_pct: p.prepaid_discount_pct || 3,
    });
    setSaveError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); setSaveError(''); };

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageChange = (idx, value) => {
    const imgs = [...form.images];
    imgs[idx] = value;
    setForm(prev => ({ ...prev, images: imgs }));
  };

  const handleFileUpload = async (idx, file) => {
    if (!file) return;
    setUploadingImage(true);
    setSaveError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      handleImageChange(idx, data.url);
    } catch (err) {
      setSaveError('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };
  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (idx) => {
    if (form.images.length <= 1) return;
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveError('Product name is required'); return; }
    if (!form.our_price || isNaN(form.our_price)) { setSaveError('Our price is required'); return; }

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        ...form,
        images: form.images.filter(Boolean),
        online_price: Number(form.online_price) || 0,
        amazon_price: Number(form.amazon_price) || 0,
        flipkart_price: Number(form.flipkart_price) || 0,
        amazon_url: form.amazon_url || '',
        flipkart_url: form.flipkart_url || '',
        our_price: Number(form.our_price),
        stock: Number(form.stock) || 0,
        prepaid_discount_pct: Number(form.prepaid_discount_pct) || 3,
      };

      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      await fetchProducts();
      closeModal();
    } catch (err) {
      setSaveError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleToggleStock = async (p) => {
    const newStock = p.stock > 0 ? 0 : 10;
    try {
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      await fetchProducts();
    } catch {
      alert('Failed to update stock');
    }
  };

  const handleImport = async () => {
    if (!importUrl.trim() || !importUrl.includes('amazon')) {
      setImportMsg('⚠ Please enter a valid Amazon product URL');
      return;
    }
    setImporting(true);
    setImportMsg('⏳ Extracting product data from Amazon...');
    
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Import failed');
      
      setImportMsg(`✅ Successfully imported: ${data.product.name.slice(0, 30)}...`);
      setImportUrl('');
      await fetchProducts();
      
      setTimeout(() => setImportMsg(''), 4000);
    } catch (err) {
      setImportMsg(`❌ Import Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchOrders();
    } catch {
      alert('Failed to update order status');
    }
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.final_price || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const inStockCount = products.filter(p => p.stock > 0).length;

  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderTitle}>
          <Smartphone size={20} color="#f4a724" />
          Only <span>Gadjets</span> Admin
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={14} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
          Logout
        </button>
      </div>

      <div className={styles.adminBody}>
        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Products</div>
            <div className={styles.statValue}>{products.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>In Stock</div>
            <div className={styles.statValue} style={{ color:'var(--success)' }}>{inStockCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Orders</div>
            <div className={styles.statValue}>{orders.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pending Orders</div>
            <div className={styles.statValue} style={{ color:'var(--warning)' }}>{pendingOrders}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={15} /> Products
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={15} /> Orders ({orders.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('reviews'); fetchPendingReviews(); }}
          >
            <MessageSquare size={15} /> Reviews {pendingReviews.length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99, marginLeft: 4 }}>{pendingReviews.length}</span>}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Products</h2>
              <button onClick={openAdd} className={styles.addBtn} id="add-product-btn">
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Amazon Quick Importer */}
            <div style={{ background: 'var(--bg-highlight)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-focus)' }}>
              <div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} className={importing ? 'spin' : ''} />
                One-Click Auto-Upload from Amazon
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Paste any Amazon India product URL. We will automatically fetch the <b>Title, High-Res Images, Live Price, and Specs</b>, apply your 10% discount, and add it to your store.
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="url" 
                  className="form-input" 
                  style={{ flex: 1, minWidth: '200px' }} 
                  placeholder="Paste Amazon product URL here..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
                <button 
                  onClick={handleImport} 
                  disabled={importing}
                  className="btn btn-primary" 
                  style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}
                >
                  {importing ? 'Importing...' : 'Fetch & Add'}
                </button>
              </div>
              {importMsg && (
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: importMsg.includes('❌') || importMsg.includes('⚠') ? 'var(--error)' : 'var(--success)' }}>
                  {importMsg}
                </div>
              )}
            </div>

            {/* Bulk Refresh Button */}
            <button 
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border)' }}
              onClick={async () => {
                if (!confirm('This will refresh prices for all products in our master list. This may take several minutes. Proceed?')) return;
                setImporting(true);
                setImportMsg('⏳ Refreshing all products... please wait.');
                try {
                  const res = await fetch('/api/refresh-prices');
                  const data = await res.json();
                  setImportMsg(`✅ Refresh Complete! Updated: ${data.updated}, New: ${data.inserted}, Skipped: ${data.skipped}`);
                  fetchProducts();
                } catch (err) {
                  setImportMsg('❌ Refresh failed: ' + err.message);
                } finally {
                  setImporting(false);
                }
              }}
              disabled={importing}
            >
              <RefreshCw size={18} className={importing ? 'spin' : ''} />
              {importing ? 'Syncing Catalog...' : 'Manual Bulk Refresh (10-Day Sync)'}
            </button>

            {loading ? (
              <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>Loading…</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize:40, marginBottom:12 }}>📱</div>
                <p>No products yet. Click "Add Product" to get started.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Market Price</th>
                      <th>Our Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className={styles.productThumb} />
                          ) : (
                            <div className={styles.productThumbPlaceholder}>
                              <Smartphone size={18} color="#9aa3b2" />
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight:600, maxWidth:180 }}>
                          <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                          {p.featured && <span style={{ fontSize:10, background:'#fef3d0', color:'#d4890a', padding:'1px 6px', borderRadius:99, fontWeight:700 }}>Featured</span>}
                        </td>
                        <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{p.category || '—'}</td>
                        <td style={{ fontSize:13, color:'#9aa3b2', textDecoration:'line-through' }}>
                          {Math.max(p.amazon_price || 0, p.flipkart_price || 0, p.online_price || 0) > 0 
                            ? formatINR(Math.max(p.amazon_price || 0, p.flipkart_price || 0, p.online_price || 0)) 
                            : '—'}
                        </td>
                        <td style={{ fontWeight:700 }}>{formatINR(p.our_price)}</td>
                        <td>
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`${styles.stockToggle} ${p.stock > 0 ? styles.stockToggleIn : styles.stockToggleOut}`}
                          >
                            {p.stock > 0 ? <><Check size={11} /> In Stock</> : <><X size={11} /> Out</>}
                          </button>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => openEdit(p)} className={styles.editBtn}>
                              <Edit2 size={12} style={{ display:'inline', marginRight:3 }} /> Edit
                            </button>
                            <button onClick={() => handleDelete(p.id, p.name)} className={styles.deleteBtn}>
                              <Trash2 size={12} style={{ display:'inline', marginRight:3 }} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Orders</h2>
              <button onClick={() => fetchOrders()} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600 }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>Loading…</div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-muted)' }}>
                          #{o.id?.slice(0,8)?.toUpperCase()}
                        </td>
                        <td>
                          <div style={{ fontWeight:600, fontSize:14 }}>{o.full_name}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{o.phone}</div>
                        </td>
                        <td style={{ fontSize:13, maxWidth:150 }}>
                          <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.product_name}</div>
                        </td>
                        <td>
                          <span style={{
                            fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99,
                            background: o.payment_option === 'full_prepaid' ? 'var(--success-bg)' : 'var(--info-bg)',
                            color: o.payment_option === 'full_prepaid' ? 'var(--success)' : 'var(--info)',
                          }}>
                            {o.payment_option === 'full_prepaid' ? '✅ Prepaid' : '🚚 Half COD'}
                          </span>
                        </td>
                        <td style={{ fontWeight:700 }}>{formatINR(o.final_price)}</td>
                        <td>
                          <select 
                            value={o.status || 'pending'} 
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className={`${styles.orderStatus} ${
                              o.status === 'shipped' || o.status === 'delivered' ? styles.orderStatusConfirmed :
                              o.status === 'cancelled' ? styles.orderStatusCancelled :
                              o.status === 'delayed' ? styles.orderStatusDelayed :
                              styles.orderStatusPending
                            }`}
                            style={{ padding: '4px 24px 4px 10px', appearance: 'auto', cursor: 'pointer', border: '1px solid transparent' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delayed">Delayed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews Moderation Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Review Moderation</h2>
              <button onClick={fetchPendingReviews} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600 }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {reviewsLoading ? (
              <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>Loading…</div>
            ) : pendingReviews.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <p>No pending reviews. All caught up!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {pendingReviews.map(review => (
                  <div key={review.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>{review.user_name}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} fill={s <= review.rating ? '#facc15' : '#e5e7eb'} color={s <= review.rating ? '#facc15' : '#e5e7eb'} />
                          ))}
                          <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:6 }}>
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={async () => {
                            await fetch('/api/reviews', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: review.id, status: 'approved' })
                            });
                            fetchPendingReviews();
                          }}
                          style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 14px', background:'#16a34a', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={async () => {
                            await fetch('/api/reviews', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: review.id, status: 'rejected' })
                            });
                            fetchPendingReviews();
                          }}
                          style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 14px', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                    {review.comment && (
                      <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5, background:'#f8fafc', padding:'10px 12px', borderRadius:8, border:'1px solid #f1f5f9' }}>
                        "{review.comment}"
                      </div>
                    )}
                    {review.product_id && (
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
                        Product ID: {review.product_id.slice(0,8)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editProduct ? <><Edit2 size={18} /> Edit Product</> : <><Plus size={18} /> Add Product</>}
            </h2>

            <div className={styles.modalForm}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Samsung Galaxy A55 5G"
                  value={form.name} onChange={e => handleFormChange('name', e.target.value)} />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => handleFormChange('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Prices */}
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Our Price (₹) *</label>
                  <input type="number" className="form-input" placeholder="e.g. 21999"
                    value={form.our_price} onChange={e => handleFormChange('our_price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amazon Price (Fallback)</label>
                  <input type="number" className="form-input" placeholder="e.g. 25999"
                    value={form.amazon_price} onChange={e => handleFormChange('amazon_price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Flipkart Price (Fallback)</label>
                  <input type="number" className="form-input" placeholder="e.g. 24999"
                    value={form.flipkart_price} onChange={e => handleFormChange('flipkart_price', e.target.value)} />
                </div>
              </div>

              {/* Scraper URLs */}
              <div className={styles.formGrid}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Amazon URL (For live scraping)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="url" className="form-input" placeholder="https://amazon.in/dp/..."
                      value={form.amazon_url} onChange={e => handleFormChange('amazon_url', e.target.value)} />
                    <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }} 
                      onClick={async () => {
                        if (!form.amazon_url) return alert('Enter URL first');
                        setImporting(true);
                        try {
                          const res = await fetch('/api/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: form.amazon_url, category: form.category })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);
                          // Update form with fetched data
                          setForm(prev => ({
                            ...prev,
                            name: data.product.name,
                            amazon_price: data.product.amazon_price,
                            online_price: data.product.amazon_price,
                            our_price: data.product.our_price,
                            description: data.product.description,
                            images: data.product.images?.length ? data.product.images : prev.images,
                            stock: data.product.stock
                          }));
                          alert('Data fetched successfully!');
                        } catch (err) { alert('Fetch failed: ' + err.message); }
                        finally { setImporting(false); }
                      }}
                      disabled={importing}
                    >
                      {importing ? '...' : 'Fetch'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Flipkart URL (For live scraping)</label>
                  <input type="url" className="form-input" placeholder="https://flipkart.com/..."
                    value={form.flipkart_url} onChange={e => handleFormChange('flipkart_url', e.target.value)} />
                </div>
              </div>

              {/* Stock + Prepaid Discount */}
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" min="0" placeholder="0"
                    value={form.stock} onChange={e => handleFormChange('stock', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prepaid Discount %</label>
                  <input type="number" className="form-input" min="0" max="20" placeholder="3"
                    value={form.prepaid_discount_pct} onChange={e => handleFormChange('prepaid_discount_pct', e.target.value)} />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className={styles.formTextarea} placeholder="Product specs, features, etc."
                  value={form.description} onChange={e => handleFormChange('description', e.target.value)} />
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="form-label">Product Images</label>
                <div className={styles.imageUrlList}>
                  {form.images.map((img, idx) => (
                    <div key={idx} className={styles.imageUrlRow} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {img ? (
                        <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
                          <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: 60, height: 60, borderRadius: 8, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, color: '#999' }}>No Img</span>
                        </div>
                      )}
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <input type="file" accept="image/*" disabled={uploadingImage}
                          onChange={e => handleFileUpload(idx, e.target.files[0])}
                          style={{ fontSize: 13 }} />
                        {img && <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: 12 }} readOnly value={img} />}
                      </div>

                      <button type="button" className={styles.removeImgBtn} disabled={uploadingImage}
                        onClick={() => removeImageField(idx)} aria-label="Remove image">×</button>
                    </div>
                  ))}
                  <button type="button" className={styles.addImgBtn} onClick={addImageField} disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : '+ Add Another Image'}
                  </button>
                </div>
              </div>

              {/* Featured */}
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:500, color:'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.featured}
                  onChange={e => handleFormChange('featured', e.target.checked)}
                  style={{ width:16, height:16, accentColor:'var(--brand-accent)' }} />
                Mark as Featured product
              </label>

              {saveError && <div className="notice notice-error">⚠ {saveError}</div>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelBtn} onClick={closeModal}>Cancel</button>
                <button type="button" className={styles.modalSaveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : editProduct ? '✓ Save Changes' : '+ Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
