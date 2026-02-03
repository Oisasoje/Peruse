import { create } from "zustand";
import { auth, db } from "../../../lib/firebase";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export type UserDoc = {
  createdAt: string;
  displayName: string;
  hasPremium: boolean;
  hearts: number;
  lastHeartReset?: string;
  lastAnsweredAt: Timestamp | string | number;
  podName: string;
  podNameChangeCount: number;
  quizzesTaken: number;
  streak: number;
  lastStreakUpdate?: string;
  completedChapters: string[];
};

interface UserState {
  user: User | null;
  userData: UserDoc | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserData: (data: UserDoc | null) => void;
  setLoading: (loading: boolean) => void;
  init: () => () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userData: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),
  init: () => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      set({ user, loading: !user });

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubSnap = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            set({ userData: snap.data() as UserDoc, loading: false });
          } else {
            set({ userData: null, loading: false });
          }
        });

        // Return cleanup for Firestore if user changes
        (window as any)._unsubSnap = unsubSnap;
      } else {
        set({ userData: null, loading: false });
        if ((window as any)._unsubSnap) {
          (window as any)._unsubSnap();
        }
      }
    });

    return () => {
      unsubAuth();
      if ((window as any)._unsubSnap) {
        (window as any)._unsubSnap();
      }
    };
  },
}));
