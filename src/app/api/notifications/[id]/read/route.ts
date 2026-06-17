import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const viewer = await getDemoUser();

  await prisma.notification.updateMany({
    where: {
      id,
      receiverId: viewer.id
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
