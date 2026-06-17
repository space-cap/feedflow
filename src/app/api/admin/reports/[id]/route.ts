import { NextRequest, NextResponse } from "next/server";
import { forbidden, getRequiredAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const reviewer = await getRequiredAdmin();

  if (!reviewer) {
    return forbidden();
  }
  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    note?: unknown;
  } | null;

  const status = body?.status;
  const note = typeof body?.note === "string" ? body.note : null;

  if (status !== "open" && status !== "reviewing" && status !== "resolved" && status !== "rejected") {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "신고 상태를 확인해 주세요." } },
      { status: 400 }
    );
  }

  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
      reviewedBy: reviewer.id,
      reviewedAt: status === "resolved" || status === "rejected" ? new Date() : null
    }
  });

  await prisma.moderationAction.create({
    data: {
      adminId: reviewer.id,
      targetType: "report",
      targetId: report.id,
      action: `report_${status}`,
      note
    }
  });

  return NextResponse.json({
    data: {
      id: report.id,
      status: report.status
    }
  });
}
