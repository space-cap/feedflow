import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({
      data: {
        user: null,
        authenticated: false
      }
    });
  }

  return NextResponse.json({
    data: {
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        handle: sessionUser.handle,
        displayName: sessionUser.displayName,
        bio: sessionUser.bio,
        avatarUrl: sessionUser.avatarUrl,
        isPrivate: sessionUser.isPrivate,
        role: sessionUser.role
      },
      authenticated: true
    }
  });
}
