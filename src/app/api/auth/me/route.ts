import { NextResponse } from "next/server";
import { getDemoUser, getSessionUser } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  const user = sessionUser ?? (await getDemoUser());

  return NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      handle: user.handle,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      role: user.role,
      authenticated: sessionUser !== null
    }
  });
}
