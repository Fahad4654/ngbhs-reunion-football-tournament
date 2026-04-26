'use client';

import { useActionState, useState, useEffect } from 'react';
import { loginWithEmail, verifyOTPAndRegister, resendOTP } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginWithEmail, null);
  const [otpState, otpFormAction, isOtpPending] = useActionState(verifyOTPAndRegister, null);
  const [resending, setResending] = useState(false);
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

  useEffect(() => {
    if (otpState?.success) {
      toast.success('Email verified successfully!');
      router.push('/dashboard');
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

  if (state?.needsVerification || otpState?.error) {
    const email = state?.email;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Please enter the verification code sent to <strong>{email}</strong>.
          </p>
        </div>

        <form action={otpFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="email" value={email} />
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
            {isOtpPending ? 'Verifying…' : 'Verify & Continue'}
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

          <button 
            type="button" 
            onClick={() => window.location.reload()}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.8rem', 
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

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
