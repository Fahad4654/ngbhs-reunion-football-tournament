'use client';

import { useActionState, useState, useEffect } from 'react';
import { registerWithEmail, verifyOTPAndRegister, resendOTP } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';

export default function RegisterForm({ batches }: { batches: any[] }) {
  const [state, formAction, isPending] = useActionState(registerWithEmail, null);
  const [otpState, otpFormAction, isOtpPending] = useActionState(verifyOTPAndRegister, null);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && !state?.otpSent) {
      const timer = setTimeout(() => router.push('/dashboard'), 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.otpSent, router]);

  useEffect(() => {
    if (otpState?.success) {
      toast.success('Email verified successfully!');
      const timer = setTimeout(() => router.push('/dashboard'), 1500);
      return () => clearTimeout(timer);
    }
  }, [otpState?.success, router]);

  const handleResendOTP = async () => {
    if (!state?.email) return;
    setResending(true);
    const result = await resendOTP(state.email);
    setResending(false);
    if (result.success) {
      toast.success('OTP resent successfully!');
    } else {
      toast.error(result.error || 'Failed to resend OTP.');
    }
  };

  if (state?.success && !state?.otpSent) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Welcome! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your account has been created. Redirecting to your dashboard…</p>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (otpState?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Verified! ✅</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Email verified successfully. Your account is now <strong>pending approval</strong> from your Batch Manager. You will be able to see batch activity once approved.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  if (state?.otpSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            We've sent a 6-digit code to <strong>{state.email}</strong>. Please enter it below to complete your registration.
          </p>
        </div>

        <form action={otpFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="email" value={state.email} />
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>Verification Code</label>
            <input 
              id="otp" 
              name="otp" 
              type="text" 
              placeholder="123456" 
              className={styles.input} 
              required 
              maxLength={6} 
              pattern="\d{6}"
              disabled={isOtpPending} 
              autoFocus
            />
          </div>

          {(otpState?.error || state?.error) && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
              {otpState?.error || state?.error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={isOtpPending} style={{ width: '100%' }}>
            {isOtpPending ? 'Verifying…' : 'Verify & Complete'}
          </button>

          <button 
            type="button" 
            onClick={handleResendOTP} 
            disabled={resending || isOtpPending}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-primary)', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {resending ? 'Sending...' : "Didn't get a code? Resend OTP"}
          </button>
        </form>
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
          <label htmlFor="batchId" className={styles.label}>Select Your Batch</label>
          <select id="batchId" name="batchId" className={styles.input} required disabled={isPending}>
            <option value="">Choose your batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
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

      <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
      </div>

      <GoogleLoginButton />
    </div>
  );
}
