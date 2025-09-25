// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// For Edge Runtime compatibility, we need to use a different approach
const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

export const adminAuth = getAuth(app);

// For Firestore in Edge Runtime, we need to use a different approach
let adminDb: any = null;

try {
  adminDb = getFirestore(app);
} catch (error) {
  console.log("Firestore not available in Edge Runtime, using fallback");
}

export { adminDb };
