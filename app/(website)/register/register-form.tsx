'use client';

import { useActionState, useState, useEffect } from 'react';
import { registerWithEmail } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerWithEmail, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => router.push('/dashboard'), 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Welcome! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your account has been created. Redirecting to your dashboard…</p>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <input id="name" name="name" type="text" placeholder="Your full name" className={styles.input} required disabled={isPending} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input id="email" name="email" type="email" placeholder="name@example.com" className={styles.input} required disabled={isPending} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input id="password" name="password" type="password" placeholder="At least 6 characters" className={styles.input} required minLength={6} disabled={isPending} />
        </div>

        {state?.error && (
          <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>{state.error}</p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: '100%', marginTop: '0.5rem' }}>
          {isPending ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign in here</a>
        </p>
      </div>
    </div>
  );
}
