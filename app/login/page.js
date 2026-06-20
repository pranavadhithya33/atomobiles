"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className={styles.page}>
      {/* Left Side — Visual */}
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <h1 className={styles.visualTitle}>ATOMOBILES</h1>
          <p className={styles.visualText}>
            Premium wholesale mobile devices. Join 1000+ dealers across Tamil Nadu.
          </p>
          <div className={styles.visualStats}>
            <div>
              <span>10K+</span>
              <span>Devices Sold</span>
            </div>
            <div>
              <span>9+</span>
              <span>Dealer Locations</span>
            </div>
          </div>
        </div>
        {/* Animated background lines */}
        <div className={styles.lines}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.line} style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      </div>

      {/* Right Side — Form */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to your dealer account' : 'Register as a new dealer'}</p>
          </div>

          <form className={styles.form}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input type="text" placeholder="Your name" className={styles.input} required />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" className={styles.input} required />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input type="tel" placeholder="+91 98765 43210" className={styles.input} required />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className={styles.forgot}>
                <a href="#">Forgot password?</a>
              </div>
            )}

            <button type="submit" className={`btn btn-primary btn-full ${styles.submitBtn}`}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button className={styles.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm} className={styles.toggleBtn}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <Link href="/" className={styles.backLink}>← Back to Store</Link>
      </div>
    </div>
  );
}
