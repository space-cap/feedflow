import { NextRequest, NextResponse } from "next/server";
import { forbidden, getRequiredAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const admin = await getRequiredAdmin();

  if (!admin) {
    return forbidden();
  }
  const body = (await request.json().catch(() => null)) as { note?: unknown } | null;
  const note = typeof body?.note === "string" ? body.note : null;

  const post = await prisma.post.update({
    where: { id },
    data: {
      isHidden: true
    },
    select: {
      id: true
    }
  });

  await prisma.moderationAction.create({
    data: {
      adminId: admin.id,
      targetType: "post",
      targetId: post.id,
      action: "hide_post",
      note
    }
  });

  return NextResponse.json({
    data: {
      hidden: true
    }
  });
}
