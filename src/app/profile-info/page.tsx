"use client";

import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import z from "zod";
import {
  ClipboardList,
  Crown,
  Flame,
  Medal,
  LogOut,
  PenLine,
  Check,
  X,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fredoka, Inter } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const usernameSchema = z.string().min(1, "Required").max(25, "Max 25 chars");

const UsernameEditor = () => {
  const [username, setUsername] = useState("");
  const [editUsername, setEditUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      if (user.displayName) {
        setUsername(user.displayName);
        setOriginalUsername(user.displayName);
      }
      setIsLoading(false);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.displayName) {
        setUsername(user.displayName);
        setOriginalUsername(user.displayName);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const confirmUsername = async () => {
    const trimmed = username.trim();

    if (trimmed === originalUsername) return;

    const result = usernameSchema.safeParse(trimmed);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: trimmed });
        setOriginalUsername(trimmed);
        setEditUsername(false);
        toast.success("Username updated!");
      } catch (err) {
        console.error(err);
        toast.error("Could not update username");
      }
    }
  };

  const cancelUsername = () => {
    setUsername(originalUsername);
    setEditUsername(false);
  };

  return editUsername ? (
    <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <input
        className={`bg-black/30 border border-white/20 outline-none px-4 py-3 w-full rounded-xl text-sm text-white placeholder-white/30 focus:border-blue-500/50 transition-all ${inter.className}`}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        autoFocus
      />
      <div className="h-4 -mt-1">
        {usernameError && (
          <p className="text-red-400 text-xs">{usernameError}</p>
        )}
      </div>
      <div className="flex w-full gap-3">
        <button
          className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold px-4 py-3 flex-1 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
          onClick={confirmUsername}
        >
          <Check size={16} /> SAVE
        </button>
        <button
          className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold px-4 py-3 flex-1 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          onClick={() => cancelUsername()}
        >
          <X size={16} /> CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col w-full group">
      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
        <p
          className={`font-semibold tracking-wide text-lg text-white ${inter.className}`}
        >
          {username || "Loading..."}
        </p>
        <button
          className={`text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 ${
            isLoading ? "cursor-not-allowed opacity-0" : ""
          }`}
          onClick={() => !isLoading && setEditUsername(true)}
          disabled={isLoading}
          title="Edit Username"
        >
          <PenLine size={18} />
        </button>
      </div>
    </div>
  );
};

const podOptions = [
  "The GroundBreakers",
  "The Disrupters",
  "The Overcomers",
  "The Refined",
  "The Forged",
  "The Emberborns",
  "The Neovisionaries",
  "The Catalysts",
  "The Phoenixes",
  "The Victors",
  "The Trailblazers",
  "The Vanguards",
];

const PodNameEditor = () => {
  const [podName, setPodName] = useState("Select your pod");
  const [editPodName, setEditPodName] = useState(false);
  const [podNameError, setPodNameError] = useState<string | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const init = async () => {
        const userDoc = doc(db, "users", user.uid);
        try {
          const snap = await getDoc(userDoc);
          if (snap.exists()) {
            const data = snap.data();
            setPodName(data.podName || "Select your pod");
            setChangeCount(data.podNameChangeCount || 0);
            setIsNewUser(!data.podName);
          } else {
            await setDoc(userDoc, { podName: "", podNameChangeCount: 0 });
            setPodName("Select your pod");
            setChangeCount(0);
            setIsNewUser(true);
          }
        } catch (err) {
          console.error("Firestore init error:", err);
          setPodName("Select your pod");
          setChangeCount(0);
          setIsNewUser(true);
        } finally {
          setIsLoading(false);
        }
      };

      init();
    });

    return () => unsubscribe();
  }, []);

  const confirmPodName = async () => {
    const user = auth.currentUser;
    if (!user) return toast.error("User not logged in");

    if (changeCount >= 2) {
      toast.error("You can only change your pod name twice.");
      setEditPodName(false);
      return;
    }

    if (podName === "Select your pod" || !podOptions.includes(podName)) {
      setPodNameError("Please select a valid pod");
      return;
    }

    try {
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, {
        podName: podName,
        podNameChangeCount: changeCount + 1,
      });

      setChangeCount((prev) => prev + 1);
      setPodNameError(null);
      setEditPodName(false);
      setIsNewUser(false);
      toast.success("Pod name updated!");
    } catch (err) {
      console.error("Firestore write error:", err);
      toast.error("Failed to update pod name.");
    }
  };

  return editPodName ? (
    <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <select
        className={`bg-black/30 border border-white/20 outline-none px-4 py-3 w-full rounded-xl text-sm text-white cursor-pointer focus:border-blue-500/50 transition-all ${inter.className}`}
        value={podName}
        onChange={(e) => setPodName(e.target.value)}
      >
        <option value="Select your pod" className="bg-[#131f24] text-gray-400">
          Select your pod
        </option>
        {podOptions.map((pod) => (
          <option key={pod} value={pod} className="bg-[#131f24] text-white">
            {pod}
          </option>
        ))}
      </select>
      {podNameError && <p className="text-red-400 text-xs">{podNameError}</p>}
      <div className="flex w-full gap-3">
        <button
          className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold px-4 py-3 flex-1 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
          onClick={confirmPodName}
          disabled={podName === "Select your pod"}
        >
          <Check size={16} /> CONFIRM
        </button>
        <button
          className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold px-4 py-3 flex-1 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          onClick={() => setEditPodName(false)}
        >
          <X size={16} /> CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
        <p
          className={`font-semibold text-white tracking-wide text-lg break-words ${inter.className}`}
        >
          {podName}
        </p>
        <button
          className={`text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 ${
            isLoading || changeCount >= 2
              ? "opacity-0 cursor-not-allowed hidden"
              : ""
          }`}
          onClick={() => !isLoading && changeCount < 2 && setEditPodName(true)}
          disabled={isLoading || changeCount >= 2}
          title="Change Pod"
        >
          <PenLine size={18} />
        </button>
      </div>

      {(isNewUser || changeCount < 2) && (
        <p
          className={`text-[10px] font-bold uppercase tracking-wider pl-3 ${
            changeCount === 0 ? "text-blue-400" : "text-orange-400"
          } `}
        >
          {isNewUser
            ? "b Select Pod To Begin"
            : `${2 - changeCount} ${
                changeCount > 0 ? "change" : "changes"
              } remaining`}
        </p>
      )}
    </div>
  );
};

type UserDoc = {
  createdAt: string;
  displayName: string;
  hasPremium: boolean;
  hearts: number;
  lastAnsweredAt: string;
  podName: string;
  podNameChangeCount: number;
  quizzesTaken: number;
  streak: number;
  lastStreakUpdate: string;
};

const Profile_Info = () => {
  const useUserDoc = () => {
    const [userData, setUserData] = useState<UserDoc | null>(null);

    useEffect(() => {
      const unsubAuth = auth.onAuthStateChanged((user) => {
        if (!user) return setUserData(null);

        const userRef = doc(db, "users", user.uid);
        const unsubSnap = onSnapshot(userRef, (snap) => {
          const data = snap.data() as UserDoc | undefined;
          setUserData(data ?? null);
        });

        return () => unsubSnap();
      });

      return () => unsubAuth();
    }, []);

    return userData;
  };

  const userData = useUserDoc();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="bg-[#131f24] min-h-screen w-full px-4 py-8 pb-28 md:py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className={`text-3xl font-bold text-white mb-2 ${fredoka.className}`}
          >
            My Profile
          </h1>
          <p className={`text-slate-400 ${inter.className}`}>
            Manage your account settings and view achievements
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

          <div className="flex items-center gap-3 mb-8">
            <User className="text-blue-400" size={24} />
            <h2
              className={`text-sm font-bold text-slate-400 tracking-widest uppercase ${inter.className}`}
            >
              Personal Information
            </h2>
          </div>

          <div className="space-y-8">
            <div className="relative pl-6 border-l-2 border-slate-700/50">
              <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase block mb-2">
                USERNAME
              </label>
              <UsernameEditor />
            </div>

            <div className="relative pl-6 border-l-2 border-slate-700/50">
              <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase block mb-2">
                POD NAME
              </label>
              <PodNameEditor />
            </div>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-yellow-500 to-orange-500 opacity-70" />

          <div className="flex items-center gap-3 mb-8">
            <Medal className="text-yellow-500" size={24} />
            <h3
              className={`text-sm font-bold text-slate-400 tracking-widest uppercase ${inter.className}`}
            >
              Achievements & Stats
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                  <ClipboardList size={20} />
                </div>
                <p
                  className={`font-medium text-sm text-slate-300 ${inter.className}`}
                >
                  Quizzes Taken
                </p>
              </div>
              <span
                className={`text-xl font-bold text-white ${fredoka.className}`}
              >
                {userData?.quizzesTaken ?? 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Crown size={20} />
                </div>
                <p
                  className={`font-medium text-sm text-slate-300 ${inter.className}`}
                >
                  Plan
                </p>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${userData?.hasPremium ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-700/50 text-slate-400"} ${inter.className}`}
              >
                {userData?.hasPremium ? "PREMIUM" : "FREE"}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-green-500/20 rounded-xl text-green-400">
                  <Zap size={20} />
                </div>
                <p
                  className={`font-medium text-sm text-slate-300 ${inter.className}`}
                >
                  Rank
                </p>
              </div>
              <span
                className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 uppercase ${inter.className}`}
              >
                {userData?.hasPremium ? "Beacon" : "Newbie"}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-400">
                  <Flame size={20} />
                </div>
                <p
                  className={`font-medium text-sm text-slate-300 ${inter.className}`}
                >
                  Streak
                </p>
              </div>
              <span
                className={`text-xl font-bold text-white ${fredoka.className}`}
              >
                {userData?.streak ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 group"
          >
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="tracking-wide">LOG OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile_Info;
