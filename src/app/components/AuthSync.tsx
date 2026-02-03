"use client";

import { useEffect } from "react";
import { auth } from "../../../lib/firebase";
import nookies from "nookies";
import { useUserStore } from "@/lib/store/userStore";

export default function AuthSync() {
  const init = useUserStore((state) => state.init);

  useEffect(() => {
    // Initialize the centralized user data listener
    const cleanupStore = init();

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      try {
        if (user) {
          console.log("AuthSync: User logged in:", user.uid);
          const token = await user.getIdToken();
          nookies.set(null, "token", token, {
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: "lax",
          });
        } else {
          console.log("AuthSync: User logged out");
          nookies.destroy(null, "token", { path: "/" });
        }
      } catch (error) {
        console.error("AuthSync: Error syncing auth state:", error);
        nookies.destroy(null, "token", { path: "/" });
      }
    });

    // Force token refresh every 10 minutes to prevent expiration
    const interval = setInterval(
      async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            console.log("AuthSync: Refreshing token...");
            const token = await user.getIdToken(true);
            nookies.set(null, "token", token, {
              path: "/",
              maxAge: 30 * 24 * 60 * 60,
              sameSite: "lax",
            });
          } catch (error) {
            console.error("AuthSync: Token refresh error:", error);
          }
        }
      },
      10 * 60 * 1000,
    ); // 10 minutes

    return () => {
      unsubscribe();
      cleanupStore();
      clearInterval(interval);
    };
  }, [init]);

  return null;
}
