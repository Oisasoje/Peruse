// app/api/get-user/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

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

    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ hearts: 0 });
    }

    const data = docSnap.data();

    // Add CORS headers if calling from middleware
    const response = NextResponse.json({
      hearts: data?.hearts ?? 0,
    });

    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  } catch (err: any) {
    console.error("❌ /api/get-user error:", err);
    return NextResponse.json({ hearts: 0 });
  }
}
