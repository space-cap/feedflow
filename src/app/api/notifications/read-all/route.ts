import { NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH() {
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  await prisma.notification.updateMany({
    where: {
      receiverId: viewer.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return NextResponse.json({
    data: {
      ok: true
    }
  });
}
