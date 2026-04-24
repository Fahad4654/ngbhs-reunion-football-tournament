import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import prisma from './prisma';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: 'ADMIN' | 'CO_ADMIN' | 'USER';
}

/**
 * Server-side helper: reads the Firebase session cookie,
 * verifies it, and returns the user's DB record (with role).
 * Returns null if not authenticated.
 */
export async function getServerUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);

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
