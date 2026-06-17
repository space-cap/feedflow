import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const user = await getRequiredUser();

  if (!user) {
    return unauthorized();
  }
  const body = (await request.json().catch(() => null)) as {
    displayName?: unknown;
    bio?: unknown;
    avatarUrl?: unknown;
    isPrivate?: unknown;
  } | null;

  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const bio = typeof body?.bio === "string" ? body.bio.trim() : "";
  const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";
  const isPrivate = Boolean(body?.isPrivate);

  if (!displayName || displayName.length > 40 || bio.length > 160) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "프로필 입력값을 확인해 주세요." } },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      isPrivate
    },
    select: {
      id: true,
      handle: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      isPrivate: true
    }
  });

  return NextResponse.json({ data: updated });
}
