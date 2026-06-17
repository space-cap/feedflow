import { NextResponse } from "next/server";
import { getBlockedUserIds } from "@/lib/blocking";
import { getDemoUser } from "@/lib/demo-session";
import { normalizeHashtag } from "@/lib/hashtags";
import { cursorWhere, decodeCursor, getNextCursor, parseLimit, trimPage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const tag = normalizeHashtag(url.searchParams.get("tag") ?? "");
  const viewer = await getDemoUser();
  const blockedUserIds = await getBlockedUserIds(viewer.id);

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        notIn: blockedUserIds
      },
      deletedAt: null,
      isHidden: false,
      parentPostId: null,
      visibility: "public",
      ...(tag ? { content: { contains: `#${tag}` } } : {}),
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
      createdAt: post.createdAt.toISOString()
    })),
    page: {
      nextCursor,
      hasNext: nextCursor !== null
    }
  });
}
