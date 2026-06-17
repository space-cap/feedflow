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

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false
    },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "게시글을 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.repost.findUnique({
      where: {
        userId_postId: {
          userId: viewer.id,
          postId: post.id
        }
      }
    });

    if (!existing) {
      const repostPost = await tx.post.create({
        data: {
          authorId: viewer.id,
          repostOfPostId: post.id,
          content: "",
          visibility: "public",
          isHidden: true
        },
        select: { id: true }
      });

      await tx.repost.create({
        data: {
          userId: viewer.id,
          postId: post.id,
          repostPostId: repostPost.id
        }
      });

      await tx.post.update({
        where: { id: post.id },
        data: {
          repostCount: {
            increment: 1
          }
        }
      });

      if (post.authorId !== viewer.id) {
        await tx.notification.create({
          data: {
            receiverId: post.authorId,
            actorId: viewer.id,
            type: "repost",
            postId: post.id
          }
        });
      }
    }

    return tx.post.findUniqueOrThrow({
      where: { id: post.id },
      select: { repostCount: true }
    });
  });

  return NextResponse.json({
    data: {
      reposted: true,
      repostCount: result.repostCount
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getDemoUser();

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "게시글을 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.repost.findUnique({
      where: {
        userId_postId: {
          userId: viewer.id,
          postId: post.id
        }
      }
    });

    if (existing) {
      await tx.repost.delete({
        where: {
          userId_postId: {
            userId: viewer.id,
            postId: post.id
          }
        }
      });

      await tx.post.delete({
        where: { id: existing.repostPostId }
      });

      await tx.post.update({
        where: { id: post.id },
        data: {
          repostCount: {
            decrement: 1
          }
        }
      });
    }

    return tx.post.findUniqueOrThrow({
      where: { id: post.id },
      select: { repostCount: true }
    });
  });

  return NextResponse.json({
    data: {
      reposted: false,
      repostCount: result.repostCount
    }
  });
}
