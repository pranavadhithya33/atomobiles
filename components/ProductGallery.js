'use client';

import { useState } from 'react';
import styles from '@/styles/ProductDetail.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);

  const validImages = images?.filter(Boolean) || [];

  if (validImages.length === 0) {
    return (
      <div className={styles.galleryPlaceholder}>
        <span style={{ fontSize: 60 }}>📱</span>
        <p>No image available</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageWrap}>
        {validImages.length > 1 && (
          <button 
            onClick={() => setActive((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))}
            className={styles.galleryNavBtn}
            style={{ left: 10 }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        <img
          src={validImages[active]}
          alt={`${name} - Image ${active + 1}`}
          className={styles.mainImage}
        />

        {validImages.length > 1 && (
          <button 
            onClick={() => setActive((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))}
            className={styles.galleryNavBtn}
            style={{ right: 10 }}
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
              <img src={img} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
