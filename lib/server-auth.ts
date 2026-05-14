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
  birthday: Date | null;
  maritalStatus: string | null;
  gender: string | null;
  education: any;
  youtubeUrl: string | null;
  bio: string | null;
  nicknames: string[];
  privacySettings: any;
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
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      image: user.image,
      role: user.role as any,
      status: user.status as any,
      occupation: user.occupation,
      workplace: user.workplace,
      phone: user.phone,
      batchId: user.batchId,
      currentAddress: user.currentAddress,
      permanentAddress: user.permanentAddress,
      secondaryEmail: user.secondaryEmail,
      whatsappNo: user.whatsappNo,
      facebookUrl: user.facebookUrl,
      instagramUrl: user.instagramUrl,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      websiteUrl: user.websiteUrl,
      birthday: user.birthday,
      maritalStatus: user.maritalStatus,
      gender: user.gender,
      education: user.education,
      youtubeUrl: user.youtubeUrl,
      bio: user.bio,
      nicknames: user.nicknames,
      privacySettings: user.privacySettings,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
