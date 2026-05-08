'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import PaymentSelector from '@/components/PaymentSelector';
import LivePriceDisplay from '@/components/LivePriceDisplay';
import ReviewsSection from '@/components/ReviewsSection';
import { formatINR, calcDiscountPct, calcSavings, calcPaymentDetails } from '@/lib/utils';
import styles from '@/styles/ProductDetail.module.css';
import { ChevronRight, CheckCircle, AlertCircle, Clock, ShoppingBag, MessageCircle, Package, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const WHATSAPP_NUMBER = '917397189222';

function StockBadge({ stock }) {
  if (stock === 0) return <span className={`${styles.stockBadge} ${styles.stockOut}`}><AlertCircle size={12} /> Out of Stock</span>;
  if (stock <= 5) return <span className={`${styles.stockBadge} ${styles.stockLow}`}><Clock size={12} /> Only {stock} left</span>;
  return <span className={`${styles.stockBadge} ${styles.stockIn}`}><CheckCircle size={12} /> In Stock</span>;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentOption, setPaymentOption] = useState('half_cod');
  const [dynamicOurPrice, setDynamicOurPrice] = useState(0);
  const [dynamicStock, setDynamicStock] = useState(true);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  // Variant state
  const [variants, setVariants] = useState([]);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      })
      .then(data => {
        setProduct(data);
        setDynamicOurPrice(data.our_price);
        setDynamicStock(data.stock > 0);
        setLoading(false);
        // Fetch variants for this product
        return fetch(`/api/products/${data.id}/variants`);
      })
      .then(r => r.json())
      .then(v => { if (Array.isArray(v)) setVariants(v); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [slug]);

  // Derived variant data
  const hasVariants = variants.length > 0;

  // Unique sorted storage options that have at least one enabled variant
  const storageOptions = hasVariants
    ? [...new Set(variants.map(v => v.storage))].sort((a, b) => a - b)
    : [];

  // RAM options available for the currently selected storage (or all unique RAMs)
  const ramOptions = hasVariants
    ? [...new Set(
        variants
          .filter(v => selectedStorage == null || v.storage === selectedStorage)
          .map(v => v.ram)
      )].sort((a, b) => a - b)
    : [];

  // Is a specific RAM available for the selected storage?
  const isRamAvailable = (ram) =>
    variants.some(v => v.storage === selectedStorage && v.ram === ram);

  // Handle chip clicks
  const handleStorageClick = (storage) => {
    setSelectedStorage(storage);
    // If current RAM is not available for new storage, clear it
    const available = variants.some(v => v.storage === storage && v.ram === selectedRam);
    if (!available) setSelectedRam(null);
  };

  const handleRamClick = (ram) => {
    setSelectedRam(ram);
  };

  // When both are selected, update price
  useEffect(() => {
    if (!hasVariants) return;
    if (selectedStorage != null && selectedRam != null) {
      const match = variants.find(v => v.storage === selectedStorage && v.ram === selectedRam);
      if (match) setDynamicOurPrice(Number(match.price));
    } else if (hasVariants) {
      // Show lowest variant price as "starting from"
      const lowest = Math.min(...variants.map(v => Number(v.price)));
      setDynamicOurPrice(lowest);
    }
  }, [selectedStorage, selectedRam, variants, hasVariants]);

  if (loading) return (
    <div className={styles.detailPage}>
      {[200, 400, 80, 120, 60].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />
      ))}
    </div>
  );

  if (error || !product) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Product not found</h2>
      <p style={{ color: '#9aa3b2', marginBottom: 20 }}>This product may have been removed or the link is incorrect.</p>
      <Link href="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );

  const discountPct = calcDiscountPct(product.online_price, product.our_price);
  const savings = calcSavings(product.online_price, product.our_price);
  const { finalPrice, advance: advanceAmount } = calcPaymentDetails(dynamicOurPrice, paymentOption);
  const inStock = dynamicStock;

  // WhatsApp message
  let paymentText = '';
  if (paymentOption === 'full_prepaid') {
    paymentText = `Full Prepaid | Final Price: ₹${finalPrice}`;
  } else if (paymentOption === 'token_advance') {
    paymentText = `30% Token Advance | Advance: ₹${advanceAmount} | Remaining: ₹${finalPrice - advanceAmount}`;
  } else {
    paymentText = `Half COD | Advance: ₹${advanceAmount} | Remaining: ₹${finalPrice - advanceAmount}`;
  }

  const waMsg = `🛒 *Order Enquiry - ONLY GADJETS*\n\n📦 *Product:* ${product.name}\n💳 *Payment:* ${paymentText}\n💰 *Total:* ₹${finalPrice}\n\nPlease confirm availability.`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  const handleBuyNow = () => {
    if (!inStock) return;
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      paymentOption,
      basePrice: dynamicOurPrice,
      finalPrice,
      ...(advanceAmount && { advanceAmount }),
    });
    router.push(`/order?${params.toString()}`);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, 1, paymentOption);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className={styles.detailPage}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <ChevronRight size={14} className={styles.breadcrumbSep} />
        {product.category && (
          <>
            <Link href={`/?cat=${product.category}`} className={styles.breadcrumbLink}>
              {product.category}
            </Link>
            <ChevronRight size={14} className={styles.breadcrumbSep} />
          </>
        )}
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Gallery */}
      <ProductGallery images={product.images} name={product.name} />

      {/* Info Card */}
      <div className={styles.infoSection}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            {product.category && <div className={styles.productCategory}>{product.category}</div>}
            <h1 className={styles.productName} style={{ marginBottom: '8px' }}>{product.name}</h1>
            {reviewStats.count > 0 ? (
              <a href="#reviews-section" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
                {reviewStats.avg} ★ <span style={{ fontSize: '11px', opacity: 0.85 }}>({reviewStats.count})</span>
              </a>
            ) : (
              <a href="#reviews-section" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#9aa3b2', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
                No reviews yet
              </a>
            )}
          </div>
          {discountPct > 0 && (
            <span className={styles.discountBadgeLarge}>{discountPct}% OFF</span>
          )}
        </div>

        <div style={{ margin:'12px 0' }}>
          <StockBadge stock={product.stock} />
        </div>

        {/* Variant Selector — only shown when variants exist */}
        {hasVariants && (
          <div className={styles.variantSection} style={{ boxShadow: 'none', padding: '0', marginTop: '4px' }}>
            {/* Storage row */}
            <div className={styles.variantRow}>
              <div className={styles.variantLabel}>Storage</div>
              <div className={styles.variantChips}>
                {storageOptions.map(storage => (
                  <button
                    key={storage}
                    className={`${styles.chip} ${selectedStorage === storage ? styles.chipActive : ''}`}
                    onClick={() => handleStorageClick(storage)}
                    id={`storage-chip-${storage}`}
                  >
                    {storage}GB
                  </button>
                ))}
              </div>
            </div>

            {/* RAM row */}
            <div className={styles.variantRow}>
              <div className={styles.variantLabel}>RAM</div>
              <div className={styles.variantChips}>
                {ramOptions.map(ram => {
                  const available = selectedStorage == null ? true : isRamAvailable(ram);
                  return (
                    <button
                      key={ram}
                      className={`${styles.chip} ${selectedRam === ram ? styles.chipActive : ''} ${!available ? styles.chipDisabled : ''}`}
                      onClick={() => available && handleRamClick(ram)}
                      id={`ram-chip-${ram}`}
                    >
                      {ram}GB
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price feedback */}
            {selectedStorage != null && selectedRam != null ? (
              <div className={styles.variantSelectedPrice}>
                <span className={styles.variantSelectedLabel}>
                  {selectedRam}GB RAM · {selectedStorage}GB Storage
                </span>
                <span className={styles.variantSelectedValue}>{formatINR(dynamicOurPrice)}</span>
              </div>
            ) : (
              <div className={styles.variantPriceHint}>
                Starting from {formatINR(dynamicOurPrice)} · Select storage &amp; RAM to see exact price
              </div>
            )}
          </div>
        )}

        {/* Live Price Display — hidden when variants are selected */}
        {(!hasVariants || (selectedStorage == null && selectedRam == null)) && (
          <LivePriceDisplay
            product={product}
            onPriceUpdate={!hasVariants ? setDynamicOurPrice : undefined}
            onStockUpdate={setDynamicStock}
          />
        )}
      </div>

      {/* Payment Selector */}
      <PaymentSelector
        ourPrice={dynamicOurPrice}
        selectedOption={paymentOption}
        onSelect={setPaymentOption}
      />

      {/* CTA Buttons */}
      <div className={styles.ctaSection}>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`${styles.ctaBtn} ${styles.ctaBuyNow}`}
          id="buy-now-btn"
          aria-label="Place Order"
        >
          <ShoppingBag size={20} strokeWidth={2.5} />
          {inStock ? `Place Order · ${formatINR(finalPrice)}` : 'Out of Stock'}
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || addedToCart}
          className={`${styles.ctaBtn}`}
          style={{ 
            background: addedToCart ? '#16a34a' : 'rgba(244, 167, 36, 0.1)', 
            border: addedToCart ? '2px solid #16a34a' : '2px solid #f4a724',
            color: addedToCart ? '#fff' : '#f4a724',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '800'
          }}
          id="add-to-cart-btn"
        >
          {addedToCart ? <CheckCircle size={20} /> : <ShoppingCart size={20} />}
          {addedToCart ? 'Added to Cart' : 'Add to Cart'}
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.ctaBtn} ${styles.ctaWhatsApp}`}
          id="whatsapp-order-btn"
        >
          <MessageCircle size={20} strokeWidth={2.5} />
          Enquire on WhatsApp
        </a>
      </div>

      {/* Description */}
      {product.description && (
        <div className={styles.descSection}>
          <h2 className={styles.descTitle}>
            <Package size={16} strokeWidth={2} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />
            Product Details
          </h2>
          <p className={styles.descText}>{product.description}</p>
        </div>
      )}

      {/* Reviews */}
      <div id="reviews-section">
        <ReviewsSection productId={product.id} onStatsChange={setReviewStats} />
      </div>

      {/* Floating Review Badge — real data */}
      {reviewStats.count > 0 && (
        <a
          href="#reviews-section"
          style={{
            position: 'fixed', bottom: '24px', right: '24px', background: '#fff',
            padding: '8px 16px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            color: '#111', fontWeight: '700', border: '1px solid #e5e7eb', zIndex: 100
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#16a34a' }}>
            {reviewStats.avg} <Star size={14} fill="currentColor" />
          </span>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>{reviewStats.count} Reviews</span>
        </a>
      )}
    </div>
  );
}
