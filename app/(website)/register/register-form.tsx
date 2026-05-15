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
import { isValidPhone } from '@/lib/utils/phone';

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateEmail    = (v: string) => {
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
};
const validateFirstName = (v: string) => (!v.trim() ? 'First name is required.' : '');
const validateLastName  = (v: string) => (!v.trim() ? 'Last name is required.' : '');
const validateBatch     = (v: string) => (!v ? 'Please select your batch.' : '');
const validatePassword  = (v: string) => {
  if (!v) return 'Password is required.';
  if (v.length < 6) return 'Password must be at least 6 characters.';
  return '';
};
const validatePhone = (v: string) => {
  if (!v) return 'Phone number is required.';
  if (!isValidPhone(v)) return 'Invalid phone number format.';
  return '';
};

// ─── Inline field feedback ────────────────────────────────────────────────────
function FieldMessage({ error, touched }: { error: string; touched: boolean }) {
  if (!touched) return null;
  return (
    <p style={{
      fontSize: '0.72rem',
      marginTop: '4px',
      color: error ? '#ef4444' : '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      {error ? '✕ ' + error : '✓ Looks good!'}
    </p>
  );
}

function inputBorderStyle(error: string, touched: boolean): React.CSSProperties {
  if (!touched) return {};
  return { borderColor: error ? '#ef4444' : '#10b981' };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegisterForm({ batches }: { batches: any[] }) {
  const [state, formAction, isPending]       = useActionState(registerWithEmail, null);
  const [otpState, otpFormAction, isOtpPending] = useActionState(verifyOTPAndRegister, null);
  const [resending, setResending]            = useState(false);
  const [showPassword, setShowPassword]      = useState(false);
  const [mounted, setMounted]                = useState(false);
  const router = useRouter();

  // Controlled field state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [batchId,   setBatchId]   = useState('');

  // Touched: only show errors after the user has interacted with a field
  const [touched, setTouched] = useState({
    firstName: false, lastName: false, email: false, password: false, batch: false, phone: false,
  });
  const touch = (field: keyof typeof touched) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  // Live errors
  const errors = {
    firstName: validateFirstName(firstName),
    lastName:  validateLastName(lastName),
    email:     validateEmail(email),
    password:  validatePassword(password),
    batch:     validateBatch(batchId),
    phone:     validatePhone(phone),
  };
  const isFormValid = Object.values(errors).every(e => !e);

  // Password strength
  const calcStrength = (p: string) => {
    let s = 0;
    if (!p) return 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength      = calcStrength(password);
  const strengthText  = ['Too Weak', 'Fair', 'Good', 'Strong'][strength - 1] || '';
  const strengthColor = ['#ef4444', '#f59e0b', '#fbbf24', '#10b981'][strength - 1] || 'rgba(255,255,255,0.1)';

  // Mark as mounted so we only apply client-side validation after hydration
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (state?.success && !state?.otpSent) {
      const t = setTimeout(() => router.push('/dashboard'), 1500);
      return () => clearTimeout(t);
    }
  }, [state?.success, state?.otpSent, router]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    if (otpState?.success) {
      toast.success('Email verified successfully!');
      const t = setTimeout(() => router.push('/dashboard'), 1500);
      return () => clearTimeout(t);
    }
  }, [otpState?.success, router]);

  const handleResendOTP = async () => {
    if (!state?.email) return;
    setResending(true);
    const result = await resendOTP(state.email);
    setResending(false);
    if (result.success) toast.success('OTP resent successfully!');
    else toast.error(result.error || 'Failed to resend OTP.');
  };

  // ── Success / OTP screens ──────────────────────────────────────────────────
  if (state?.success && !state?.otpSent) {
    return (
      <div style={{ textAlign: 'center', padding: '1.852vh 1.042vw' }}>
        <CelebrationIcon sx={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.926vh' }}>Welcome!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.852vh' }}>Your account has been created. Redirecting…</p>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (otpState?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '1.852vh 1.042vw' }}>
        <CheckCircleIcon sx={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.926vh' }}>Verified!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.852vh' }}>
          Your account is now <strong>pending approval</strong> from your Batch Manager.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  if (state?.otpSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            We've sent a 6-digit code to <strong>{state.email}</strong>.
          </p>
        </div>
        <form action={otpFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="email" value={state.email} />
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>Verification Code</label>
            <input id="otp" name="otp" type="text" placeholder="123456"
              className={styles.input} required maxLength={6} pattern="\d{6}"
              disabled={isOtpPending} autoFocus />
          </div>
          {(otpState?.error || state?.error) && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', textAlign: 'center' }}>
              {otpState?.error || state?.error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={isOtpPending} style={{ width: '100%' }}>
            {isOtpPending ? 'Verifying…' : 'Verify & Complete'}
          </button>
          <button type="button" onClick={handleResendOTP} disabled={resending || isOtpPending}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
            {resending ? 'Sending...' : "Didn't get a code? Resend OTP"}
          </button>
        </form>
      </div>
    );
  }

  // ── Main Registration Form ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* First & Last Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" name="firstName" type="text" placeholder="First Name"
              className={styles.input} required disabled={isPending}
              value={firstName} onChange={e => setFirstName(e.target.value)} onBlur={() => touch('firstName')}
              style={inputBorderStyle(errors.firstName, touched.firstName)} />
            <FieldMessage error={errors.firstName} touched={touched.firstName} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" name="lastName" type="text" placeholder="Last Name"
              className={styles.input} required disabled={isPending}
              value={lastName} onChange={e => setLastName(e.target.value)} onBlur={() => touch('lastName')}
              style={inputBorderStyle(errors.lastName, touched.lastName)} />
            <FieldMessage error={errors.lastName} touched={touched.lastName} />
          </div>
        </div>

        {/* Username */}
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Preferred Username (Optional)</label>
          <input id="username" name="username" type="text" placeholder="e.g. john_doe" className={styles.input} disabled={isPending} />
        </div>

        {/* Phone */}
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>Phone Number</label>
          <PhoneInput 
            id="phone" 
            name="phone" 
            required 
            disabled={isPending} 
            className={styles.input}
            onChange={setPhone}
          />
          <FieldMessage error={errors.phone} touched={touched.phone || phone.length > 5} />
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input id="email" name="email" type="email" placeholder="name@example.com"
            className={styles.input} required disabled={isPending}
            value={email} onChange={e => setEmail(e.target.value)} onBlur={() => touch('email')}
            style={inputBorderStyle(errors.email, touched.email)} />
          <FieldMessage error={errors.email} touched={touched.email} />
        </div>

        {/* Batch */}
        <div className={styles.inputGroup}>
          <label htmlFor="batchId" className={styles.label}>Select Your Batch</label>
          <select id="batchId" name="batchId" className={styles.input} required disabled={isPending}
            value={batchId}
            onChange={e => { setBatchId(e.target.value); touch('batch'); }}
            onBlur={() => touch('batch')}
            style={inputBorderStyle(errors.batch, touched.batch)}>
            <option value="">Choose your batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <FieldMessage error={errors.batch} touched={touched.batch} />
        </div>

        {/* Password */}
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input id="password" name="password"
              type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
              className={styles.input} required minLength={6} disabled={isPending}
              value={password} onChange={e => setPassword(e.target.value)} onBlur={() => touch('password')}
              style={{ paddingRight: '3rem', ...inputBorderStyle(errors.password, touched.password) }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              {showPassword ? <VisibilityOff sx={{ fontSize: '1.2rem' }} /> : <Visibility sx={{ fontSize: '1.2rem' }} />}
            </button>
          </div>
          {/* Strength bar */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Strength:</span>
              <span style={{ fontSize: '0.7rem', color: strengthColor, fontWeight: 700 }}>{strengthText}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(strength / 4) * 100}%`, height: '100%', background: strengthColor, transition: 'all 0.3s ease' }} />
            </div>
          </div>
          <FieldMessage error={errors.password} touched={touched.password} />
        </div>


        <button type="submit" className="btn btn-primary" disabled={isPending || (mounted && !isFormValid)}
          style={{ width: '100%', marginTop: '0.25rem', opacity: (!mounted || isFormValid) ? 1 : 0.6, transition: 'opacity 0.2s ease' }}>
          {isPending ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '0.25rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ padding: '0 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <GoogleLoginButton />
    </div>
  );
}
