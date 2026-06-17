import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getDemoUser();

  if (viewer.id === id) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "자기 자신은 차단할 수 없습니다." } },
      { status: 409 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: viewer.id,
          blockedId: id
        }
      },
      update: {},
      create: {
        blockerId: viewer.id,
        blockedId: id
      }
    });

    await tx.follow.deleteMany({
      where: {
        OR: [
          { followerId: viewer.id, followingId: id },
          { followerId: id, followingId: viewer.id }
        ]
      }
    });
  });

  return NextResponse.json({ data: { blocked: true } });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getDemoUser();

  await prisma.block.deleteMany({
    where: {
      blockerId: viewer.id,
      blockedId: id
    }
  });

  return NextResponse.json({ data: { blocked: false } });
}
