import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-at-least-32-chars-long');

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

export async function encryptSession(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(SECRET);
}

export async function decryptSession(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, SECRET, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(userId: string, role: string, name: string | null) {
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  const session = await encryptSession({ userId, role, name, expires });

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
    sameSite: 'lax',
  });
}

export async function deleteSessionCookie() {
  (await cookies()).delete('session');
}
