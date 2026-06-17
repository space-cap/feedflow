import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/demo-session";

export function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message: "권한이 없습니다." } },
    { status: 403 }
  );
}

export async function getRequiredUser() {
  return getSessionUser();
}

export async function getRequiredAdmin() {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}
