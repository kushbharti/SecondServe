import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DONOR_ROLES = [
  "DONOR",
  "HOTEL",
  "CAFE",
  "RESTAURANT",
  "CANTEEN",
  "CATERING_SERVICE",
];
const RECEIVER_ROLES = [
  "NGO",
  "ORPHANAGE",
  "OLD_AGE_HOME",
  "GOVERNMENT_HOSPITAL",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  const isDonorRoute = pathname.startsWith("/donor");
  const isReceiverRoute = pathname.startsWith("/recipient");
  const isAdminRoute = pathname.startsWith("/admin-panel");

  // If not authenticated, redirect to /login with callbackUrl
  if ((isDonorRoute || isReceiverRoute || isAdminRoute) && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (accessToken && role) {
    // Donor routes: only donor roles
    if (isDonorRoute && !DONOR_ROLES.includes(role)) {
      return NextResponse.redirect(
        new URL("/recipient/dashboard", request.url),
      );
    }
    // Receiver routes: only receiver roles
    if (isReceiverRoute && !RECEIVER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/donor/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/donor/:path*", "/recipient/:path*", "/admin-panel/:path*"],
};
