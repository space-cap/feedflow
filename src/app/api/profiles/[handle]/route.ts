import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    handle: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { handle } = await context.params;
  const viewer = await getDemoUser();

  const user = await prisma.user.findFirst({
    where: {
      handle,
      deletedAt: null,
      status: "active"
    },
    select: {
      id: true,
      handle: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      isPrivate: true,
      followerConnections: {
        where: { status: "accepted" },
        select: { id: true }
      },
      followingConnections: {
        where: { status: "accepted" },
        select: { id: true }
      },
      posts: {
        where: {
          deletedAt: null,
          isHidden: false,
          parentPostId: null
        },
        select: { id: true }
      }
    }
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const relationship = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewer.id,
        followingId: user.id
      }
    },
    select: { status: true }
  });

  return NextResponse.json({
    data: {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      viewerRelationship: viewer.id === user.id ? "self" : relationship?.status ?? "none",
      counts: {
        posts: user.posts.length,
        followers: user.followerConnections.length,
        following: user.followingConnections.length
      }
    }
  });
}
