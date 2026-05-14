'use client';

import { useActionState, useState, useEffect } from 'react';
import { registerWithEmail, verifyOTPAndRegister, resendOTP } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneInput from '@/app/components/PhoneInput';

export default function RegisterForm({ batches }: { batches: any[] }) {
  const [state, formAction, isPending] = useActionState(registerWithEmail, null);
  const [otpState, otpFormAction, isOtpPending] = useActionState(verifyOTPAndRegister, null);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthText = ['Too Weak', 'Fair', 'Good', 'Strong'][strength - 1] || 'Enter password';
  const strengthColor = ['#ef4444', '#f59e0b', '#fbbf24', '#10b981'][strength - 1] || 'transparent';

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
      <div style={{ textAlign: 'center', padding: '1.852vh 1.042vw' }}>
        <div style={{ marginBottom: '1rem' }}>
          <CelebrationIcon sx={{ fontSize: '3rem', color: 'var(--accent-primary)' }} />
        </div>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.926vh' }}>Welcome!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.852vh' }}>Your account has been created. Redirecting to your dashboard…</p>
        <div style={{ width: '2.083vw', height: '2.083vw', border: '0.156vw solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (otpState?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '1.852vh 1.042vw' }}>
        <div style={{ marginBottom: '1rem' }}>
          <CheckCircleIcon sx={{ fontSize: '3rem', color: '#10b981' }} />
        </div>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.926vh' }}>Verified!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.852vh' }}>
          Email verified successfully. Your account is now <strong>pending approval</strong> from your Batch Manager. You will be able to see batch activity once approved.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  if (state?.otpSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25vw' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '0.463vh' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.0vw' }}>
            We've sent a 6-digit code to <strong>{state.email}</strong>. Please enter it below to complete your registration.
          </p>
        </div>

        <form action={otpFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.042vw' }}>
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
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.9vw', textAlign: 'center' }}>
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
              fontSize: '0.667vw', 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25vw' }}>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.042vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" name="firstName" type="text" placeholder="First Name" className={styles.input} required disabled={isPending} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" name="lastName" type="text" placeholder="Last Name" className={styles.input} required disabled={isPending} />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Preferred Username (Optional)</label>
          <input id="username" name="username" type="text" placeholder="e.g. john_doe" className={styles.input} disabled={isPending} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>Phone Number</label>
          <PhoneInput id="phone" name="phone" required disabled={isPending} className={styles.input} />
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
          <div style={{ position: 'relative' }}>
            <input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="At least 6 characters" 
              className={styles.input} 
              required 
              minLength={6} 
              disabled={isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              {showPassword ? <VisibilityOff sx={{ fontSize: '1.2rem' }} /> : <Visibility sx={{ fontSize: '1.2rem' }} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Strength:</span>
              <span style={{ fontSize: '0.7rem', color: strengthColor, fontWeight: '700' }}>{strengthText}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(strength / 4) * 100}%`, 
                height: '100%', 
                background: strengthColor, 
                transition: 'all 0.3s ease' 
              }} />
            </div>
          </div>
        </div>

        {state?.error && (
          <p style={{ color: 'var(--accent-danger)', fontSize: '0.667vw', textAlign: 'center' }}>{state.error}</p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: '100%', marginTop: '0.463vh' }}>
          {isPending ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '0.463vh 0' }}>
        <div style={{ flex: 1, height: '0.052vw', background: 'rgba(255,255,255,0.1)' }}></div>
        <span style={{ padding: '0 0.521vw', color: 'var(--text-muted)', fontSize: '0.667vw' }}>OR</span>
        <div style={{ flex: 1, height: '0.052vw', background: 'rgba(255,255,255,0.1)' }}></div>
      </div>

      <GoogleLoginButton />
    </div>
  );
}
