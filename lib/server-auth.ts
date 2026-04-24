import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import prisma from './prisma';
import type { AppUser } from './auth-context';

/**
 * Server-side helper: reads the Firebase ID token from the cookie,
 * verifies it, and returns the user's DB record (with role).
 * Returns null if not authenticated.
 */
export async function getServerUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseId: decoded.uid },
    });

    if (!user) return null;

    return {
      uid: user.firebaseId,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  } catch {
    return null;
  }
}
