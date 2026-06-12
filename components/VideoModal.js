'use client';

import { useEffect, useRef } from 'react';
import styles from '@/styles/VideoReviews.module.css';
import { X } from 'lucide-react';

export default function VideoModal({ video, onClose }) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} ref={modalRef} onClick={handleBackdropClick}>
      <button className={styles.closeButton} onClick={onClose}>
        <X size={28} />
      </button>
      
      <div className={styles.modalContent}>
        <video 
          className={styles.modalVideo}
          src={video.url}
          controls
          autoPlay
          playsInline
        />
        <div className={styles.modalInfo}>
          <p className={styles.modalCustomerName}>{video.customer_name}</p>
        </div>
      </div>
    </div>
  );
}
