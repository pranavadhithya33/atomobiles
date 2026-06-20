"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import styles from './page.module.css';

export default function ProductDetail({ params }) {
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Titanium');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const product = {
    id: 1,
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    specs: '256GB | A18 Pro | Titanium | 48MP Camera',
    price: 149900,
    originalPrice: 159900,
    rating: 4.9,
    reviewCount: 1234,
    savings: 10000,
    images: [
      '/phones/iphone16promax.jpg',
      '/phones/iphone16promax-2.jpg',
      '/phones/iphone16promax-3.jpg',
    ],
    description: 'The iPhone 16 Pro Max features the A18 Pro chip, a stunning Super Retina XDR display, and an advanced camera system with 48MP main camera. Built with titanium for durability and elegance.',
    features: [
      'A18 Pro chip with 6-core GPU',
      '6.9" Super Retina XDR display',
      '48MP Main | 12MP Ultra Wide | 12MP Telephoto',
      'Titanium design with Ceramic Shield',
      'Up to 29 hours video playback',
      'USB-C with USB 3 support',
    ],
    inStock: true,
    storage: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + quantity);
  };

  const renderStars = (rating) => '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');

  return (
    <>
      <Header cartCount={cartCount} />
      <main className={styles.main}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/#products">Phones</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </nav>

          <div className={styles.productLayout}>
            {/* Image Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImage}>
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className={styles.galleryImg}
                />
              </div>
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill style={{ objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className={styles.info}>
              <span className={styles.brand}>{product.brand}</span>
              <h1 className={styles.name}>{product.name}</h1>

              <div className={styles.rating}>
                <span className={styles.stars}>{renderStars(product.rating)}</span>
                <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                <span className={styles.original}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className={styles.savings}>Save ₹{product.savings.toLocaleString('en-IN')}</span>
              </div>

              <p className={styles.description}>{product.description}</p>

              {/* Storage Selector */}
              <div className={styles.selector}>
                <label>Storage</label>
                <div className={styles.options}>
                  {product.storage.map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.option} ${selectedStorage === opt ? styles.optionActive : ''}`}
                      onClick={() => setSelectedStorage(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className={styles.selector}>
                <label>Color</label>
                <div className={styles.options}>
                  {product.colors.map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.option} ${selectedColor === opt ? styles.optionActive : ''}`}
                      onClick={() => setSelectedColor(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className={styles.selector}>
                <label>Quantity</label>
                <div className={styles.quantity}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Stock Status */}
              <div className={styles.stock}>
                <span className={styles.stockDot} />
                In Stock — Ships within 24 hours
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className={`btn btn-primary btn-lg ${styles.addBtn}`} onClick={handleAddToCart}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add to Order
                </button>
                <a href={`https://wa.me/919876543210?text=Hi%20ATOMOBILES,%20I%20want%20to%20order%20${product.name}`} className={`btn btn-secondary btn-lg ${styles.whatsappBtn}`} target="_blank">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.585 5.938L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Order via WhatsApp
                </a>
              </div>

              {/* Features List */}
              <div className={styles.featuresList}>
                <h3>Key Features</h3>
                <ul>
                  {product.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
