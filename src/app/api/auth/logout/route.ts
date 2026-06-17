import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ data: { ok: true } });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
