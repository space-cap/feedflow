import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
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

  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
      status: "active"
    },
    select: {
      id: true,
      email: true,
      handle: true,
      displayName: true,
      passwordHash: true,
      role: true
    }
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "이메일 또는 비밀번호를 확인해 주세요." } },
      { status: 401 }
    );
  }

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
