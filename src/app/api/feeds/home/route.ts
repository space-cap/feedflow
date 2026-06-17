import { NextResponse } from "next/server";
import { getBlockedUserIds } from "@/lib/blocking";
import { getDemoUser } from "@/lib/demo-session";
import { cursorWhere, decodeCursor, getNextCursor, parseLimit, trimPage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const viewer = await getDemoUser();
  const blockedUserIds = await getBlockedUserIds(viewer.id);
  const following = await prisma.follow.findMany({
    where: {
      followerId: viewer.id,
      status: "accepted"
    },
    select: {
      followingId: true
    }
  });
  const authorIds = [viewer.id, ...following.map((follow) => follow.followingId)];
  const visibleAuthorIds = authorIds.filter((authorId) => !blockedUserIds.includes(authorId));

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: visibleAuthorIds
      },
      deletedAt: null,
      isHidden: false,
      parentPostId: null,
      ...cursorWhere(cursor)
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
        where: {
          userId: viewer.id
        },
        select: {
          id: true
        }
      },
      reposts: {
        where: {
          userId: viewer.id
        },
        select: {
          id: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1
  });
  const pageItems = trimPage(posts, limit);
  const nextCursor = getNextCursor(posts, limit);

  return NextResponse.json({
    data: pageItems.map((post) => ({
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
    page: {
      nextCursor,
      hasNext: nextCursor !== null
    }
  });
}
