export default function Loading() {
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
      zIndex: 9999
    }}>
      <div className="gooey-wrapper" style={{ width: '100px', height: '100px' }}>
        <div className="gooey-blob"></div>
        <div className="gooey-blob"></div>
        <div className="gooey-blob"></div>
      </div>
      
      <h2 style={{ 
        color: '#fff', 
        marginTop: '2rem', 
        fontFamily: 'var(--font-base)', 
        fontWeight: 800, 
        letterSpacing: '2px',
        animation: 'pulse 1.5s infinite' 
      }}>
        LOADING...
      </h2>

      {/* SVG Filter for Gooey Effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
