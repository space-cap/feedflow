import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/demo-session";
import { cursorWhere, decodeCursor, getNextCursor, parseLimit, trimPage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"), 50, 100);
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const status = url.searchParams.get("status");
  const admin = await getSessionUser();

  if (!admin) {
    return unauthorized();
  }

  if (admin.role !== "admin") {
    return forbidden();
  }

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...cursorWhere(cursor)
    },
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
    take: limit + 1
  });
  const pageItems = trimPage(reports, limit);
  const nextCursor = getNextCursor(reports, limit);

  return NextResponse.json({
    data: pageItems.map((report) => ({
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
      nextCursor,
      hasNext: nextCursor !== null
    }
  });
}
