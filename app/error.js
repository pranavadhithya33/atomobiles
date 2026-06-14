'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="liquid-bg" style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      padding: '20px',
      textAlign: 'center'
    }}>
      
      <h2 className="glitch-text" data-text="SYSTEM ERROR" style={{ 
        color: '#fff', 
        fontSize: '48px',
        fontFamily: 'var(--font-base)', 
        fontWeight: 900, 
        marginBottom: '1rem',
        textTransform: 'uppercase'
      }}>
        SYSTEM ERROR
      </h2>
      
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', maxWidth: '400px' }}>
        A fatal exception has occurred in the Atomobiles matrix. 
      </p>

      <button
        onClick={() => reset()}
        style={{
          background: 'var(--brand-accent)',
          color: 'var(--brand-primary)',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        REBOOT SYSTEM
      </button>

    </div>
  );
}
