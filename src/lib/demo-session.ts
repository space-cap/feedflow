import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "feedflow_user_id";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: "active"
    },
    select: {
      id: true,
      handle: true,
      displayName: true,
      email: true,
      bio: true,
      avatarUrl: true,
      isPrivate: true,
      role: true
    }
  });
}

export async function getDemoUser() {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    return sessionUser;
  }

  const user = await prisma.user.findFirst({
    where: { handle: "demo" },
    select: {
      id: true,
      email: true,
      handle: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      isPrivate: true,
      role: true
    }
  });

  if (!user) {
    throw new Error("demo user is missing. Run npm run db:seed.");
  }

  return user;
}
