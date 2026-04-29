'use client';

import { useActionState, useEffect } from 'react';
import { verifyPasswordResetOTP } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../login/login.module.css';

export default function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [state, formAction, isPending] = useActionState(verifyPasswordResetOTP, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      // Redirect to reset page with email and otp as "proof"
      router.push(`/forgot-password/reset?email=${encodeURIComponent(state.email)}&otp=${encodeURIComponent(state.otp)}`);
    }
  }, [state?.success, state?.email, state?.otp, router]);

  if (!email) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-danger)' }}>Missing email address. Please start over.</p>
        <a href="/forgot-password" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="email" value={email} />
      
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="otp">Verification Code</label>
        <input 
          id="otp" 
          name="otp" 
          type="text" 
          placeholder="123456" 
          className={styles.input} 
          required 
          maxLength={6}
          pattern="\d{6}"
          disabled={isPending}
          autoFocus
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Sending to: <strong>{email}</strong>
        </p>
      </div>

      {state?.error && (
        <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
          {state.error}
        </div>
      )}

      <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={isPending}>
        {isPending ? 'Verifying...' : 'Verify Code'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button 
          type="button" 
          onClick={() => router.back()} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Change Email
        </button>
      </div>
    </form>
  );
}
