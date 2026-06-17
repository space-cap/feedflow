import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionUser();

  if (!admin) {
    return unauthorized();
  }

  if (admin.role !== "admin") {
    return forbidden();
  }

  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          handle: true,
          displayName: true
        }
      },
      reviewer: {
        select: {
          id: true,
          handle: true,
          displayName: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50
  });

  return NextResponse.json({
    data: reports.map((report) => ({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      reporter: report.reporter,
      reviewer: report.reviewer,
      reviewedAt: report.reviewedAt?.toISOString() ?? null,
      createdAt: report.createdAt.toISOString()
    })),
    page: {
      nextCursor: null,
      hasNext: false
    }
  });
}
