'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { loginWithGoogle } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsPending(true);
    setError(null);

    try {
      // 1. Sign in with Google using Firebase SDK
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Send the ID token to our server action
      const response = await loginWithGoogle(idToken);

      if (response.success) {
        if (response.role === 'ADMIN' || response.role === 'CO_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.error || 'Failed to sign in with Google');
      }
    } catch (err: any) {
      console.error('Firebase Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled.');
      } else {
        setError('Something went wrong with Google Login.');
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          backgroundColor: 'white',
          color: '#333',
          border: '1px solid #ddd',
          padding: '0.75rem',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.95rem',
          textTransform: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
        type="button"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          style={{ width: '20px', height: '20px' }} 
        />
        {isPending ? 'Connecting...' : 'Continue with Google'}
      </button>
      
      {error && (
        <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
