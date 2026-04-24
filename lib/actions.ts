'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Cookie expiration (14 days)
const EXPIRES_IN_MS = 60 * 60 * 24 * 14 * 1000;

export async function loginWithEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error?.message === 'INVALID_LOGIN_CREDENTIALS' || data.error?.message === 'INVALID_PASSWORD' || data.error?.message === 'EMAIL_NOT_FOUND') {
        return { error: 'Invalid email or password.' };
      }
      return { error: data.error?.message || 'Login failed.' };
    }

    // Exchange ID Token for a Session Cookie
    const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn: EXPIRES_IN_MS });
    
    // Set the cookie
    (await cookies()).set('firebase-session', sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function registerWithEmail(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // 1. Create user via Firebase Auth REST API
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error?.message === 'EMAIL_EXISTS') {
        return { error: 'An account with this email already exists.' };
      } else if (data.error?.message === 'WEAK_PASSWORD : Password should be at least 6 characters') {
        return { error: 'Password must be at least 6 characters.' };
      }
      return { error: data.error?.message || 'Registration failed.' };
    }

    const firebaseId = data.localId;
    const idToken = data.idToken;

    // 2. Set the display name in Firebase
    await adminAuth.updateUser(firebaseId, { displayName: name });

    // 3. Upsert user in our database
    await prisma.user.upsert({
      where: { firebaseId },
      update: { name },
      create: {
        firebaseId,
        email,
        name,
        role: 'USER',
      },
    });

    // 4. Create Session Cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
    
    // 5. Set cookie
    (await cookies()).set('firebase-session', sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function createSession(idToken: string) {
  try {
    // Verify the token first
    const decoded = await adminAuth.verifyIdToken(idToken);
    
    // Sync the user with our Prisma database
    await prisma.user.upsert({
      where: { firebaseId: decoded.uid },
      update: {
        name: decoded.name ?? undefined,
        image: decoded.picture ?? undefined,
      },
      create: {
        firebaseId: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name ?? decoded.email?.split('@')[0] ?? 'User',
        image: decoded.picture ?? null,
        role: 'USER',
      },
    });

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });

    // Set cookie
    (await cookies()).set('firebase-session', sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Session creation error:', error);
    return { error: 'Failed to establish session.' };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;

    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decoded.uid);
      cookieStore.delete('firebase-session');
    }
  } catch (error) {
    // Ignore errors if token is invalid or expired
    const cookieStore = await cookies();
    cookieStore.delete('firebase-session');
  }
}
