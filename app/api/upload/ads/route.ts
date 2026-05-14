import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size allowed is 2 MB." }, { status: 400 });
    }

    const isMedia = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isMedia) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image, GIF, or video file." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads", "ads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/ads/${filename}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload Ad Media Error:", error);
    return NextResponse.json({ error: "Failed to upload file to the server." }, { status: 500 });
  }
}

