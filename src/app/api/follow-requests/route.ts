import { NextResponse } from "next/server";
import { getRequiredUser, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getRequiredUser();

  if (!viewer) {
    return unauthorized();
  }

  const requests = await prisma.follow.findMany({
    where: {
      followingId: viewer.id,
      status: "pending"
    },
    include: {
      follower: {
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    data: requests.map((request) => ({
      id: request.id,
      follower: request.follower,
      createdAt: request.createdAt.toISOString()
    }))
  });
}
