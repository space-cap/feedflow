import { NextRequest, NextResponse } from "next/server";
import { getBlockedUserIds } from "@/lib/blocking";
import { getDemoUser } from "@/lib/demo-session";
import { normalizeHashtag } from "@/lib/hashtags";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const viewer = await getDemoUser();
  const blockedUserIds = await getBlockedUserIds(viewer.id);
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const tag = normalizeHashtag(request.nextUrl.searchParams.get("tag") ?? "");
  const postTextFilters = [
    ...(q ? [{ content: { contains: q } }] : []),
    ...(tag ? [{ content: { contains: `#${tag}` } }] : [])
  ];

  const [posts, users] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: {
          notIn: blockedUserIds
        },
        deletedAt: null,
        isHidden: false,
        parentPostId: null,
        visibility: "public",
        ...(postTextFilters.length > 0 ? { AND: postTextFilters } : {})
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
        id: {
          notIn: blockedUserIds
        },
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
