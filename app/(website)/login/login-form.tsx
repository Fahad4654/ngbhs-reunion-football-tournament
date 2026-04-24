'use client';

import { useActionState, useState, useEffect } from 'react';
import { loginWithEmail } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginWithEmail, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (state.role === 'ADMIN' || state.role === 'CO_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [state?.success, state?.role, router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form action={formAction} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" placeholder="name@example.com" className={styles.input} required />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="••••••••" className={styles.input} required minLength={6} />
        </div>
        
        {state?.error && (
          <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
            {state.error}
          </div>
        )}
        
        <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={isPending}>
          {isPending ? 'Signing In...' : 'Sign In to Dashboard'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Register here</a>
        </p>
      </div>
    </div>
  );
}
