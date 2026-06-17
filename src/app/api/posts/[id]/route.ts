import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false
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
      replies: {
        where: {
          deletedAt: null,
          isHidden: false
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
        orderBy: [{ createdAt: "asc" }, { id: "asc" }]
      }
    }
  });

  if (!post) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "게시글을 찾을 수 없습니다."
        }
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      id: post.id,
      content: post.content,
      author: post.author,
      counts: {
        likes: post.likeCount,
        replies: post.replyCount,
        reposts: post.repostCount
      },
      createdAt: post.createdAt.toISOString(),
      replies: post.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        author: reply.author,
        counts: {
          likes: reply.likeCount,
          replies: reply.replyCount,
          reposts: reply.repostCount
        },
        createdAt: reply.createdAt.toISOString()
      }))
    }
  });
}
