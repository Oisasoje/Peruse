// app/api/get-user/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "No UID" }, { status: 400 });
  }

  try {
    const userDoc = await adminDb!.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
