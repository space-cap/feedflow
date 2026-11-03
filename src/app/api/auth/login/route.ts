import { NextRequest, NextResponse } from "next/server";
import { isLoginLocked, recordLoginAttempt } from "@/lib/auth-security";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { setSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "auth:login",
    limit: 10,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const ipAddress = getClientIp(request);

  if (await isLoginLocked(email, ipAddress)) {
    await recordLoginAttempt({
      email,
      ipAddress,
      success: false,
      reason: "locked"
    });

    return NextResponse.json(
      {
        error: {
          code: "ACCOUNT_LOCKED",
          message: "로그인 실패가 반복되어 잠시 후 다시 시도해 주세요."
        }
      },
      { status: 423 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      handle: true,
      displayName: true,
      passwordHash: true,
      role: true,
      status: true
    }
  });

  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    await recordLoginAttempt({
      email,
      ipAddress,
      success: false,
      userId: user?.id,
      reason: user && user.status !== "active" ? user.status : "invalid_credentials"
    });

    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "이메일 또는 비밀번호를 확인해 주세요." } },
      { status: 401 }
    );
  }

  await recordLoginAttempt({
    email,
    ipAddress,
    success: true,
    userId: user.id
  });

  const response = NextResponse.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.displayName,
        role: user.role
      }
    }
  });
  setSessionCookie(response, user.id);

  return response;
}
