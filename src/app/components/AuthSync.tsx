"use client";

import { useEffect } from "react";
import { auth } from "../../../lib/firebase";
import nookies from "nookies";

export default function AuthSync() {
  useEffect(() => {
    // subscribe to auth state changes
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        nookies.set(undefined, "token", token, { path: "/" });
      } else {
        nookies.destroy(undefined, "token");
      }
    });
  }, []);

  return null; // nothing to render visually
}
