"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import styles from './page.module.css';

/* =============================================
   SAMPLE DATA — Replace with your Supabase fetch
   ============================================= */
/* Mock products replaced by dynamic DB fetch */

const reviews = [
  { id: 1, name: 'Rahul K.', rating: 5, text: 'Best wholesale prices in Tamil Nadu. Authentic iPhones with warranty!', location: 'Chennai' },
  { id: 2, name: 'Priya S.', rating: 5, text: 'Fast delivery and genuine products. My go-to dealer for bulk orders.', location: 'Coimbatore' },
  { id: 3, name: 'Karthik M.', rating: 4, text: 'Great pricing on Samsung devices. Support team is very responsive.', location: 'Madurai' },
  { id: 4, name: 'Anitha R.', rating: 5, text: 'Ordered 10 phones for my shop. All arrived in perfect condition.', location: 'Salem' },
  { id: 5, name: 'Vijay P.', rating: 5, text: 'WhatsApp ordering is super convenient. Highly recommend!', location: 'Trichy' },
];

const dealers = [
  { name: 'Ahamed', location: 'Thondi, Ramanathapuram', initial: 'A' },
  { name: 'Rathina', location: 'Tenkasi', initial: 'R' },
  { name: 'Jaganraj', location: 'Attur', initial: 'J' },
  { name: 'Sarbudeen', location: 'Trichy Central', initial: 'S' },
  { name: 'Sevagan', location: 'Thittakudi, Cuddalore', initial: 'S' },
  { name: 'Karthick C', location: 'Hosur', initial: 'K' },
  { name: 'Saran', location: 'Salem Division 1', initial: 'S' },
  { name: 'Lawrence', location: 'Taramani, Chennai', initial: 'L' },
  { name: 'JK Yashwanth Raj', location: 'Rajapalayam', initial: 'Y' },
];

const features = [
  { icon: '◆', title: '100% Authentic', desc: 'Every device sourced directly from authorized distributors. No clones, no fakes.' },
  { icon: '◇', title: 'Wholesale Pricing', desc: 'Competitive bulk rates that maximize your margins. Better prices for larger orders.' },
  { icon: '◈', title: 'Statewide Network', desc: 'Active dealers across Tamil Nadu. Fast local delivery from nearest location.' },
  { icon: '◉', title: 'Full Warranty', desc: 'Manufacturer warranty on every device. We handle all warranty claims for dealers.' },
  { icon: '◎', title: 'Fast Delivery', desc: 'Quick turnaround on all orders. Same-day dispatch for in-stock items.' },
  { icon: '◐', title: 'Dedicated Support', desc: 'Priority WhatsApp support for all dealers. Response within 30 minutes.' },
];

/* =============================================
   MAIN PAGE COMPONENT
   ============================================= */
export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [dealProduct, setDealProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch products and deal of the day
  useEffect(() => {
    const loadData = async () => {
      try {
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        
        const mappedProducts = (productsData || []).map(p => ({
          id: p.slug,
          name: p.name,
          brand: p.category || 'Mobile',
          specs: 'Verified | 100% Authentic',
          price: p.our_price || 0,
          originalPrice: p.market_price || 0,
          rating: 4.8,
          reviewCount: Math.floor(Math.random() * 500) + 100,
          image: p.images?.[0] || '/phones/iphone16promax.jpg',
          badge: p.featured ? 'HOT' : '',
          savings: Math.max(0, (p.market_price || 0) - (p.our_price || 0))
        }));
        setAllProducts(mappedProducts);

        const dealRes = await fetch('/api/deal');
        const dealData = await dealRes.json();
        if (dealData && dealData.deal) {
          setDealProduct(dealData.deal);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Derive product selections
  const trendingProducts = allProducts.filter(p => p.badge === 'HOT').length > 0
    ? allProducts.filter(p => p.badge === 'HOT')
    : allProducts.slice(0, 6);

  const newArrivals = allProducts.slice(0, 6).map(p => ({ ...p, badge: 'NEW' }));
  
  const bestSellers = allProducts.slice(4, 10);

  const filteredProducts = selectedCategory === 'All'
    ? allProducts
    : allProducts.filter(p => p.brand.toLowerCase() === selectedCategory.toLowerCase());

  // Determine active deal
  const activeDeal = dealProduct ? {
    name: dealProduct.name,
    description: dealProduct.description || '256GB | Premium build | Ultra high performance',
    price: dealProduct.deal_price || dealProduct.our_price,
    originalPrice: dealProduct.market_price || Math.max(dealProduct.amazon_price || 0, dealProduct.flipkart_price || 0, dealProduct.online_price || 0),
    image: dealProduct.images?.[0] || '/phones/iphone16promax.jpg',
    slug: dealProduct.slug
  } : (allProducts.length > 0 ? {
    name: allProducts[0].name,
    description: allProducts[0].specs || 'Verified | 100% Authentic',
    price: allProducts[0].price,
    originalPrice: allProducts[0].originalPrice,
    image: allProducts[0].image,
    slug: allProducts[0].id
  } : null);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / total);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .stagger-children').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Aurora Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, time = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Base gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.5, '#050508');
      grad.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Aurora waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const hue = 200 + i * 15;
        ctx.fillStyle = `hsla(${hue}, 60%, 70%, ${0.04 - i * 0.01})`;
        for (let x = 0; x <= width; x += 5) {
          const y = height * 0.35 +
            Math.sin(x * 0.003 + time * 0.015 + i * 2) * 60 +
            Math.sin(x * 0.007 + time * 0.01 + i) * 30 +
            Math.sin(x * 0.001 + time * 0.008) * 80;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }

      // Glow
      const glow = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.008) * 200,
        height * 0.3 + Math.cos(time * 0.006) * 100,
        0, width * 0.5, height * 0.3, width * 0.5
      );
      glow.addColorStop(0, 'rgba(255,255,255,0.02)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      time++;
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const renderStars = (rating) => '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');

  return (
    <>
      {/* Scroll Progress */}
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />

      <Header cartCount={cartCount} />

      <main>
        {/* =============================================
            HERO SECTION
            ============================================= */}
        <section className={styles.hero} ref={heroRef}>
          <canvas ref={canvasRef} className={styles.heroCanvas} />

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Wholesale Mobile Dealer
            </div>

            <h1 className={styles.heroTitle}>
              {'ATOMOBILES'.split('').map((letter, i) => (
                <span key={i} className={styles.heroLetter} style={{ animationDelay: `${i * 0.05}s` }}>
                  {letter}
                </span>
              ))}
            </h1>

            <p className={styles.heroSubtitle}>
              Premium wholesale mobile devices across Tamil Nadu.
              Authentic products. Unbeatable prices. Trusted by 1000+ dealers.
            </p>

            <div className={styles.heroButtons}>
              <a href="#products" className="btn btn-primary btn-lg">
                Browse Collection
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </a>
              <a href="#contact" className="btn btn-secondary btn-lg">
                Contact Us
              </a>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>10K+</span>
                <span className={styles.statLabel}>Devices Sold</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>9+</span>
                <span className={styles.statLabel}>Dealer Locations</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>100%</span>
                <span className={styles.statLabel}>Authentic</span>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
            MARQUEE ANNOUNCEMENT
            ============================================= */}
        <div className={styles.marqueeWrap}>
          <div className="marquee">
            <div className="marquee-content">
              <span>🔥 iPhone 16 Pro Max now available at wholesale pricing</span>
              <span>⚡ Free delivery across Tamil Nadu on orders above ₹50,000</span>
              <span>✓ 100% authentic products with manufacturer warranty</span>
              <span>💬 WhatsApp us for bulk pricing and dealer enquiries</span>
              <span>🔥 iPhone 16 Pro Max now available at wholesale pricing</span>
              <span>⚡ Free delivery across Tamil Nadu on orders above ₹50,000</span>
              <span>✓ 100% authentic products with manufacturer warranty</span>
              <span>💬 WhatsApp us for bulk pricing and dealer enquiries</span>
            </div>
          </div>
        </div>

        {/* =============================================
            TRENDING NOW — Horizontal Scroll
            ============================================= */}
        <section className="section" id="trending">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">🔥 Trending</span>
                <h2 className="section-title">Trending Now</h2>
              </div>
              <a href="#products" className="view-all">View All →</a>
            </div>
            <div className="scroll-row stagger-children">
              {trendingProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} variant="horizontal" onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            DEAL OF THE DAY
            ============================================= */}
        {activeDeal && (
          <section className={`section ${styles.dealSection}`} id="deals">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <span className="section-tag">⚡ Limited Time</span>
                  <h2 className="section-title">Deal of the Day</h2>
                </div>
              </div>
              <div className={`${styles.dealCard} reveal`}>
                <div className={styles.dealImage}>
                  <Image
                    src={activeDeal.image}
                    alt={activeDeal.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className={styles.dealImg}
                  />
                </div>
                <div className={styles.dealInfo}>
                  <span className={styles.dealBadge}>DEAL ENDS IN 04:23:15</span>
                  <h3 className={styles.dealTitle}>{activeDeal.name}</h3>
                  <p className={styles.dealSpecs}>{activeDeal.description}</p>
                  <div className={styles.dealRating}>
                    <span className={styles.stars}>★★★★★</span>
                    <span className={styles.reviewCount}>(250+ reviews)</span>
                  </div>
                  <div className={styles.dealPriceBlock}>
                    <span className={styles.dealPrice}>₹{(activeDeal.price || 0).toLocaleString('en-IN')}</span>
                    {activeDeal.originalPrice && activeDeal.originalPrice > activeDeal.price && (
                      <>
                        <span className={styles.dealOriginal}>₹{activeDeal.originalPrice.toLocaleString('en-IN')}</span>
                        <span className={styles.dealSavings}>Save ₹{(activeDeal.originalPrice - activeDeal.price).toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                  <Link href={`/products/${activeDeal.slug}`} className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =============================================
            ALL PRODUCTS — 2-col/4-col Grid
            ============================================= */}
        <section className="section" id="products">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">📱 Catalog</span>
                <h2 className="section-title">All Phones</h2>
                <p className="section-desc">Browse our complete collection of wholesale smartphones</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className={`${styles.filterPills} reveal`}>
              {['All', 'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(8);
                  }}
                  className={`${styles.filterPill} ${selectedCategory === cat ? styles.filterActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className={`${styles.productGrid} stagger-children`}>
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className={styles.loadMoreWrap}>
                <button onClick={() => setVisibleCount(prev => prev + 8)} className="btn btn-secondary">Load More</button>
              </div>
            )}
          </div>
        </section>

        {/* =============================================
            BEST SELLERS — Horizontal Scroll
            ============================================= */}
        <section className="section" id="bestsellers">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">🏆 Popular</span>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <a href="#products" className="view-all">View All →</a>
            </div>
            <div className="scroll-row stagger-children">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} variant="horizontal" onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            NEW ARRIVALS — Horizontal Scroll
            ============================================= */}
        <section className="section" id="new">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">🆕 Fresh</span>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <a href="#products" className="view-all">View All →</a>
            </div>
            <div className="scroll-row stagger-children">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} variant="horizontal" onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            WHY US — Features with 3D Tilt
            ============================================= */}
        <section className={`section ${styles.featuresSection}`}>
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">✓ Trusted</span>
                <h2 className="section-title">Why Choose Us</h2>
                <p className="section-desc">Built on trust, quality, and relationships across Tamil Nadu</p>
              </div>
            </div>
            <div className={`${styles.featuresGrid} stagger-children`}>
              {features.map((feature, i) => (
                <div key={i} className={`${styles.featureCard} spotlight-card`}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            DEALERS — Fan Out
            ============================================= */}
        <section className="section" id="dealers">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">🤝 Network</span>
                <h2 className="section-title">Our Dealers</h2>
                <p className="section-desc">Trusted partners bringing quality devices to every corner</p>
              </div>
            </div>
            <div className={`${styles.dealersGrid} stagger-children`}>
              {dealers.map((dealer, i) => (
                <div key={i} className={styles.dealerCard}>
                  <div className={styles.dealerAvatar}>{dealer.initial}</div>
                  <div className={styles.dealerInfo}>
                    <h4 className={styles.dealerName}>{dealer.name}</h4>
                    <p className={styles.dealerLocation}>{dealer.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            REVIEWS — Horizontal Scroll
            ============================================= */}
        <section className="section" id="reviews">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">💬 Feedback</span>
                <h2 className="section-title">Customer Reviews</h2>
              </div>
            </div>
            <div className="scroll-row stagger-children">
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                  <p className={styles.reviewText}>"{review.text}"</p>
                  <div className={styles.reviewAuthor}>
                    <span className={styles.reviewName}>{review.name}</span>
                    <span className={styles.reviewLocation}>{review.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            CONTACT — Split Layout
            ============================================= */}
        <section className="section" id="contact">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <span className="section-tag">📞 Reach Out</span>
                <h2 className="section-title">Get In Touch</h2>
                <p className="section-desc">For wholesale pricing, stock availability, or to join our dealer network</p>
              </div>
            </div>
            <div className={`${styles.contactGrid} reveal`}>
              <div className={styles.contactInfo}>
                <div className={styles.contactCard}>
                  <div className={styles.contactIcon}>📞</div>
                  <h3>WhatsApp / Phone</h3>
                  <p>+91 98765 43210</p>
                </div>
                <div className={styles.contactCard}>
                  <div className={styles.contactIcon}>✉</div>
                  <h3>Email</h3>
                  <p>contact@atomobiles.com</p>
                </div>
                <div className={styles.contactCard}>
                  <div className={styles.contactIcon}>📍</div>
                  <h3>Head Office</h3>
                  <p>Chennai, Tamil Nadu</p>
                </div>
              </div>
              <form className={styles.contactForm}>
                <input type="text" placeholder="Your Name" className={styles.formInput} />
                <input type="email" placeholder="Email Address" className={styles.formInput} />
                <input type="tel" placeholder="Phone Number" className={styles.formInput} />
                <textarea placeholder="Message" rows={4} className={styles.formInput} />
                <button type="submit" className="btn btn-primary btn-full">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
