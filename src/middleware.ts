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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.users?.[0] || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

async function getUserData(uid: string, baseUrl: string) {
  try {
    // Use the base URL to construct the API call
    const apiUrl = new URL(`/api/get-user?uid=${uid}`, baseUrl).toString();
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  console.log("\n🔍 === MIDDLEWARE START ===");
  console.log("📍 Path:", req.nextUrl.pathname);

  if (!token) {
    console.log("❌ No token - redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify token using REST API
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    console.log("✅ Token verified for user:", user.localId);

    // Get user data from your API
    const userData = await getUserData(user.localId, req.url);

    if (!userData || userData.error) {
      console.log("❌ Failed to get user data");
      throw new Error("User data not available");
    }

    const hearts = userData?.hearts ?? 3;
    console.log(`💓 User has ${hearts} hearts`);

    if (hearts <= 0) {
      console.log("❌ No hearts - redirecting to /no-hearts");
      return NextResponse.redirect(new URL("/no-hearts", req.url));
    }

    console.log("✅ Access granted");
    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware error:", error);

    const response = NextResponse.redirect(new URL("/no-hearts", req.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/quiz/:path*"],
};
