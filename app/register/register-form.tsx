'use client';

import { useActionState } from 'react';
import { register } from '@/lib/actions';
import { signIn } from 'next-auth/react';
import styles from '../login/login.module.css';

export default function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    register,
    undefined,
  );

  if (errorMessage === 'SUCCESS') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Success!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your account has been created. You can now sign in.</p>
        <a href="/login" className="btn btn-primary" style={{ width: '100%' }}>Go to Login</a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            disabled={isPending}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isPending}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            required
            disabled={isPending}
          />
        </div>

        {errorMessage && (
          <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isPending}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {isPending ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        OR
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
      </div>

      <button
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
        Sign Up with Google
      </button>
    </div>
  );
}
