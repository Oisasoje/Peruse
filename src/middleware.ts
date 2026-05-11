// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function verifyToken(token: string) {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.users?.[0] || null;
  } catch (error) {
    return null;
  }
}



export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  console.log("🔍 Middleware checking:", pathname);

  // Skip middleware for API routes
  if (pathname.startsWith("/api/")) {
    console.log("🔄 Skipping middleware for API route");
    return NextResponse.next();
  }

  if (!token) {
    console.log("❌ No token found - redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    console.log("✅ Token verified, user:", user.localId);
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/quiz/:path*"],
};
