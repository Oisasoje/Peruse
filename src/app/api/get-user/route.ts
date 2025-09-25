// app/api/get-user/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "No UID provided" }, { status: 400 });
  }

  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // If user doesn't exist, create a default one
      const defaultUserData = {
        uid: uid,
        hearts: 3,
        streak: 0,
        quizzesTaken: 0,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await adminDb.collection("users").doc(uid).set(defaultUserData);

      return NextResponse.json(defaultUserData);
    }

    const userData = userDoc.data();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
