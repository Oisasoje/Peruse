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

async function getUserData(uid: string, baseUrl: string) {
  try {
    const apiUrl = new URL(`/api/get-user?uid=${uid}`, baseUrl).toString();
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  console.log("🔍 Middleware checking:", req.nextUrl.pathname);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    // Get REAL heart data from Firestore via API
    const userData = await getUserData(user.localId, req.url);

    if (!userData) {
      throw new Error("User data not available");
    }

    const hearts = userData.hearts ?? 0;
    console.log("💓 Real hearts from Firestore:", hearts);

    // Check against the REAL heart count from database
    if (hearts <= 0) {
      console.log("❌ No hearts - blocking access");
      return NextResponse.redirect(new URL("/no-hearts", req.url));
    }

    console.log("✅ Access granted - hearts available");
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/no-hearts", req.url));
  }
}

export const config = {
  matcher: ["/quiz/:path*"],
};
