import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, hashPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "auth:password-reset-request",
    limit: 5,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const user = email
    ? await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
          status: "active"
        },
        select: {
          id: true
        }
      })
    : null;
  let debugToken: string | undefined;

  if (user) {
    const token = createPasswordResetToken();
    debugToken = token;

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashPasswordResetToken(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });
  }

  return NextResponse.json({
    data: {
      ok: true,
      ...(process.env.NODE_ENV === "production" ? {} : { debugToken })
    }
  });
}
