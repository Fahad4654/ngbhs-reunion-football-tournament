'use server';

import prisma from '@/lib/prisma';
import { hashPassword, comparePassword, setSessionCookie, deleteSessionCookie } from './auth-utils';
import { getServerUser } from './server-auth';
import { redirect } from 'next/navigation';

export async function loginWithEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: 'Invalid email or password.' };
    }

    const passwordsMatch = await comparePassword(password, user.password);

    if (!passwordsMatch) {
      return { error: 'Invalid email or password.' };
    }

    // Set the session cookie
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function registerWithEmail(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'An account with this email already exists.' };
    }

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create user in our database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    // 4. Set session cookie
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logout() {
  await deleteSessionCookie();
  redirect('/login');
}

import { adminAuth } from './firebase-admin';

export async function loginWithGoogle(idToken: string) {
  try {
    // 1. Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return { error: 'Email not provided by Google.' };
    }

    // 2. Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          image: picture || null,
          firebaseId: uid,
          role: 'USER',
        },
      });
    } else if (!user.firebaseId) {
      // Link firebaseId if it's the first time they use Google but account exists
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseId: uid, image: user.image || picture },
      });
    }

    // 3. Set the session cookie (same as manual login)
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Google login error:', error);
    return { error: 'Failed to authenticate with Google.' };
  }
}

export async function getAllBatches() {
  try {
    return await prisma.batch.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
}

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const name = formData.get('name') as string;
    const occupation = formData.get('occupation') as string;
    const workplace = formData.get('workplace') as string;
    const phone = formData.get('phone') as string;
    const batchId = formData.get('batchId') as string;
    const image = formData.get('image') as string;
    const currentAddress = formData.get('currentAddress') as string;
    const permanentAddress = formData.get('permanentAddress') as string;

    await prisma.user.update({
      where: { id: user.uid },
      data: {
        name,
        occupation,
        workplace,
        phone,
        batchId: batchId || null,
        image: image || null,
        currentAddress,
        permanentAddress,
      },
    });

    // Refresh the session cookie with the new name
    await setSessionCookie(user.uid, user.role, name);

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/profile');

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Failed to update profile.' };
  }
}

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function createPost(prevState: any, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'You must be logged in to create a post.' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFiles = formData.getAll('imageFiles') as File[];
    const videoFiles = formData.getAll('videoFiles') as File[];

    if (!content) {
      return { error: 'Post content is required.' };
    }

    const mediaData: { type: 'IMAGE' | 'VIDEO', url: string }[] = [];

    // Handle Multiple Images
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
        await writeFile(uploadPath, buffer);
        mediaData.push({ type: 'IMAGE', url: `/uploads/${filename}` });
      }
    }

    // Handle Multiple Videos
    for (const file of videoFiles) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
        await writeFile(uploadPath, buffer);
        mediaData.push({ type: 'VIDEO', url: `/uploads/${filename}` });
      }
    }

    await prisma.post.create({
      data: {
        title: title || null,
        content,
        authorId: user.uid,
        status: 'PENDING',
        media: {
          create: mediaData,
        },
      },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Create post error:', error);
    return { error: 'Failed to create post. Please try again.' };
  }
}

export async function approvePost(postId: string) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
      return { error: 'Unauthorized.' };
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'APPROVED' },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Approve post error:', error);
    return { error: 'Failed to approve post.' };
  }
}

export async function rejectPost(postId: string) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
      return { error: 'Unauthorized.' };
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'REJECTED' },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/posts');

    return { success: true };
  } catch (error) {
    console.error('Reject post error:', error);
    return { error: 'Failed to reject post.' };
  }
}

export async function getPendingPosts() {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
      return [];
    }

    return await prisma.post.findMany({
      where: { status: 'PENDING' },
      include: { author: true, media: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get pending posts error:', error);
    return [];
  }
}

export async function getApprovedPosts() {
  try {
    const user = await getServerUser();
    return await prisma.post.findMany({
      where: { status: 'APPROVED' },
      include: { 
        author: true,
        media: true,
        cheers: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get approved posts error:', error);
    return [];
  }
}

export async function toggleCheer(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const existingCheer = await prisma.cheer.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.uid,
        },
      },
    });

    if (existingCheer) {
      await prisma.cheer.delete({
        where: { id: existingCheer.id },
      });
    } else {
      await prisma.cheer.create({
        data: {
          postId,
          userId: user.uid,
        },
      });
    }

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Toggle cheer error:', error);
    return { error: 'Failed to update cheer.' };
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    if (!content || content.trim() === '') {
      return { error: 'Comment cannot be empty.' };
    }

    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.uid,
      },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Add comment error:', error);
    return { error: 'Failed to add comment.' };
  }
}

export async function getMyPosts() {
  try {
    const user = await getServerUser();
    if (!user) return [];

    return await prisma.post.findMany({
      where: { authorId: user.uid },
      include: {
        media: true,
        _count: {
          select: { cheers: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    return [];
  }
}

export async function getUserActivity() {
  try {
    const user = await getServerUser();
    if (!user) return null;

    const [posts, cheers, comments] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: user.uid },
        include: { media: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.cheer.findMany({
        where: { userId: user.uid },
        include: { post: { include: { media: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.comment.findMany({
        where: { authorId: user.uid },
        include: { post: { include: { media: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return { posts, cheers, comments };
  } catch (error) {
    console.error('Get user activity error:', error);
    return null;
  }
}
