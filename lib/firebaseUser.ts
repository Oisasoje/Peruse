import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust to where your db is exported from
import { User } from "firebase/auth";

export async function createUserDoc(user: User, username: string) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // Only create if it doesn't exist yet
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: username,
      hearts: 3,
      streak: 0,
      quizzesTaken: 0,
      createdAt: serverTimestamp(),
      podName: "",
      podNameChangeCount: 0,
      lastAnsweredAt: null,
      hasPremium: false,
    });
  }
}
