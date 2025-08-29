import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(
    process.env.NEXT_PUBLIC_COOKIE_NAME || "_session"
  );
  const { pathname } = request.nextUrl;
  console.log("Middleware - Pathname:", pathname);
  // Protected routes
  const protectedRoutes = ["/account"];
  const authRoutes = ["/login", "/register", "/forgot-password"];

  // Redirect to login if accessing protected route without session
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to account if accessing auth routes with session
  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
