'use client';

import { useActionState, useState, useEffect } from 'react';
import { loginWithEmail } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';

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

      <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
      </div>

      <GoogleLoginButton />
    </div>
  );
}
