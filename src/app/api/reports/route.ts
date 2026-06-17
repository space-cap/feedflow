import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    key: "reports:create",
    limit: 10,
    windowMs: 60 * 1000
  });

  if (limited) {
    return limited;
  }

  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }
  const body = (await request.json().catch(() => null)) as {
    targetType?: unknown;
    targetId?: unknown;
    reason?: unknown;
  } | null;

  const targetType = body?.targetType;
  const targetId = body?.targetId;
  const reason = body?.reason;

  if (
    (targetType !== "post" && targetType !== "user") ||
    typeof targetId !== "string" ||
    targetId.length < 1 ||
    typeof reason !== "string" ||
    reason.length < 1
  ) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "신고 대상과 사유를 확인해 주세요." } },
      { status: 400 }
    );
  }

  const report = await prisma.report.create({
    data: {
      reporterId: viewer.id,
      targetType,
      targetId,
      reason
    }
  });

  return NextResponse.json(
    {
      data: {
        id: report.id,
        status: report.status
      }
    },
    { status: 201 }
  );
}
