'use client';

import { useActionState, useState, useEffect } from 'react';
import { registerWithEmail, createSession } from '@/lib/actions';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerWithEmail, null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => router.push('/'), 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Welcome! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your account has been created. Redirecting…</p>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await createSession(idToken);
      if (res?.success) {
        // Sign out on the client to ensure server is the source of truth
        await auth.signOut();
        router.push('/');
      } else {
        alert('Google sign-up failed to establish session.');
      }
    } catch (err) {
      console.error('Google Sign-Up Error:', err);
      alert('Google sign-up failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <input id="name" name="name" type="text" placeholder="Your full name" className={styles.input} required disabled={isPending || googleLoading} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input id="email" name="email" type="email" placeholder="name@example.com" className={styles.input} required disabled={isPending || googleLoading} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input id="password" name="password" type="password" placeholder="At least 6 characters" className={styles.input} required minLength={6} disabled={isPending || googleLoading} />
        </div>

        {state?.error && (
          <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>{state.error}</p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isPending || googleLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {isPending ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        OR
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isPending || googleLoading}
        className="btn glass"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', opacity: googleLoading ? 0.7 : 1 }}
      >
        {googleLoading ? 'Signing up...' : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.8 2.17c1.65-1.52 2.6-3.76 2.6-6.5z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.8-2.17c-.77.53-1.76.85-3.16.85-2.43 0-4.49-1.63-5.23-3.83L.96 13.5C2.44 16.46 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.77 10.67c-.19-.58-.3-1.19-.3-1.82s.11-1.24.3-1.82L.96 4.86C.35 6.1.01 7.51.01 9s.34 2.9.95 4.14l2.81-2.47z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.48 0 2.44 1.54.96 4.5L3.77 6.84c.74-2.2 2.8-3.26 5.23-3.26z"/>
            </svg>
            Sign Up with Google
          </>
        )}
      </button>
    </div>
  );
}
