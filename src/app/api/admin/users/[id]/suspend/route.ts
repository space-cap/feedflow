import { NextRequest, NextResponse } from "next/server";
import { forbidden, getRequiredAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function findTargetUser(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: {
      id: true,
      status: true
    }
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const admin = await getRequiredAdmin();

  if (!admin) {
    return forbidden();
  }

  if (admin.id === id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "자기 자신은 정지할 수 없습니다." } },
      { status: 403 }
    );
  }

  const target = await findTargetUser(id);

  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const body = (await request.json().catch(() => null)) as { note?: unknown } | null;
  const note = typeof body?.note === "string" ? body.note : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: {
        status: "suspended"
      }
    });

    await tx.moderationAction.create({
      data: {
        adminId: admin.id,
        targetType: "user",
        targetId: target.id,
        action: "suspend_user",
        note
      }
    });
  });

  return NextResponse.json({
    data: {
      id: target.id,
      status: "suspended"
    }
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const admin = await getRequiredAdmin();

  if (!admin) {
    return forbidden();
  }

  const target = await findTargetUser(id);

  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const body = (await request.json().catch(() => null)) as { note?: unknown } | null;
  const note = typeof body?.note === "string" ? body.note : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: {
        status: "active"
      }
    });

    await tx.moderationAction.create({
      data: {
        adminId: admin.id,
        targetType: "user",
        targetId: target.id,
        action: "unsuspend_user",
        note
      }
    });
  });

  return NextResponse.json({
    data: {
      id: target.id,
      status: "active"
    }
  });
}
