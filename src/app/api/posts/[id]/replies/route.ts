import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "댓글은 1자 이상 500자 이하로 입력해 주세요."
        }
      },
      { status: 400 }
    );
  }

  const author = await getDemoUser();
  const parentPost = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false
    },
    select: { id: true, authorId: true }
  });

  if (!parentPost) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "댓글을 작성할 게시글을 찾을 수 없습니다."
        }
      },
      { status: 404 }
    );
  }

  const reply = await prisma.$transaction(async (tx) => {
    const createdReply = await tx.post.create({
      data: {
        authorId: author.id,
        parentPostId: parentPost.id,
        content,
        visibility: "public"
      },
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            displayName: true
          }
        }
      }
    });

    await tx.post.update({
      where: { id: parentPost.id },
      data: {
        replyCount: {
          increment: 1
        }
      }
    });

    if (parentPost.authorId !== author.id) {
      await tx.notification.create({
        data: {
          receiverId: parentPost.authorId,
          actorId: author.id,
          type: "reply",
          postId: parentPost.id
        }
      });
    }

    return createdReply;
  });

  return NextResponse.json(
    {
      data: {
        id: reply.id,
        content: reply.content,
        author: reply.author,
        createdAt: reply.createdAt.toISOString()
      }
    },
    { status: 201 }
  );
}
