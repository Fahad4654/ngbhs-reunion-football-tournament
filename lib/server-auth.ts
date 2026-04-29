import { cookies } from 'next/headers';
import prisma from './prisma';
import { decryptSession } from './auth-utils';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: 'ADMIN' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'USER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  occupation: string | null;
  workplace: string | null;
  phone: string | null;
  batchId: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
}

/**
 * Server-side helper: reads our custom session cookie,
 * decrypts it, and returns the user's DB record.
 * Returns null if not authenticated.
 */
export async function getServerUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return null;

    const payload = await decryptSession(sessionToken);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user) return null;

    return {
      uid: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      status: user.status,
      occupation: user.occupation,
      workplace: user.workplace,
      phone: user.phone,
      batchId: user.batchId,
      currentAddress: user.currentAddress,
      permanentAddress: user.permanentAddress,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
