import { motion } from 'framer-motion';

export default function AdminLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        {/* Coffee Cup Body */}
        <motion.div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--brand-primary)',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            position: 'absolute',
            bottom: '10px',
            left: '6px',
            overflow: 'hidden',
          }}
        >
          {/* Liquid fill animation */}
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--brand-accent)',
              transformOrigin: 'bottom',
            }}
            animate={{
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        {/* Coffee Cup Handle */}
        <div
          style={{
            width: '16px',
            height: '20px',
            border: '4px solid var(--brand-primary)',
            borderRadius: '0 10px 10px 0',
            borderLeft: 'none',
            position: 'absolute',
            bottom: '20px',
            left: '44px',
          }}
        />
        {/* Steam */}
        <motion.div
          style={{ width: '4px', height: '12px', background: 'var(--brand-accent)', borderRadius: '2px', position: 'absolute', top: '0', left: '16px' }}
          animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0 }}
        />
        <motion.div
          style={{ width: '4px', height: '12px', background: 'var(--brand-accent)', borderRadius: '2px', position: 'absolute', top: '-4px', left: '26px' }}
          animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
        <motion.div
          style={{ width: '4px', height: '12px', background: 'var(--brand-accent)', borderRadius: '2px', position: 'absolute', top: '2px', left: '36px' }}
          animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </div>
      <motion.div 
        style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Brewing Data...
      </motion.div>
    </div>
  );
}
