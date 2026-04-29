'use client';

import { useActionState, useEffect } from 'react';
import { resetPassword } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from '../../login/login.module.css';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';
  
  const [state, formAction, isPending] = useActionState(resetPassword, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success('Password reset successful! Please log in with your new password.');
      router.push('/login');
    }
  }, [state?.success, router]);

  if (!email || !otp) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-danger)' }}>Invalid session. Please start the reset process again.</p>
        <a href="/forgot-password" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back
        </a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      e.preventDefault();
      toast.error('Passwords do not match.');
      return;
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className={styles.form}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="otp" value={otp} />
      
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="password">New Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="••••••••" 
          className={styles.input} 
          required 
          minLength={6}
          disabled={isPending}
          autoFocus
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password" 
          placeholder="••••••••" 
          className={styles.input} 
          required 
          minLength={6}
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>
          {state.error}
        </div>
      )}

      <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={isPending}>
        {isPending ? 'Resetting...' : 'Change Password'}
      </button>
    </form>
  );
}
