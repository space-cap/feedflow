import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const deleted = await prisma.follow.deleteMany({
    where: {
      id,
      followingId: viewer.id,
      status: "pending"
    }
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "팔로우 요청을 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: { status: "rejected" } });
}
