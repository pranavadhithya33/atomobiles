'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import PaymentSelector from '@/components/PaymentSelector';
import LivePriceDisplay from '@/components/LivePriceDisplay';
import { formatINR, calcDiscountPct, calcSavings, calcPaymentDetails } from '@/lib/utils';
import styles from '@/styles/ProductDetail.module.css';
import { ChevronRight, CheckCircle, AlertCircle, Clock, ShoppingBag, MessageCircle, Package, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

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
        const isActiveDeal = data.is_deal_of_the_day && data.deal_expires_at && new Date(data.deal_expires_at).getTime() > new Date().getTime();
        setDynamicOurPrice(isActiveDeal ? data.deal_price : data.our_price);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const waMsg = `🛒 *Order Enquiry - ATOMOBILES*\n\n📦 *Product:* ${product.name}\n💳 *Payment:* ${paymentText}\n💰 *Total:* ₹${finalPrice}\n\nPlease confirm availability.`;
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
      ...(hasVariants && selectedRam != null && { ram: selectedRam }),
      ...(hasVariants && selectedStorage != null && { storage: selectedStorage }),
    });
    router.push(`/order?${params.toString()}`);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    const variantInfo = (hasVariants && selectedRam != null && selectedStorage != null)
      ? { ram: selectedRam, storage: selectedStorage, variantPrice: dynamicOurPrice }
      : null;
    addToCart(product, 1, paymentOption, variantInfo);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000000' }}>
      <motion.div 
        className={styles.detailPage}
        initial="hidden"
        animate="visible"
        style={{ flex: 1 }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {/* Breadcrumb */}
        <motion.nav 
          className={styles.breadcrumb}
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link href={`/?cat=${product.category}`}>
                {product.category}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </motion.nav>

        {/* Two-Column Grid Layout */}
        <div className={styles.grid}>
          {/* Left Column: Gallery */}
          <motion.div 
            className={styles.gallery}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <ProductGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Right Column: Details & Checkout Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Info Card */}
            <motion.div className={styles.infoSection} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  {product.category && <div className={styles.productCategory}>{product.category}</div>}
                  <h1 className={styles.productName} style={{ marginBottom: '8px' }}>{product.name}</h1>
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
                  <div className={styles.variantRow} style={{ marginTop: '12px' }}>
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
                      <span>
                        {selectedRam}GB RAM · {selectedStorage}GB Storage
                      </span>
                      <strong>{formatINR(dynamicOurPrice)}</strong>
                    </div>
                  ) : (
                    <div className={styles.variantPriceHint}>
                      Starting from {formatINR(dynamicOurPrice)} · Select storage &amp; RAM to see exact price
                    </div>
                  )}
                </div>
              )}

              {/* Live Price Display — hidden when variants are selected or if active deal */}
              {(!hasVariants || (selectedStorage == null && selectedRam == null)) && !(product.is_deal_of_the_day && product.deal_expires_at && new Date(product.deal_expires_at).getTime() > new Date().getTime()) && (
                <LivePriceDisplay
                  product={product}
                  onPriceUpdate={!hasVariants ? setDynamicOurPrice : undefined}
                  onStockUpdate={setDynamicStock}
                />
              )}
              
              {/* Deal Badge */}
              {product.is_deal_of_the_day && product.deal_expires_at && new Date(product.deal_expires_at).getTime() > new Date().getTime() && (
                <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', padding: '12px 16px', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔥</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#d97706', fontSize: '14px' }}>DEAL OF THE DAY ACTIVE!</div>
                    <div style={{ color: '#92400e', fontSize: '13px' }}>Special promotional price applied. Ends soon!</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment Selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <PaymentSelector
                ourPrice={dynamicOurPrice}
                selectedOption={paymentOption}
                onSelect={setPaymentOption}
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div className={styles.ctaSection} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                disabled={!inStock}
                className={`${styles.ctaBtn} ${styles.ctaBuyNow}`}
                id="buy-now-btn"
                aria-label="Place Order"
              >
                <ShoppingBag size={20} strokeWidth={2.5} />
                {inStock ? `Place Order · ${formatINR(finalPrice)}` : 'Out of Stock'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={!inStock || addedToCart}
                className={`${styles.ctaBtn}`}
                style={{ 
                  background: addedToCart ? '#16a34a' : 'rgba(57, 255, 20, 0.05)', 
                  border: addedToCart ? '2px solid #16a34a' : '2px solid #39ff14',
                  color: addedToCart ? '#fff' : '#39ff14',
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
              </motion.button>

              <motion.a
                whileTap={{ scale: 0.95 }}
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.ctaBtn} ${styles.ctaWhatsApp}`}
                id="whatsapp-order-btn"
              >
                <MessageCircle size={20} strokeWidth={2.5} />
                Enquire on WhatsApp
              </motion.a>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div className={styles.descSection} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <h2 className={styles.descTitle}>
                  <Package size={16} strokeWidth={2} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />
                  Product Details
                </h2>
                <p className={styles.descText}>{product.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
