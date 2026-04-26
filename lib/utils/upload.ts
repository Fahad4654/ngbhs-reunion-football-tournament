import path from 'path';
import { mkdir, unlink } from 'fs/promises';
import { createWriteStream } from 'fs';

/**
 * Saves a File to `public/uploads/{subDir}/` and returns the public URL.
 * @param file - The File object to save.
 * @param subDir - Subdirectory under `public/uploads/` (e.g. 'posts', 'profiles').
 * @param prefix - Optional filename prefix.
 */
export async function saveFile(
  file: File,
  subDir: string,
  prefix = ''
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subDir);
  await mkdir(uploadsDir, { recursive: true });

  const safeName = file.name.replace(/\s+/g, '-');
  const filename = `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`;
  const uploadPath = path.join(uploadsDir, filename);

  const fileStream = createWriteStream(uploadPath);
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fileStream.write(value);
  }
  fileStream.end();

  return `/uploads/${subDir}/${filename}`;
}

/**
 * Deletes a file from disk given its public URL (e.g. `/uploads/posts/file.jpg`).
 * Silently ignores errors if the file doesn't exist.
 */
export async function deleteFile(url: string): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  const relativePath = url.replace('/uploads/', '');
  const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);
  try {
    await unlink(filePath);
  } catch (err) {
    console.error(`[deleteFile] Could not delete ${filePath}:`, err);
  }
}
