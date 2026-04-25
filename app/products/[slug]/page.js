'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import PaymentSelector from '@/components/PaymentSelector';
import LivePriceDisplay from '@/components/LivePriceDisplay';
import { formatINR, calcDiscountPct, calcSavings, calcPrepaidPrice, calcHalfPayment, calcTokenAdvance } from '@/lib/utils';
import styles from '@/styles/ProductDetail.module.css';
import { ChevronRight, CheckCircle, AlertCircle, Clock, ShoppingBag, MessageCircle, Package } from 'lucide-react';

const PREPAID_DISCOUNT_PCT = 3;
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
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [slug]);

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
  const prepaidPrice = calcPrepaidPrice(dynamicOurPrice, PREPAID_DISCOUNT_PCT);
  const halfAmount = calcHalfPayment(dynamicOurPrice);
  const tokenAdvanceAmount = calcTokenAdvance(dynamicOurPrice);
  const inStock = dynamicStock;

  // Final price based on selection
  const finalPrice = paymentOption === 'full_prepaid' ? prepaidPrice : dynamicOurPrice;
  const advanceAmount = paymentOption === 'half_cod' ? halfAmount : paymentOption === 'token_advance' ? tokenAdvanceAmount : null;

  // WhatsApp message
  let paymentText = '';
  if (paymentOption === 'full_prepaid') {
    paymentText = `Full Prepaid | Final Price: ₹${finalPrice}`;
  } else if (paymentOption === 'token_advance') {
    paymentText = `30% Token Advance | Advance: ₹${tokenAdvanceAmount} | Remaining: ₹${dynamicOurPrice - tokenAdvanceAmount}`;
  } else {
    paymentText = `Half COD | Advance: ₹${halfAmount} | Remaining: ₹${dynamicOurPrice - halfAmount}`;
  }

  const waMsg = `🛒 *Order Enquiry - ONLY GADJETS*\n\n📦 *Product:* ${product.name}\n💳 *Payment:* ${paymentText}\n💰 *Total:* ₹${finalPrice}\n\nPlease confirm availability.`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  // Navigate to order page
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

  return (
    <div className={styles.detailPage}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        {product.category && (
          <>
            <Link href={`/?category=${product.category}`}>{product.category}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span>{product.name}</span>
      </nav>

      {/* Gallery */}
      <ProductGallery images={product.images} name={product.name} />

      {/* Info Card */}
      <div className={styles.infoSection}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            {product.category && <div className={styles.productCategory}>{product.category}</div>}
            <h1 className={styles.productName}>{product.name}</h1>
          </div>
          {discountPct > 0 && (
            <span className={styles.discountBadgeLarge}>{discountPct}% OFF</span>
          )}
        </div>

        <div style={{ margin:'12px 0' }}>
          <StockBadge stock={product.stock} />
        </div>

        {/* Live Price Display */}
        <LivePriceDisplay 
          product={product} 
          onPriceUpdate={setDynamicOurPrice} 
          onStockUpdate={setDynamicStock}
        />
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
    </div>
  );
}
