"use client";

import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import z from "zod";
import { ClipboardList, Crown, Medal } from "lucide-react";

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
    <div className="flex flex-col  gap-2 justify-between w-full">
      <input
        className="border-2 border-amber-600 outline-none px-2 py-1 w-full max-w-xs mt-2 rounded-lg tracking-wider text-[15px]"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="h-4 -mt-3">
        {usernameError && (
          <p className="text-red-500 text-sm">{usernameError}</p>
        )}
      </div>
      <div className="flex w-full gap-2">
        <button
          className="bg-green-500 rounded-lg text-sm w-fit font-semibold px-3 cursor-pointer hover:bg-green-600 py-2 flex-1"
          onClick={confirmUsername}
        >
          CONFIRM
        </button>
        <button
          className="bg-red-500 rounded-lg text-sm w-fit font-semibold px-3 cursor-pointer hover:bg-red-600 py-2 flex-1"
          onClick={() => cancelUsername()}
        >
          CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col w-full">
      <p className="font-bold tracking-widest text-white text-[17px] break-words">
        {username || "Loading username..."}
      </p>
      <button
        className={`bg-yellow-500 w-full gap-2 rounded-lg text-sm font-semibold px-4 cursor-pointer hover:bg-yellow-600 py-2 mt-2 ${
          isLoading ? "opacity-50 cursor-not-allowed hover:bg-yellow-500" : ""
        }`}
        onClick={() => !isLoading && setEditUsername(true)}
        disabled={isLoading}
      >
        EDIT USERNAME
      </button>
    </div>
  );
};

const podNameSchema = z.string().min(1, "Required").max(25, "Max 25 chars");

const PodNameEditor = () => {
  const [podName, setPodName] = useState("Provide your pod name");
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
            setPodName(data.podName || "Provide your pod name");
            setChangeCount(data.podNameChangeCount || 0);
            setIsNewUser(!data.podName);
          } else {
            await setDoc(userDoc, { podName: "", podNameChangeCount: 0 });
            setPodName("Provide your pod name");
            setChangeCount(0);
            setIsNewUser(true);
          }
        } catch (err) {
          console.error("Firestore init error:", err);
          setPodName("Provide your pod name");
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

    const trimmedPodName = podName.trim();
    const parsed = podNameSchema.safeParse(trimmedPodName);

    if (!parsed.success) {
      setPodNameError(parsed.error.issues[0].message);
      return;
    }

    try {
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, {
        podName: trimmedPodName,
        podNameChangeCount: changeCount + 1,
      });

      setPodName(trimmedPodName);
      setChangeCount((prev) => prev + 1);
      setPodNameError(null);
      setEditPodName(false);
      setIsNewUser(false);
      toast.success("Pod name updated!");
    } catch (err) {
      console.error("Firestore write error:", err);
      toast.error("Failed to update pod name. Check your Firestore rules.");
    }
  };

  return editPodName ? (
    <div className="flex flex-col gap-2 w-full">
      <input
        className="border-2 border-amber-600 outline-none px-2 py-1 w-full max-w-xs mt-2 rounded-lg tracking-wider text-[15px]"
        value={podName}
        onChange={(e) => setPodName(e.target.value)}
      />
      {podNameError && <p className="text-red-500 text-sm">{podNameError}</p>}
      <div className="flex w-full gap-2">
        <button
          className="bg-green-500 rounded-lg text-sm w-fit font-semibold px-3 py-2 cursor-pointer hover:bg-green-600 flex-1"
          onClick={confirmPodName}
        >
          CONFIRM
        </button>
        <button
          className="bg-red-500 rounded-lg text-sm w-fit font-semibold px-3 py-2 cursor-pointer hover:bg-red-600 flex-1"
          onClick={() => setEditPodName(false)}
        >
          CANCEL
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-bold text-white tracking-widest text-[17px] break-words">
        {podName}
      </p>

      <button
        className={`bg-yellow-500 rounded-lg text-sm cursor-pointer font-semibold px-4 py-2 w-full hover:bg-yellow-600 ${
          isLoading || changeCount >= 2
            ? "opacity-50 cursor-not-allowed hover:bg-yellow-500"
            : ""
        }`}
        onClick={() => !isLoading && changeCount < 2 && setEditPodName(true)}
        disabled={isLoading || changeCount >= 2}
      >
        EDIT POD NAME
      </button>

      <p
        className={`text-xs font-bold text-center ${
          changeCount === 0 ? "text-blue-500" : "text-red-500"
        } -mt-2 `}
      >
        {isNewUser
          ? "Welcome! Set your pod name to get started."
          : `${2 - changeCount} ${
              changeCount > 0 ? "change" : "changes"
            } remaining`}
      </p>
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
  return (
    <div className=" bg-[#131f24] min-h-screen w-full px-4 py-6 ">
      <div className="border-2 px-3 pt-3 pb-4 text-sm rounded-2xl border-slate-600 mb-4">
        <h2 className="tracking-wider text-amber-500 font-semibold text-center mb-4">
          YOUR INFORMATION
        </h2>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <label className="text-gray-400 font-semibold tracking-wider block mb-2">
              USERNAME:
            </label>
            <UsernameEditor />
          </div>

          <div className="text-center">
            <label className="text-gray-400 font-semibold tracking-wider block mb-2">
              POD NAME:
            </label>
            <PodNameEditor />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-3 border-2 border-slate-600">
        <h3 className="font-semibold text-gray-400 text-sm text-center mb-4">
          ACHIEVEMENTS
        </h3>
        <div className="space-y-4 text-teal-300">
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <ClipboardList size={24} color="blue" />
              <p className="font-semibold">Quizzes Taken</p>
            </span>
            <span className="font-semibold text-gray-300">
              {userData?.quizzesTaken ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <Crown size={24} color="red" />
              <p className="font-semibold">Subscription</p>
            </span>
            <span className="font-semibold text-gray-300">
              {userData?.hasPremium ? "Premium" : "Free"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <Medal size={24} color="green" />
              <p className="font-semibold">Badge</p>
            </span>
            <span className="font-semibold text-gray-300">
              {userData?.hasPremium ? "Beacon" : "Newbie"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile_Info;
