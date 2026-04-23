'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { signIn } from 'next-auth/react';
import styles from './login.module.css';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form action={dispatch} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <input 
            id="email"
            name="email"
            type="email" 
            placeholder="name@example.com" 
            className={styles.input} 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input 
            id="password"
            name="password"
            type="password" 
            placeholder="••••••••" 
            className={styles.input} 
            required 
            minLength={6}
          />
        </div>

        {errorMessage && (
          <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <button 
          type="submit" 
          className={`${styles.submitBtn} btn btn-primary`}
          disabled={isPending}
        >
          {isPending ? 'Signing In...' : 'Sign In to Dashboard'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        OR
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
      </div>

      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="btn glass"
        style={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.8 2.17c1.65-1.52 2.6-3.76 2.6-6.5z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.8-2.17c-.77.53-1.76.85-3.16.85-2.43 0-4.49-1.63-5.23-3.83L.96 13.5C2.44 16.46 5.48 18 9 18z"/>
          <path fill="#FBBC05" d="M3.77 10.67c-.19-.58-.3-1.19-.3-1.82s.11-1.24.3-1.82L.96 4.86C.35 6.1.01 7.51.01 9s.34 2.9.95 4.14l2.81-2.47z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.48 0 2.44 1.54.96 4.5L3.77 6.84c.74-2.2 2.8-3.26 5.23-3.26z"/>
        </svg>
        Sign In with Google
      </button>
    </div>
  );
}
