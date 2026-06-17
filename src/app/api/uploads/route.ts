import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "uploads:create",
    limit: 10,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const user = await getRequiredUser();

  if (!user) {
    return unauthorized();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "PNG, JPEG, WebP, GIF 이미지만 업로드할 수 있습니다." } },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "이미지는 2MB 이하만 업로드할 수 있습니다." } },
      { status: 400 }
    );
  }

  const extension = extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${user.id}-${Date.now()}${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const uploadPath = join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    data: {
      url: `/uploads/${filename}`
    }
  });
}
