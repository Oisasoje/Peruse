import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing UID parameter" },
        { status: 400 }
      );
    }

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      // Ensure users can only query their own data
      if (decodedToken.uid !== uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 0 }); // 403 would be better but keeping it simple
      }
    } catch (authErr) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ hearts: 0 });
    }

    const data = docSnap.data();

    return NextResponse.json({
      hearts: data?.hearts ?? 0,
    });
  } catch (err: any) {
    console.error("❌ /api/get-user error:", err);
    return NextResponse.json({ hearts: 0 }, { status: 500 });
  }
}
