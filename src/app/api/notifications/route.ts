import { NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { getBlockedUserIds } from "@/lib/blocking";
import { cursorWhere, decodeCursor, getNextCursor, parseLimit, trimPage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }
  const blockedUserIds = await getBlockedUserIds(viewer.id);

  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: viewer.id,
      OR: [{ actorId: null }, { actorId: { notIn: blockedUserIds } }],
      ...cursorWhere(cursor)
    },
    include: {
      actor: {
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
  const pageItems = trimPage(notifications, limit);
  const nextCursor = getNextCursor(notifications, limit);

  return NextResponse.json({
    data: pageItems.map((notification) => ({
      id: notification.id,
      type: notification.type,
      actor: notification.actor,
      postId: notification.postId,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString()
    })),
    page: {
      nextCursor,
      hasNext: nextCursor !== null
    }
  });
}
