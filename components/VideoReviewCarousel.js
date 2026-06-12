'use client';

import { useState, useRef } from 'react';
import styles from '@/styles/VideoReviews.module.css';
import VideoModal from './VideoModal';
import { Play } from 'lucide-react';

export default function VideoReviewCarousel({ videos }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const carouselRef = useRef(null);

  if (!videos || videos.length === 0) return null;

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <h2 className={styles.sectionTitle}>Real Customers. Real Gadgets.</h2>
      
      <div className={styles.carouselWrapper}>
        <button className={`${styles.navButton} ${styles.left}`} onClick={scrollLeft}>
          &#10094;
        </button>
        
        <div className={styles.carousel} ref={carouselRef}>
          {videos.map((video) => (
            <div 
              key={video.id} 
              className={styles.thumbnailCard}
              onClick={() => setActiveVideo(video)}
            >
              {/* Fake thumbnail using the video itself, but paused and muted */}
              <video 
                className={styles.thumbnailVideo} 
                src={video.url} 
                muted 
                playsInline 
                preload="metadata"
              />
              
              <div className={styles.overlay}>
                <div className={styles.playButtonWrapper}>
                  <div className={styles.playButton}>
                    <Play fill="white" size={24} />
                  </div>
                </div>
                <div className={styles.customerInfo}>
                  <p className={styles.customerName}>{video.customer_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className={`${styles.navButton} ${styles.right}`} onClick={scrollRight}>
          &#10095;
        </button>
      </div>

      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
