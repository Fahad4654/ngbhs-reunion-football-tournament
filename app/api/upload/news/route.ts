import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_SIZE = 1024 * 1024 * 1024; // 1 GB

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isVideoExt = ["mp4", "webm", "mov", "avi", "mkv", "m4v"].includes(ext);
    const isImageExt = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !isVideoExt && !isImageExt) {
      return NextResponse.json({ error: "Invalid file type. Please upload a valid image or video file." }, { status: 400 });
    }
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 50 MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${user.uid.slice(0, 8)}.${ext || "png"}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "news");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/news/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error in API route:", error);
    return NextResponse.json({ error: "Failed to upload file to the server." }, { status: 500 });
  }
}
