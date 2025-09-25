// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore"; // Import Firestore type

// Check if required environment variables exist
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing Firebase environment variables:", missingVars);
}

let app;
try {
  app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  throw error;
}

export const adminAuth = getAuth(app);

// FIX: Add explicit type annotation
let adminDb: Firestore | null = null;

try {
  adminDb = getFirestore(app);
  console.log("✅ Firestore initialized successfully");
} catch (error) {
  console.error("❌ Firestore initialization failed:", error);
}

export { adminDb };
