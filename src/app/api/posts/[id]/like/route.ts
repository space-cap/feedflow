import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false
    },
    select: {
      id: true,
      authorId: true,
      likeCount: true
    }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "게시글을 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: {
        userId_postId: {
          userId: viewer.id,
          postId: post.id
        }
      }
    });

    if (!existing) {
      await tx.like.create({
        data: {
          userId: viewer.id,
          postId: post.id
        }
      });

      await tx.post.update({
        where: { id: post.id },
        data: {
          likeCount: {
            increment: 1
          }
        }
      });

      if (post.authorId !== viewer.id) {
        await tx.notification.create({
          data: {
            receiverId: post.authorId,
            actorId: viewer.id,
            type: "like",
            postId: post.id
          }
        });
      }
    }

    return tx.post.findUniqueOrThrow({
      where: { id: post.id },
      select: { likeCount: true }
    });
  });

  return NextResponse.json({
    data: {
      liked: true,
      likeCount: result.likeCount
    }
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false
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
    const existing = await tx.like.findUnique({
      where: {
        userId_postId: {
          userId: viewer.id,
          postId: post.id
        }
      }
    });

    if (existing) {
      await tx.like.delete({
        where: {
          userId_postId: {
            userId: viewer.id,
            postId: post.id
          }
        }
      });

      await tx.post.update({
        where: { id: post.id },
        data: {
          likeCount: {
            decrement: 1
          }
        }
      });
    }

    return tx.post.findUniqueOrThrow({
      where: { id: post.id },
      select: { likeCount: true }
    });
  });

  return NextResponse.json({
    data: {
      liked: false,
      likeCount: result.likeCount
    }
  });
}
