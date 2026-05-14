import { cookies } from 'next/headers';
import prisma from './prisma';
import { decryptSession } from './auth-utils';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: 'ADMIN' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'USER' | 'SCORER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  occupation: string | null;
  workplace: string | null;
  phone: string | null;
  batchId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  secondaryEmail: string | null;
  whatsappNo: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
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
    const anyUser = user as any;

    return {
      uid: anyUser.id,
      email: anyUser.email,
      name: anyUser.name,
      firstName: anyUser.firstName,
      lastName: anyUser.lastName,
      username: anyUser.username,
      image: anyUser.image,
      role: anyUser.role,
      status: anyUser.status,
      occupation: anyUser.occupation,
      workplace: anyUser.workplace,
      phone: anyUser.phone,
      batchId: anyUser.batchId,
      currentAddress: anyUser.currentAddress,
      permanentAddress: anyUser.permanentAddress,
      secondaryEmail: anyUser.secondaryEmail,
      whatsappNo: anyUser.whatsappNo,
      facebookUrl: anyUser.facebookUrl,
      instagramUrl: anyUser.instagramUrl,
      linkedinUrl: anyUser.linkedinUrl,
      githubUrl: anyUser.githubUrl,
      websiteUrl: anyUser.websiteUrl,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
