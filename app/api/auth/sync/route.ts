import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { firebaseId, email, name, image } = await req.json();

    if (decoded.uid !== firebaseId) {
      return NextResponse.json({ error: 'Token mismatch' }, { status: 403 });
    }

    // Upsert user into our database
    const user = await prisma.user.upsert({
      where: { firebaseId },
      update: {
        name: name ?? undefined,
        image: image ?? undefined,
      },
      create: {
        firebaseId,
        email: email ?? '',
        name: name ?? email?.split('@')[0] ?? 'User',
        image: image ?? null,
        role: 'USER',
      },
    });

    return NextResponse.json({
      uid: user.firebaseId,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    });
  } catch (error) {
    console.error('[auth/sync]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
