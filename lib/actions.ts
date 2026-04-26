'use server';

import prisma from '@/lib/prisma';
import { hashPassword, comparePassword, setSessionCookie, deleteSessionCookie } from './auth-utils';
import { getServerUser } from './server-auth';
import { redirect } from 'next/navigation';
import { generateOTP, storeOTP, verifyOTP } from './otp';
import { sendOTPEmail } from './mail';

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

    if (!user.emailVerified) {
      return { 
        error: 'Please verify your email address before logging in.',
        needsVerification: true,
        email: user.email 
      };
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
  const batchId = formData.get('batchId') as string;

  try {
    // 1. Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with this email already exists.' };
    }

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create or update unverified user
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
          batchId: batchId || null,
          status: 'PENDING',
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          batchId: batchId || null,
          status: 'PENDING',
        },
      });
    }

    // 4. Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // 5. Send OTP email
    await sendOTPEmail(email, otp);

    return { success: true, otpSent: true, email };
  } catch (error) {
    console.error('Registration error:', error);
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

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Set session cookie
    await setSessionCookie(user.id, user.role, user.name);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { error: 'Failed to verify OTP. Please try again.' };
  }
}

export async function resendOTP(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.emailVerified) {
      return { error: 'Invalid request.' };
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    return { success: true, message: 'OTP resent successfully!' };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { error: 'Failed to resend OTP.' };
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
    const currentAddress = formData.get('currentAddress') as string;
    const permanentAddress = formData.get('permanentAddress') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    let finalImageUrl = user.image;

    // Fetch full user from DB to know the existing image URL
    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });

    if (profilePicture && profilePicture.size > 0) {
      if (profilePicture.size > 5 * 1024 * 1024) {
        return { error: 'Profile picture must be under 5MB.' };
      }

      const { unlink, mkdir } = await import('fs/promises');
      const { createWriteStream } = await import('fs');
      const path = await import('path');

      const baseUploadsDir = path.join(process.cwd(), 'public/uploads');
      const profilesUploadsDir = path.join(baseUploadsDir, 'profiles');
      await mkdir(profilesUploadsDir, { recursive: true });

      // 1. Delete old image if it's stored locally
      if (dbUser?.image && dbUser.image.startsWith('/uploads/')) {
        const oldFilename = dbUser.image.replace('/uploads/', '');
        const oldFilePath = path.join(baseUploadsDir, oldFilename);
        try {
          await unlink(oldFilePath);
        } catch (err) {
          console.error(`Failed to delete old profile picture ${oldFilePath}:`, err);
        }
      }

      // 2. Save new image
      const filename = `profile-${user.uid}-${Date.now()}-${profilePicture.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(profilesUploadsDir, filename);

      const fileStream = createWriteStream(uploadPath);
      const reader = profilePicture.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(value);
      }
      fileStream.end();

      finalImageUrl = `/uploads/profiles/${filename}`;
    }

    await prisma.user.update({
      where: { id: user.uid },
      data: {
        name,
        occupation,
        workplace,
        phone,
        batchId: batchId || null,
        image: finalImageUrl || null,
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
import { createWriteStream } from 'fs';
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

    if (imageFiles.length + videoFiles.length > 50) {
      return { error: 'You can only upload a maximum of 50 images/videos per post.' };
    }

    const mediaData: { type: 'IMAGE' | 'VIDEO', url: string }[] = [];

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public/uploads/posts');
    await mkdir(uploadsDir, { recursive: true });

    // Handle Multiple Images
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return { error: `Image "${file.name}" exceeds the 10MB limit.` };
        }
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(uploadsDir, filename);
        
        const fileStream = createWriteStream(uploadPath);
        const reader = file.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileStream.write(value);
        }
        fileStream.end();
        
        mediaData.push({ type: 'IMAGE', url: `/uploads/posts/${filename}` });
      }
    }

    // Handle Multiple Videos
    for (const file of videoFiles) {
      if (file && file.size > 0) {
        if (file.size > 1024 * 1024 * 1024) {
          return { error: `Video "${file.name}" exceeds the 1GB limit.` };
        }
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(uploadsDir, filename);
        
        const fileStream = createWriteStream(uploadPath);
        const reader = file.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileStream.write(value);
        }
        fileStream.end();
        
        mediaData.push({ type: 'VIDEO', url: `/uploads/posts/${filename}` });
      }
    }

    const scope = formData.get('scope') as 'GLOBAL' | 'BATCH' || 'GLOBAL';

    await prisma.post.create({
      data: {
        title: title || null,
        content,
        authorId: user.uid,
        status: 'PENDING',
        scope: scope,
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
    if (!user) return { error: 'Unauthorized.' };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) return { error: 'Post not found.' };

    let isAuthorized = user.role === 'ADMIN' || user.role === 'CO_ADMIN';
    
    if (!isAuthorized && user.role === 'BATCH_MANAGER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
      if (dbUser?.batchId === post.author.batchId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) return { error: 'Unauthorized.' };

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'APPROVED' },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/posts');
    revalidatePath('/dashboard/manage-batch');
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
    if (!user) return { error: 'Unauthorized.' };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) return { error: 'Post not found.' };

    let isAuthorized = user.role === 'ADMIN' || user.role === 'CO_ADMIN';
    
    if (!isAuthorized && user.role === 'BATCH_MANAGER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
      if (dbUser?.batchId === post.author.batchId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) return { error: 'Unauthorized.' };

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'REJECTED' },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/posts');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error) {
    console.error('Reject post error:', error);
    return { error: 'Failed to reject post.' };
  }
}

export async function getPendingPosts() {
  try {
    const user = await getServerUser();
    if (!user) return [];

    let whereClause: any = { status: 'PENDING' };

    if (user.role === 'BATCH_MANAGER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
      if (!dbUser?.batchId) return [];
      whereClause = {
        status: 'PENDING',
        author: { batchId: dbUser.batchId }
      };
    } else if (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN') {
      return [];
    }

    return await prisma.post.findMany({
      where: whereClause,
      include: { 
        author: true,
        media: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get pending posts error:', error);
    return [];
  }
}

export async function getApprovedPosts(batchId?: string) {
  try {
    const user = await getServerUser();
    
    // Check if user is approved if they are trying to see batch-specific activity
    if (batchId) {
      if (!user) return []; // Guests cannot see batch activity
      
      const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
      if (dbUser?.status !== 'APPROVED') {
        return []; // Return empty if not approved
      }
    }
    
    let whereClause: any = { status: 'APPROVED' };
    
    if (batchId) {
      whereClause = {
        status: 'APPROVED',
        author: { batchId: batchId }
      };
    } else {
      // Global feed: only show GLOBAL scope posts
      whereClause = {
        status: 'APPROVED',
        scope: 'GLOBAL'
      };
    }

    return await prisma.post.findMany({
      where: whereClause,
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

export async function deletePostAction(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) return { error: 'Post not found.' };

    const isAuthorized = user.role === 'ADMIN' || user.role === 'CO_ADMIN' || user.uid === post.authorId;
    if (!isAuthorized) {
      return { error: 'Unauthorized. You can only delete your own posts.' };
    }

    // Delete associated media files from physical storage
    if (post.media && post.media.length > 0) {
      const { unlink } = await import('fs/promises');
      for (const item of post.media) {
        if (item.url && item.url.startsWith('/uploads/')) {
          const filename = item.url.replace('/uploads/', '');
          const filePath = path.join(process.cwd(), 'public/uploads', filename);
          try {
            await unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete physical file ${filePath}:`, err);
          }
        }
      }
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Delete post error:', error);
    return { error: 'Failed to delete post.' };
  }
}

export async function editPostAction(postId: string, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const removedMediaIds = formData.getAll('removedMediaIds') as string[];
    const imageFiles = formData.getAll('imageFiles') as File[];
    const videoFiles = formData.getAll('videoFiles') as File[];

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) return { error: 'Post not found.' };

    const isAuthorized = user.role === 'ADMIN' || user.role === 'CO_ADMIN' || user.uid === post.authorId;
    if (!isAuthorized) {
      return { error: 'Unauthorized. You can only edit your own posts.' };
    }

    if (!content || content.trim() === '') {
      return { error: 'Post content is required.' };
    }

    const { unlink, mkdir } = await import('fs/promises');
    const { createWriteStream } = await import('fs');
    const baseUploadsDir = path.join(process.cwd(), 'public/uploads');
    const postsUploadsDir = path.join(baseUploadsDir, 'posts');
    await mkdir(postsUploadsDir, { recursive: true });

    // 1. Handle Removed Media
    if (removedMediaIds.length > 0) {
      const mediaToRemove = post.media.filter(m => removedMediaIds.includes(m.id));
      for (const item of mediaToRemove) {
        if (item.url && item.url.startsWith('/uploads/')) {
          const filename = item.url.replace('/uploads/', '');
          const filePath = path.join(baseUploadsDir, filename);
          try { await unlink(filePath); } catch (err) { console.error(`Failed to delete file ${filePath}:`, err); }
        }
      }
      await prisma.media.deleteMany({
        where: { id: { in: removedMediaIds }, postId }
      });
    }

    // 2. Handle New Media
    const mediaData: { type: 'IMAGE' | 'VIDEO', url: string }[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) return { error: `Image "${file.name}" exceeds 10MB limit.` };
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(postsUploadsDir, filename);
        
        const fileStream = createWriteStream(uploadPath);
        const reader = file.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileStream.write(value);
        }
        fileStream.end();
        mediaData.push({ type: 'IMAGE', url: `/uploads/posts/${filename}` });
      }
    }

    for (const file of videoFiles) {
      if (file && file.size > 0) {
        if (file.size > 1024 * 1024 * 1024) return { error: `Video "${file.name}" exceeds 1GB limit.` };
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(postsUploadsDir, filename);
        
        const fileStream = createWriteStream(uploadPath);
        const reader = file.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileStream.write(value);
        }
        fileStream.end();
        mediaData.push({ type: 'VIDEO', url: `/uploads/posts/${filename}` });
      }
    }

    // 3. Update Post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title: title || null,
        content,
        media: {
          create: mediaData
        }
      },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Edit post error:', error);
    return { error: 'Failed to edit post.' };
  }
}

export async function updateUserRoleAction(userId: string, newRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'ADMIN') {
  try {
    const requester = await getServerUser();
    const isAuthorized = requester?.role === 'ADMIN' || requester?.role === 'CO_ADMIN';

    if (!isAuthorized) {
      return { error: 'Unauthorized. Only Admins and Co-Admins can change roles.' };
    }

    if (userId === requester.uid) {
      return { error: 'You cannot change your own role.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: 'User not found.' };

    // Prevent CO_ADMIN from modifying ADMIN
    if (requester.role === 'CO_ADMIN' && targetUser.role === 'ADMIN') {
      return { error: 'Unauthorized. Co-Admins cannot modify root Admins.' };
    }

    // Special check for BATCH_MANAGER: Only one per batch
    if (newRole === 'BATCH_MANAGER') {
      if (!targetUser.batchId) {
        return { error: 'User must belong to a batch to become a Batch Manager.' };
      }

      const existingManager = await prisma.user.findFirst({
        where: {
          batchId: targetUser.batchId,
          role: 'BATCH_MANAGER',
          id: { not: userId }
        }
      });

      if (existingManager) {
        return { error: `Batch already has a manager: ${existingManager.name || existingManager.email}. Please demote them first.` };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Update user role error:', error);
    return { error: error.message || 'Failed to update user role.' };
  }
}

export async function getPendingBatchMembers() {
  try {
    const user = await getServerUser();
    if (user?.role !== 'BATCH_MANAGER') return [];

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser?.batchId) return [];

    return await prisma.user.findMany({
      where: {
        batchId: dbUser.batchId,
        status: 'PENDING',
        emailVerified: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Get pending batch members error:', error);
    return [];
  }
}

export async function approveUserAction(userId: string) {
  try {
    const manager = await getServerUser();
    if (manager?.role !== 'BATCH_MANAGER' && manager?.role !== 'ADMIN' && manager?.role !== 'CO_ADMIN') {
      return { error: 'Unauthorized.' };
    }

    const userToApprove = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToApprove) return { error: 'User not found.' };

    // Batch Manager can only approve members of their own batch
    if (manager.role === 'BATCH_MANAGER') {
      const dbManager = await prisma.user.findUnique({ where: { id: manager.uid } });
      if (dbManager?.batchId !== userToApprove.batchId) {
        return { error: 'You can only approve members of your own batch.' };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'APPROVED' }
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error) {
    console.error('Approve user error:', error);
    return { error: 'Failed to approve user.' };
  }
}

export async function rejectUserAction(userId: string) {
  try {
    const manager = await getServerUser();
    if (manager?.role !== 'BATCH_MANAGER' && manager?.role !== 'ADMIN' && manager?.role !== 'CO_ADMIN') {
      return { error: 'Unauthorized.' };
    }

    const userToReject = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToReject) return { error: 'User not found.' };

    if (manager.role === 'BATCH_MANAGER') {
      const dbManager = await prisma.user.findUnique({ where: { id: manager.uid } });
      if (dbManager?.batchId !== userToReject.batchId) {
        return { error: 'You can only reject members of your own batch.' };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' }
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error) {
    console.error('Reject user error:', error);
    return { error: 'Failed to reject user.' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const requester = await getServerUser();
    const isAuthorized = requester?.role === 'ADMIN' || requester?.role === 'CO_ADMIN';

    if (!isAuthorized) {
      return { error: 'Unauthorized. Only Admins and Co-Admins can delete users.' };
    }

    if (userId === requester.uid) {
      return { error: 'You cannot delete yourself.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: 'User not found.' };

    // Prevent CO_ADMIN from deleting ADMIN
    if (requester.role === 'CO_ADMIN' && targetUser.role === 'ADMIN') {
      return { error: 'Unauthorized. Co-Admins cannot delete root Admins.' };
    }

    const userPosts = await prisma.post.findMany({
      where: { authorId: userId },
      select: { id: true }
    });

    for (const post of userPosts) {
      await deletePostAction(post.id);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return { error: error.message || 'Failed to delete user.' };
  }
}
