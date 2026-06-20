'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/ProductDetail.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [imageError, setImageError] = useState(false);

  const validImages = images?.filter(Boolean) || [];

  useEffect(() => {
    setImageError(false);
  }, [active]);

  if (validImages.length === 0) {
    return (
      <div className={styles.galleryPlaceholder} style={{ background: '#111111', height: 400, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 60 }}>📱</span>
        <p style={{ color: '#666', fontWeight: 'bold' }}>No image available</p>
      </div>
    );
  }

  const currentImage = validImages[active];

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageWrap} style={{ position: 'relative', background: '#111111', borderRadius: 20, overflow: 'hidden' }}>
        {validImages.length > 1 && (
          <button 
            onClick={() => setActive((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))}
            className={styles.galleryNavBtn}
            style={{ position: 'absolute', zIndex: 10, left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {!imageError ? (
          <Image
            src={currentImage}
            alt={`${name} - Image ${active + 1}`}
            className={styles.mainImage}
            width={600}
            height={600}
            style={{ objectFit: 'contain' }}
            referrerPolicy="no-referrer"
            unoptimized={currentImage?.includes('amazon') || currentImage?.includes('flipkart') || currentImage?.includes('media-amazon')}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{ width: '100%', height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', gap: 12 }}>
            <span style={{ fontSize: 80, opacity: 0.3 }}>📱</span>
            <span style={{ fontSize: 14, fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: 2 }}>ATOMOBILES</span>
          </div>
        )}

        {validImages.length > 1 && (
          <button 
            onClick={() => setActive((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))}
            className={styles.galleryNavBtn}
            style={{ position: 'absolute', zIndex: 10, right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className={styles.thumbnails}>
          {validImages.map((img, idx) => (
            <button
              key={idx}
              className={`${styles.thumb} ${idx === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} width={80} height={80} style={{ objectFit: 'contain' }} unoptimized referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
