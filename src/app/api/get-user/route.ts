// app/api/get-user/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid) {
      return NextResponse.json(
        { error: "Missing UID header" },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({ user: data });
  } catch (err: any) {
    console.error("❌ /api/get-user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
