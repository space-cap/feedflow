import { NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH() {
  const viewer = await getDemoUser();

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
