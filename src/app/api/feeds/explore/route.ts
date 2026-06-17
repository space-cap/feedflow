import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      isHidden: false,
      parentPostId: null,
      visibility: "public"
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
    take: 20
  });

  return NextResponse.json({
    data: posts.map((post) => ({
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
      nextCursor: null,
      hasNext: false
    }
  });
}
