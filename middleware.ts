import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/articles/new"];
const PROTECTED_PATTERNS = [/^\/articles\/[^/]+\/edit$/];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("chapbook-access-token");
  const { pathname } = request.nextUrl;

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
