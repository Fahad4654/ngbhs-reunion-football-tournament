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

// Placeholder for Google Auth (requires manual OAuth implementation if not using Firebase/NextAuth)
export async function createSession(idToken: string) {
  return { error: 'Google Login is currently disabled. Please use email/password.' };
}
