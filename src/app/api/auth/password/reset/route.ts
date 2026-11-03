import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "auth:password-reset",
    limit: 10,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    password?: unknown;
  } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "재설정 정보를 확인해 주세요." } },
      { status: 400 }
    );
  }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashPasswordResetToken(token),
      usedAt: null,
      expiresAt: {
        gt: new Date()
      },
      user: {
        deletedAt: null,
        status: "active"
      }
    },
    select: {
      id: true,
      userId: true
    }
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "유효하지 않거나 만료된 토큰입니다." } },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: hashPassword(password)
      }
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date()
      }
    });
  });

  return NextResponse.json({
    data: {
      ok: true
    }
  });
}
