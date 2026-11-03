import { NextResponse } from "next/server";
import { getBlockedUserIds } from "@/lib/blocking";
import { getDemoUser } from "@/lib/demo-session";
import { cursorWhere, decodeCursor, getNextCursor, parseLimit, trimPage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id: handle } = await context.params;
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const viewer = await getDemoUser();
  const blockedUserIds = await getBlockedUserIds(viewer.id);

  const user = await prisma.user.findFirst({
    where: {
      handle,
      deletedAt: null,
      status: "active"
    },
    select: {
      id: true
    }
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const followers = await prisma.follow.findMany({
    where: {
      followingId: user.id,
      status: "accepted",
      followerId: {
        notIn: blockedUserIds
      },
      ...cursorWhere(cursor)
    },
    include: {
      follower: {
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true,
          avatarUrl: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1
  });
  const pageItems = trimPage(followers, limit);
  const nextCursor = getNextCursor(followers, limit);

  return NextResponse.json({
    data: pageItems.map((follow) => ({
      id: follow.id,
      user: follow.follower,
      createdAt: follow.createdAt.toISOString()
    })),
    page: {
      nextCursor,
      hasNext: nextCursor !== null
    }
  });
}
