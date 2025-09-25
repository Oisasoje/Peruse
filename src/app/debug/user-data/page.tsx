// app/debug/user-data/page.tsx
"use client";
import { useEffect, useState } from "react";
import { auth } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function DebugUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setUserData({ error: "User document not found" });
          }
        } catch (error: any) {
          setUserData({ error: error.message });
        }
      }
      setLoading(false);
    };

    checkUserData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Data Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(userData, null, 2)}
      </pre>

      {userData && !userData.error && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Hearts Field Analysis:</h2>
          <p>hearts: {userData.hearts ?? "undefined"}</p>
          <p>heartCount: {userData.heartCount ?? "undefined"}</p>
          <p>lives: {userData.lives ?? "undefined"}</p>
          <p>points: {userData.points ?? "undefined"}</p>
        </div>
      )}
    </div>
  );
}
