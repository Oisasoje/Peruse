import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User } from "firebase/auth";

export async function createUserDoc(user: User, username: string) {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    console.log(
      "createUserDoc: Checking if user document exists for:",
      user.uid
    );
    console.log("createUserDoc: Document exists:", snap.exists());

    if (!snap.exists()) {
      console.log("createUserDoc: Creating new user document with hearts: 3");

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: username,
        hearts: 5,
        streak: 0,
        quizzesTaken: 0,
        createdAt: serverTimestamp(),
        podName: "",
        podNameChangeCount: 0,
        lastAnsweredAt: null,
        hasPremium: false,
        lastStreakUpdate: null,
        completedChapters: [],
      };

      await setDoc(ref, userData);
      console.log("createUserDoc: User document created successfully");

      const verifySnap = await getDoc(ref);
      console.log(
        "createUserDoc: Verification - document exists:",
        verifySnap.exists()
      );
      console.log("createUserDoc: Verification - data:", verifySnap.data());
    } else {
      console.log(
        "createUserDoc: User document already exists, skipping creation"
      );
      console.log("createUserDoc: Existing data:", snap.data());
    }
  } catch (error) {
    console.error("createUserDoc: Error creating user document:", error);
    throw error;
  }
}
