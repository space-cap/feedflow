import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { setSessionCookie } from "@/lib/session-cookie";
import { isValidHandle, normalizeHandle } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "auth:signup",
    limit: 5,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
    handle?: unknown;
    displayName?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const handle = typeof body?.handle === "string" ? normalizeHandle(body.handle) : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!email.includes("@") || password.length < 8 || !isValidHandle(handle) || !displayName) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "가입 정보를 확인해 주세요." } },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { handle }]
    },
    select: { id: true }
  });

  if (existing) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "이미 사용 중인 이메일 또는 핸들입니다." } },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      handle,
      displayName
    },
    select: {
      id: true,
      email: true,
      handle: true,
      displayName: true,
      role: true
    }
  });

  const response = NextResponse.json({ data: user }, { status: 201 });
  setSessionCookie(response, user.id);

  return response;
}
