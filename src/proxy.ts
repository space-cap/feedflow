import { NextRequest, NextResponse } from "next/server";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getAllowedOrigins(request: NextRequest) {
  const origins = new Set([request.nextUrl.origin]);

  if (process.env.APP_ORIGIN) {
    origins.add(process.env.APP_ORIGIN);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://127.0.0.1:3000");
    origins.add("http://localhost:3000");
  }

  return origins;
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins(request);

  if (origin) {
    return allowedOrigins.has(origin);
  }

  if (referer) {
    return [...allowedOrigins].some((allowedOrigin) => referer.startsWith(`${allowedOrigin}/`));
  }

  return true;
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/") && unsafeMethods.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json(
      {
        error: {
          code: "CSRF_BLOCKED",
          message: "요청 출처를 확인할 수 없습니다."
        }
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"]
};
