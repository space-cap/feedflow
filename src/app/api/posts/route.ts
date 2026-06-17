import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "게시글은 1자 이상 500자 이하로 입력해 주세요."
        }
      },
      { status: 400 }
    );
  }

  const author = await prisma.user.findUnique({
    where: { handle: "demo" },
    select: { id: true }
  });

  if (!author) {
    return NextResponse.json(
      {
        error: {
          code: "DEV_USER_NOT_FOUND",
          message: "demo 사용자를 찾을 수 없습니다. npm run db:seed를 실행해 주세요."
        }
      },
      { status: 500 }
    );
  }

  const post = await prisma.post.create({
    data: {
      authorId: author.id,
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

  return NextResponse.json(
    {
      data: {
        id: post.id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt.toISOString()
      }
    },
    { status: 201 }
  );
}
