import prisma from "@/lib/prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueUsername(name: string, email: string, preferred?: string): Promise<string> {
  // 0. Try preferred username if provided
  if (preferred && preferred.trim().length >= 3) {
    const slugifiedPreferred = slugify(preferred);
    const existing = await prisma.user.findUnique({
      where: { username: slugifiedPreferred }
    });
    if (!existing) {
      return slugifiedPreferred;
    }
  }

  // 1. Try name-based slug
  let username = slugify(name);
  
  if (!username || username.length < 3) {
    username = slugify(email.split('@')[0]);
  }

  const existingByName = await prisma.user.findUnique({
    where: { username }
  });

  if (!existingByName) {
    return username;
  }

  // 2. If name-based taken, try email-based slug
  const emailPrefix = email.split('@')[0];
  username = slugify(emailPrefix);

  const existingByEmail = await prisma.user.findUnique({
    where: { username }
  });

  if (!existingByEmail) {
    return username;
  }

  // 3. If both taken, add random numbers until unique
  let isUnique = false;
  let finalUsername = username;
  let counter = 1;

  while (!isUnique) {
    const randomSuffix = Math.floor(Math.random() * 1000);
    finalUsername = `${username}${randomSuffix}`;
    
    const existing = await prisma.user.findUnique({
      where: { username: finalUsername }
    });

    if (!existing) {
      isUnique = true;
    }
    
    // Safety break
    if (counter > 10) {
      finalUsername = `${username}${Date.now().toString().slice(-4)}`;
      break;
    }
    counter++;
  }

  return finalUsername;
}
