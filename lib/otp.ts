import prisma from '@/lib/prisma';
import { randomInt } from 'crypto';

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export async function storeOTP(email: string, otp: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Remove existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  // Store new token
  return await prisma.verificationToken.create({
    data: {
      email,
      token: otp,
      expires,
    },
  });
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      email,
      token: otp,
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return false;
  }

  // Delete the token after successful verification
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return true;
}
