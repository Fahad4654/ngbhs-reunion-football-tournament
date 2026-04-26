'use server';

import prisma from '@/lib/prisma';
import {
  hashPassword,
  comparePassword,
  setSessionCookie,
  deleteSessionCookie,
} from '@/lib/auth-utils';
import { generateOTP, storeOTP, verifyOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mail';
import { adminAuth } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';

// ─────────────────────────────────────────
// Email / Password Auth
// ─────────────────────────────────────────

export async function loginWithEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { error: 'Invalid email or password.' };
    }

    if (!user.emailVerified) {
      return {
        error: 'Please verify your email address before logging in.',
        needsVerification: true,
        email: user.email,
      };
    }

    const passwordsMatch = await comparePassword(password, user.password);
    if (!passwordsMatch) {
      return { error: 'Invalid email or password.' };
    }

    await setSessionCookie(user.id, user.role, user.name);
    return { success: true, role: user.role };
  } catch (error) {
    console.error('[loginWithEmail]', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function registerWithEmail(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const batchId = formData.get('batchId') as string;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name, password: hashedPassword, batchId: batchId || null, status: 'PENDING' },
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          batchId: batchId || null,
          status: 'PENDING',
        },
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    return { success: true, otpSent: true, email };
  } catch (error) {
    console.error('[registerWithEmail]', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function verifyOTPAndRegister(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  try {
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return { error: 'Invalid or expired OTP.' };
    }

    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await setSessionCookie(user.id, user.role, user.name);
    return { success: true, role: user.role };
  } catch (error) {
    console.error('[verifyOTPAndRegister]', error);
    return { error: 'Failed to verify OTP. Please try again.' };
  }
}

export async function resendOTP(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return { error: 'Invalid request.' };
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    return { success: true, message: 'OTP resent successfully!' };
  } catch (error) {
    console.error('[resendOTP]', error);
    return { error: 'Failed to resend OTP.' };
  }
}

export async function logout() {
  await deleteSessionCookie();
  redirect('/login');
}

// ─────────────────────────────────────────
// Google OAuth
// ─────────────────────────────────────────

export async function loginWithGoogle(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return { error: 'Email not provided by Google.' };
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || null, image: picture || null, firebaseId: uid, role: 'USER' },
      });
    } else if (!user.firebaseId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseId: uid, image: user.image || picture },
      });
    }

    await setSessionCookie(user.id, user.role, user.name);
    return { success: true, role: user.role };
  } catch (error) {
    console.error('[loginWithGoogle]', error);
    return { error: 'Failed to authenticate with Google.' };
  }
}
