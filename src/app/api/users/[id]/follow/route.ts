import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const limited = rateLimit(_request, {
    key: "users:follow",
    limit: 30,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  if (viewer.id === id) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "자기 자신은 팔로우할 수 없습니다." } },
      { status: 409 }
    );
  }

  const target = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
      status: "active"
    },
    select: {
      id: true,
      isPrivate: true
    }
  });

  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const status = target.isPrivate ? "pending" : "accepted";

  await prisma.$transaction(async (tx) => {
    await tx.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: viewer.id,
          followingId: target.id
        }
      },
      update: { status },
      create: {
        followerId: viewer.id,
        followingId: target.id,
        status
      }
    });

    await tx.notification.create({
      data: {
        receiverId: target.id,
        actorId: viewer.id,
        type: "follow"
      }
    });
  });

  return NextResponse.json({
    data: {
      status
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: viewer.id,
      followingId: id
    }
  });

  return NextResponse.json({
    data: {
      following: false
    }
  });
}
