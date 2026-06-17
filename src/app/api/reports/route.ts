import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const viewer = await getDemoUser();
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
