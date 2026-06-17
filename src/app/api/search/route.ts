import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const viewer = await getDemoUser();
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const [posts, users] = await Promise.all([
    prisma.post.findMany({
      where: {
        deletedAt: null,
        isHidden: false,
        parentPostId: null,
        visibility: "public",
        ...(q
          ? {
              content: {
                contains: q
              }
            }
          : {})
      },
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            bio: true,
            avatarUrl: true
          }
        },
        likes: {
          where: { userId: viewer.id },
          select: { id: true }
        },
        reposts: {
          where: { userId: viewer.id },
          select: { id: true }
        }
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "active",
        ...(q
          ? {
              OR: [
                { handle: { contains: q.toLowerCase() } },
                { displayName: { contains: q } },
                { bio: { contains: q } }
              ]
            }
          : {})
      },
      select: {
        id: true,
        handle: true,
        displayName: true,
        bio: true,
        avatarUrl: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return NextResponse.json({
    data: {
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        author: post.author,
        counts: {
          likes: post.likeCount,
          replies: post.replyCount,
          reposts: post.repostCount
        },
        viewerState: {
          liked: post.likes.length > 0,
          reposted: post.reposts.length > 0
        },
        createdAt: post.createdAt.toISOString()
      })),
      users
    }
  });
}
