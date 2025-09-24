import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "./lib/firebaseAdmin";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token); // ✅ works with adminAuth
    // decoded.uid, decoded.email, etc.
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/questions/:path*"],
};
