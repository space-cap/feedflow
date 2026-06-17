import { NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: viewer.id
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
    take: 30
  });

  return NextResponse.json({
    data: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      actor: notification.actor,
      postId: notification.postId,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString()
    })),
    page: {
      nextCursor: null,
      hasNext: false
    }
  });
}
