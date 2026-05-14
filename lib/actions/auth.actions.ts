'use server';

import prisma from '@/lib/prisma';
import {
  hashPassword,
  comparePassword,
  setSessionCookie,
  deleteSessionCookie,
} from '@/lib/auth-utils';
import { generateOTP, storeOTP, verifyOTP, verifyOTPNoDelete, deleteOTP } from '@/lib/otp';
import { sendOTPEmail, sendPasswordResetEmail } from '@/lib/mail';
import { adminAuth } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { generateUniqueUsername } from '@/lib/utils/username';

// ─────────────────────────────────────────
// Email / Password Auth
// ─────────────────────────────────────────

export async function loginWithEmail(prevState: any, formData: FormData) {
  const identifier = formData.get('email') as string; // We'll keep the form name 'email' for now or change it later
  const password = formData.get('password') as string;

  try {
    // Search by email, username, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user || !user.password) {
      return { error: 'Invalid credentials. Please check your username/email/phone and password.' };
    }

    if (!user.emailVerified) {
      return {
        error: 'Please verify your account before logging in.',
        needsVerification: true,
        email: user.email,
      };
    }

    const passwordsMatch = await comparePassword(password, user.password);
    if (!passwordsMatch) {
      return { error: 'Invalid credentials.' };
    }

    await setSessionCookie(user.id, user.role, user.name);
    return { success: true, role: user.role };
  } catch (error) {
    console.error('[loginWithEmail]', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function registerWithEmail(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const preferredUsername = formData.get('username') as string;
  const name = `${firstName} ${lastName}`.trim();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const batchId = formData.get('batchId') as string;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const username = await generateUniqueUsername(name, email, preferredUsername);

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name, firstName, lastName, username, password: hashedPassword, batchId: batchId || null, status: 'PENDING' },
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name,
          firstName,
          lastName,
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

    const nameParts = (name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!user) {
      const username = await generateUniqueUsername(name || email.split('@')[0], email);
      user = await prisma.user.create({
        data: { 
          email, 
          username,
          name: name || null, 
          firstName,
          lastName,
          image: picture || null, 
          firebaseId: uid, 
          role: 'USER',
          status: 'PENDING',
          emailVerified: new Date(),
        },
      });
    } else if (!user.firebaseId || !user.username) {
      const username = user.username || await generateUniqueUsername(user.name || email.split('@')[0], email);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          firebaseId: uid, 
          username,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          image: user.image || picture,
          // If the user already existed (e.g. invited or manual reg but not verified)
          // we ensure they are PENDING and verified
          status: user.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
          emailVerified: user.emailVerified || new Date(),
        },
      });
    }

    await setSessionCookie(user.id, user.role, user.name);
    return { success: true, role: user.role };
  } catch (error) {
    console.error('[loginWithGoogle]', error);
    return { error: 'Failed to authenticate with Google.' };
  }
}

// ─────────────────────────────────────────
// Password Reset
// ─────────────────────────────────────────

export async function sendPasswordResetOTP(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      // Return success anyway to avoid email enumeration
      return { success: true, email };
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendPasswordResetEmail(email, otp);

    return { success: true, email };
  } catch (error) {
    console.error('[sendPasswordResetOTP]', error);
    return { error: 'Failed to send reset email.' };
  }
}

export async function verifyPasswordResetOTP(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  try {
    const isValid = await verifyOTPNoDelete(email, otp);
    if (!isValid) {
      return { error: 'Invalid or expired OTP.' };
    }

    return { success: true, email, otp };
  } catch (error) {
    console.error('[verifyPasswordResetOTP]', error);
    return { error: 'Verification failed.' };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;

  try {
    const isValid = await verifyOTPNoDelete(email, otp);
    if (!isValid) {
      return { error: 'Invalid session or expired OTP. Please try again.' };
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await deleteOTP(email, otp);

    return { success: true };
  } catch (error) {
    console.error('[resetPassword]', error);
    return { error: 'Failed to reset password.' };
  }
}
