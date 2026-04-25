'use server';

import prisma from '@/lib/prisma';
import { hashPassword, comparePassword, setSessionCookie, deleteSessionCookie } from './auth-utils';
import { redirect } from 'next/navigation';

export async function loginWithEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: 'Invalid email or password.' };
    }

    const passwordsMatch = await comparePassword(password, user.password);

    if (!passwordsMatch) {
      return { error: 'Invalid email or password.' };
    }

    // Set the session cookie
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
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
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'An account with this email already exists.' };
    }

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create user in our database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    // 4. Set session cookie
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logout() {
  await deleteSessionCookie();
  redirect('/login');
}

import { adminAuth } from './firebase-admin';

export async function loginWithGoogle(idToken: string) {
  try {
    // 1. Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return { error: 'Email not provided by Google.' };
    }

    // 2. Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          image: picture || null,
          firebaseId: uid,
          role: 'USER',
        },
      });
    } else if (!user.firebaseId) {
      // Link firebaseId if it's the first time they use Google but account exists
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseId: uid, image: user.image || picture },
      });
    }

    // 3. Set the session cookie (same as manual login)
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Google login error:', error);
    return { error: 'Failed to authenticate with Google.' };
  }
}
