'use client';

import { useActionState, useEffect } from 'react';
import { sendPasswordResetOTP } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(sendPasswordResetOTP, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      // Redirect to verify page with email in query params
      router.push(`/forgot-password/verify?email=${encodeURIComponent(state.email)}`);
    }
  }, [state?.success, state?.email, router]);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="email">Email Address</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="name@example.com" 
          className={styles.input} 
          required 
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
          {state.error}
        </div>
      )}

      <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={isPending}>
        {isPending ? 'Sending Code...' : 'Send Reset Code'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
          Back to Login
        </a>
      </div>
    </form>
  );
}
