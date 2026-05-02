import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "BATCH_MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP, GIF or SVG." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename: {timestamp}-{userId}.{ext}
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filename = `${Date.now()}-${user.uid.slice(0, 8)}.${ext}`;

  const uploadDir = join(process.cwd(), "public", "uploads", "batch-logo");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  const publicUrl = `/uploads/batch-logo/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
