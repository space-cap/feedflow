import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
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

  const author = await getDemoUser();

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
