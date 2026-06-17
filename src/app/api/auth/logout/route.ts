import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ data: { ok: true } });
  clearSessionCookie(response);

  return response;
}
