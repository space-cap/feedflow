import { NextRequest, NextResponse } from "next/server";
import { forbidden, getRequiredUser, unauthorized } from "@/lib/api-auth";
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "게시글은 1자 이상 500자 이하로 입력해 주세요." } },
      { status: 400 }
    );
  }

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

  if (post.authorId !== viewer.id) {
    return forbidden();
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { content },
    select: {
      id: true,
      content: true,
      updatedAt: true
    }
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      content: updated.content,
      updatedAt: updated.updatedAt.toISOString()
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
      deletedAt: null
    },
    select: {
      id: true,
      authorId: true,
      parentPostId: true
    }
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "게시글을 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  if (post.authorId !== viewer.id) {
    return forbidden();
  }

  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: post.id },
      data: { deletedAt: new Date() }
    });

    if (post.parentPostId) {
      await tx.post.update({
        where: { id: post.parentPostId },
        data: {
          replyCount: {
            decrement: 1
          }
        }
      });
    }
  });

  return NextResponse.json({
    data: {
      deleted: true
    }
  });
}
