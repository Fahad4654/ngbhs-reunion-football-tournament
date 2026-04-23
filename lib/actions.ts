'use server';

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function handleSignOut() {
  await signOut();
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      return 'Please fill in all fields.';
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return 'User already exists with this email.';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return 'SUCCESS';
  } catch (error) {
    console.error(error);
    return 'Something went wrong.';
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
