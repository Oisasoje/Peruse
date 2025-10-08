import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { ClipboardList, Crown, Flame, HeartOffIcon, Medal } from "lucide-react";
import { auth, db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import z from "zod";

const usernameSchema = z.string().min(1, "Required").max(25, "Max 25 chars");

type UserDoc = {
  createdAt: string;
  displayName: string;
  hasPremium: boolean;
  hearts: number;
  lastHeartReset: string;
  lastAnsweredAt: string;
  podName: string;
  podNameChangeCount: number;
  quizzesTaken: number;
  streak: number;
  lastStreakUpdate: string;
  completedChapters: string[];
};

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
    <div className="flex flex-col gap-2 justify-between w-full">
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
      <p className="font-bold tracking-wider text-[17px] break-words">
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
    <div className="flex flex-col gap-2 w-full">
      <select
        className="border-2 border-amber-600 outline-none px-2 py-2 w-full max-w-xs mt-2 rounded-lg tracking-wider text-[15px] cursor-pointer text-white bg-[#131f24]"
        value={podName}
        onChange={(e) => setPodName(e.target.value)}
      >
        <option value="Select your pod">Select your pod</option>
        {podOptions.map((pod) => (
          <option key={pod} value={pod}>
            {pod}
          </option>
        ))}
      </select>
      {podNameError && <p className="text-red-500 text-sm">{podNameError}</p>}
      <div className="flex w-full gap-2">
        <button
          className="bg-green-500 rounded-lg text-sm w-fit font-semibold px-3 py-2 cursor-pointer hover:bg-green-600 flex-1"
          onClick={confirmPodName}
          disabled={podName === "Select your pod"}
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
        {isNewUser ? "SELECT POD" : "CHANGE POD"}
      </button>

      <p
        className={`text-xs font-bold text-center ${
          changeCount === 0 ? "text-blue-500" : "text-red-500"
        } `}
      >
        {isNewUser
          ? "Welcome! Select your pod to get started."
          : `${2 - changeCount} ${
              changeCount > 0 ? "change" : "changes"
            } remaining`}
      </p>
    </div>
  );
};

const SidebarRight = () => {
  const userData = useUserDoc();

  return (
    <aside className="hidden text-white lg:block w-80 pl-5 fixed top-0 right-0 h-screen">
      <div className="flex px-6 py-2 mt-6 justify-between rounded-2xl">
        <span className="flex gap-2">
          <Flame color="orange" />
          <span className="flex flex-col">
            <span className="font-semibold text-lg">
              {userData?.streak ?? 0}
            </span>
            <span className="text-sm font-semibold tracking-wider text-orange-400">
              DAY STREAK
            </span>
          </span>
        </span>
        <span className="flex gap-3">
          <HeartOffIcon size={30} color="red" />
          <span className="flex flex-col">
            <span className="font-semibold text-lg">
              {userData?.hearts ?? 0}
            </span>
            <span className="text-sm tracking-wider text-red-600 font-semibold">
              {userData && userData.hearts > 1 ? "HEARTS" : "HEART"}
            </span>
          </span>
        </span>
      </div>

      <div className="border-2 px-3 pt-3 pb-4 text-sm rounded-2xl h-75 mt-2 border-slate-600">
        <h2 className="tracking-wider font-semibold">YOUR INFORMATION</h2>
        <div className="mt-3 flex gap-3 justify-center flex-col">
          <div>
            <label className="text-gray-400 font-semibold tracking-wider">
              USERNAME:
            </label>
            <UsernameEditor />
          </div>
          <div>
            <label className="text-gray-400 font-semibold tracking-wider">
              POD NAME:
            </label>
            <PodNameEditor />
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-2xl overflow-y-auto p-3 border-2 border-slate-600">
        <h3 className="font-semibold text-sm">ACHIEVEMENTS</h3>
        <div className="mt-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <ClipboardList size={30} color="blue" />
              <p className="font-semibold text-[17px] tracking-wider">
                Quizzes Taken
              </p>
            </span>
            <span className="text-[17px] font-semibold text-gray-300">
              {userData?.quizzesTaken ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <Crown size={30} color="red" />
              <p className="font-semibold text-[17px] tracking-wider">
                Subscription
              </p>
            </span>
            <span className="text-[17px] font-semibold text-gray-300">
              {userData?.hasPremium ? "Premium" : "Free"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex gap-2 items-center">
              <Medal size={30} color="green" />
              <p className="font-semibold text-[17px] tracking-wider">Badge</p>
            </span>
            <span className="text-[17px] font-semibold text-gray-300">
              {userData?.hasPremium ? "Beacon" : "Newbie"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default SidebarRight;
