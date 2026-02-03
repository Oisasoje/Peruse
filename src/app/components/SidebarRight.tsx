import {
  ClipboardList,
  Flame,
  Heart,
  Medal,
  PenLine,
  X,
  Check,
} from "lucide-react";
import { auth, db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateProfile } from "firebase/auth";
import z from "zod";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/store/userStore";

const usernameSchema = z.string().min(1, "Required").max(25, "Max 25 chars");

const UsernameEditor = () => {
  const user = useUserStore((state) => state.user);
  const [username, setUsername] = useState("");
  const [editUsername, setEditUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName);
      setOriginalUsername(user.displayName);
    }
  }, [user]);

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
    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <input
        className="bg-black/30 border border-white/20 outline-none px-3 py-2 w-full rounded-xl text-sm text-white placeholder-white/30 focus:border-blue-500/50 transition-all font-body"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        autoFocus
      />
      <div className="flex w-full gap-2">
        <button
          className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold px-3 py-2 flex-1 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
          onClick={confirmUsername}
        >
          <Check size={14} /> SAVE
        </button>
        <button
          className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold px-3 py-2 flex-1 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
          onClick={() => cancelUsername()}
        >
          <X size={14} /> CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col w-full group">
      <div className="flex items-center justify-between">
        <p className="font-semibold tracking-wide text-[16px] break-words text-white font-body">
          {username || "Loading..."}
        </p>
        <button
          className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100"
          onClick={() => setEditUsername(true)}
          title="Edit Username"
        >
          <PenLine size={16} />
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
  const userData = useUserStore((state) => state.userData);
  const user = useUserStore((state) => state.user);
  const [podName, setPodName] = useState("Select your pod");
  const [editPodName, setEditPodName] = useState(false);
  const [podNameError, setPodNameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setPodName(userData.podName || "Select your pod");
    }
  }, [userData]);

  const confirmPodName = async () => {
    if (!user) return toast.error("User not logged in");
    const changeCount = userData?.podNameChangeCount || 0;

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
      setIsLoading(true);
      const userDoc = doc(db, "users", user.uid);
      const snap = await getDoc(userDoc);

      if (!snap.exists()) {
        await setDoc(
          userDoc,
          {
            podName: podName,
            podNameChangeCount: 1,
          },
          { merge: true },
        );
      } else {
        await updateDoc(userDoc, {
          podName: podName,
          podNameChangeCount: changeCount + 1,
        });
      }

      setPodNameError(null);
      setEditPodName(false);
      toast.success("Pod name updated!");
    } catch (err) {
      console.error("Firestore write error:", err);
      toast.error("Failed to update pod name.");
    } finally {
      setIsLoading(false);
    }
  };

  const changeCount = userData?.podNameChangeCount || 0;
  const isNewUser = !userData?.podName;

  return editPodName ? (
    <div className="flex flex-col  py-6 gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <select
        className="bg-black/30 border border-white/20 outline-none px-3 py-2 w-full rounded-xl text-sm text-white cursor-pointer focus:border-blue-500/50 transition-all font-body"
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
      <div className="flex w-full gap-2">
        <button
          className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold px-3 py-2 flex-1 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
          onClick={confirmPodName}
          disabled={podName === "Select your pod" || isLoading}
        >
          <Check size={14} /> {isLoading ? "..." : "CONFIRM"}
        </button>
        <button
          className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold px-3 py-2 flex-1 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
          onClick={() => setEditPodName(false)}
        >
          <X size={14} /> CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between group">
        <p className="font-semibold text-white tracking-wide text-[16px] break-words font-body">
          {podName}
        </p>
        <button
          className={`text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 ${
            changeCount >= 2 ? "hidden" : ""
          }`}
          onClick={() => changeCount < 2 && setEditPodName(true)}
          title="Change Pod"
        >
          <PenLine size={16} />
        </button>
      </div>

      {(isNewUser || changeCount < 2) && (
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${
            changeCount === 0 ? "text-blue-400" : "text-orange-400"
          } `}
        >
          {isNewUser
            ? "Select Pod To Begin"
            : `${2 - changeCount} ${
                changeCount > 0 ? "change" : "changes"
              } remaining`}
        </p>
      )}
    </div>
  );
};

const SidebarRight = () => {
  const userData = useUserStore((state) => state.userData);

  return (
    <aside className="hidden lg:flex flex-col w-84 px-6 fixed top-0 right-0 h-screen bg-[#131f24]/95 backdrop-blur-xl z-40 overflow-y-auto no-scrollbar">
      {/* Stats Cards */}
      <div className="flex gap-4 mt-8 w-full shrink-0">
        <div className="flex-1 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="absolute top-[-10px] right-[-10px] bg-orange-500/20 w-12 h-12 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all" />
          <Flame className="text-orange-500 mb-2 drop-shadow-lg" size={28} />
          <span className="text-2xl font-black text-white font-display">
            {userData?.streak ?? 0}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-orange-400 uppercase mt-1">
            Day Streak
          </span>
        </div>

        <div className="flex-1 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="absolute top-[-10px] right-[-10px] bg-red-500/20 w-12 h-12 rounded-full blur-xl group-hover:bg-red-500/30 transition-all" />
          <Heart
            className="text-red-500 mb-2 drop-shadow-lg fill-red-500/20"
            size={28}
          />
          <span className="text-2xl font-black text-white font-display">
            {userData?.hearts ?? 0}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-red-500 uppercase mt-1">
            {userData && userData.hearts !== 1 ? "Hearts" : "Heart"}
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2 font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Profile
          Details
        </h2>

        <div className="space-y-6">
          <div className="relative pl-4 border-l-2 border-slate-700/50">
            <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase block mb-1">
              USERNAME
            </label>
            <UsernameEditor />
          </div>

          <div className="relative pl-4 border-l-2 border-slate-700/50">
            <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase block mb-1">
              POD NAME
            </label>
            <PodNameEditor />
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden shrink-0">
        <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2 font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{" "}
          Achievements
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <ClipboardList size={20} />
              </div>
              <p className="font-semibold text-sm text-slate-200 font-body">
                Quizzes Taken
              </p>
            </div>
            <span className="text-lg font-bold text-white font-display">
              {userData?.quizzesTaken ?? 0}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                <Medal size={20} />
              </div>
              <p className="font-semibold text-sm text-slate-200 font-body">
                Current Rank
              </p>
            </div>
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 uppercase font-body">
              {userData?.hasPremium ? "Beacon" : "Newbie"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default SidebarRight;
