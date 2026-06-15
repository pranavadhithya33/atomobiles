'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Admin.module.css';
import { Smartphone, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('og_admin', 'true');
        if (data.token) sessionStorage.setItem('og_admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <motion.div 
        className={`${styles.loginCard} darkTextCard`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className={styles.loginLogo}>
          <div className={styles.loginLogoIcon}>
            <Smartphone size={28} color="#f4a724" />
          </div>
          <div>
            <h1 className={styles.loginTitle}>Atomobiles</h1>
            <p className={styles.loginSubtitle}>Admin Panel · Secure Login</p>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">Admin Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className={styles.loginError}>{error}</div>}

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            id="admin-login-btn"
            className={styles.loginBtn}
            disabled={loading || !password}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Verifying…' : <><LogIn size={18} /> Login to Dashboard</>}
          </motion.button>
        </form>

        <p style={{ textAlign:'center', fontSize:12, color:'#aaa' }}>
          <Lock size={11} style={{ verticalAlign:'middle', marginRight:4 }} />
          Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}
