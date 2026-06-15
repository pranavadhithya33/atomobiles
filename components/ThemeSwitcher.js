'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Check, ChevronDown } from 'lucide-react';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 40, height: 40 }} />; // Placeholder to prevent layout shift
  }

  const themeOptions = [
    { id: 'cafe', label: 'Cafe Style', color: '#e8a468' },
    { id: 'neon-dark', label: 'Neon Dark', color: '#39ff14' },
    { id: 'minimalist-bw', label: 'Minimalist B&W', color: 'var(--text-primary)' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          padding: '8px 12px', 
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}
      >
        <Palette size={16} />
        <span className="header-action-text" style={{ fontSize: '13px', fontWeight: 600 }}>Theme</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '8px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-lg)',
            minWidth: '180px',
            zIndex: 100,
            overflow: 'hidden'
          }}>
            {themeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: theme === t.id ? 700 : 500,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, border: '1px solid rgba(0,0,0,0.2)' }} />
                  {t.label}
                </div>
                {theme === t.id && <Check size={16} color="var(--text-dark)" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
