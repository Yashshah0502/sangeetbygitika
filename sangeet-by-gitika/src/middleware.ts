import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests to /admin
  // TODO: Add proper authentication with Clerk or NextAuth later
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
