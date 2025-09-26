"use client";

import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import {
  Badge,
  BookOpen,
  ClipboardList,
  Crown,
  Flame,
  FlameKindling,
  Gem,
  HeartOffIcon,
  Library,
  Lightbulb,
  Medal,
  Menu,
  X,
} from "lucide-react";
import { Fredoka, Inter } from "next/font/google";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";

import { z } from "zod";
import { useActivePage } from "../components/ActivePageContext";
import { useLoader } from "../components/LoaderContext";
import Link from "next/link";

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

const SimpleLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const DeepWork = dynamic(() => import("../components/DeepWork"), {
  ssr: false,
  loading: () => <SimpleLoader />,
});

const EmotionalIntelligence = dynamic(
  () => import("../components/EmotionalIntelligence"),
  {
    ssr: false,
    loading: () => <SimpleLoader />,
  }
);
const Ultralearning = dynamic(() => import("../components/Ultralearning"), {
  ssr: false,
  loading: () => <SimpleLoader />,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const bookResources = [
  { title: "DEEP WORK", author: "Cal NewPort" },
  { title: "ESSENTIALISM", author: "Greg McKeown" },
  { title: "ULTRALEARNING", author: "Scott Young" },
  { title: "LAWS OF HUMAN NATURE", author: "Robert Greene" },
  {
    title: "EMOTIONAL INTELLIGENCE 2.0",
    author: "Travis Bradberry & Jean Greaves",
  },
];

const deepWorkChapters = [
  {
    chapter: "Chapter 1",
    title: "Deep Work Is Valuable",
    img: "/assets/deepworkval.svg",
  },
  {
    chapter: "Chapter 2",
    title: "Deep Work Is Rare",
    img: "/assets/deepworkrare.jpg",
  },
  {
    chapter: "Chapter 3",
    title: "Deep Work Is Meaningful",
    img: "/assets/deepworkmeaning.jpg",
  },
  { chapter: "Chapter 4", title: "Work Deeply", img: "/assets/workdeeply.jpg" },
  {
    chapter: "Chapter 5",
    title: "Embrace Boredom",
    img: "/assets/embraceboredom.jpg",
  },
  {
    chapter: "Chapter 6",
    title: "Quit Social Media",
    img: "/assets/quitsocialmedia.jpg",
  },
  {
    chapter: "Chapter 7",
    title: "Drain the Shallows",
    img: "/assets/draintheshallows.jpg",
  },
];

const Quiz = () => {
  const userData = useUserDoc();
  const { activePage, setActivePage } = useActivePage();
  const [username, setUsername] = useState("");

  const [currentResource, setCurrentResource] = useState("DEEP WORK");
  const [currentAuthor, setCurrentAuthor] = useState("Cal Newport");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const { isProcessing, setIsProcessing } = useLoader();

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Add this useEffect to your quiz component
  useEffect(() => {
    const checkDailyReset = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const today = new Date().toISOString().split("T")[0];
          const lastReset = userData.lastHeartReset || "";

          // If last reset was NOT today, reset hearts to 5
          if (lastReset !== today) {
            await updateDoc(userRef, {
              hearts: 5, // RESET to 5, not add
              lastHeartReset: today,
            });
            console.log("🔄 Daily hearts reset to 5");
          }
        }
      } catch (error) {
        console.error("Error in daily reset:", error);
      }
    };

    checkDailyReset();
  }, [auth.currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.displayName) {
        setUsername(user.displayName);
      } else {
        setUsername("");
      }
    });
    return () => unsubscribe();
  }, []);

  const renderedResource =
    currentResource === "DEEP WORK" ? (
      <DeepWork />
    ) : currentResource === "EMOTIONAL INTELLIGENCE 2.0" ? (
      <EmotionalIntelligence />
    ) : currentResource === "ULTRALEARNING" ? (
      <Ultralearning />
    ) : (
      <div className="col-span-3 flex items-center justify-center h-64">
        <p className="text-xl">Select a resource to get started</p>
      </div>
    );

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131f24]">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${inter.className} text-white w-full bg-[#131f24]`}
    >
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131f24] border-b-0 md:border-b-2  border-slate-600 md:hidden">
        <div className="flex items-center justify-between p-4">
          <h3
            className={`${fredoka.className} text-blue-500 text-4xl font-extrabold`}
          >
            peruse
          </h3>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Flame size={20} color="orange" />
              <span className="text-sm font-semibold">
                {userData?.streak ?? 0}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <HeartOffIcon size={20} color="red" />
              <span className="text-sm font-semibold">
                {userData?.hearts ?? 0}
              </span>
            </span>
          </div>
        </div>

        {/* Current Resource Info */}
        <div className="px-4 pb-4">
          <p className="text-blue-200 font-semibold text-sm">WEEK 1</p>
          <p className="font-bold flex flex-col">
            <span className="text-yellow-500 text-lg">{currentResource}</span>
            <span className="text-sm">BY {currentAuthor.toUpperCase()}</span>
          </p>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed hidden md:block z-100 top-0 left-0 h-screen w-60 border-r-2 border-slate-600 pl-5 pr-3">
        <h3
          className={`${fredoka.className} text-blue-500 text-3xl font-extrabold mt-6`}
        >
          peruse
        </h3>
        <div className="flex flex-col gap-10 mt-10 h-screen w-full">
          <Link href={"/take-quiz"}>
            <button
              onClick={() => setActivePage("take-quiz")}
              className={`flex items-center gap-3 cursor-pointer hover:opacity-80 px-5 py-4 rounded-2xl text-left ${
                activePage === "take-quiz" ? "border-2 border-green-400" : ""
              }`}
            >
              <Lightbulb size={35} color="yellow" />
              <span className="font-semibold">TAKE QUIZ</span>
            </button>
          </Link>

          <Link href={"/about-peruse"}>
            <button
              onClick={() => setActivePage("about-us")}
              className={`flex items-center cursor-pointer hover:opacity-80 gap-3 px-5 py-4 rounded-2xl text-left ${
                activePage === "about-us" ? " border-2 border-green-400" : ""
              }`}
            >
              <BookOpen size={30} color="green" />
              <span className="font-semibold">ABOUT US</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-60 lg:mr-80 pb-20 md:pb-0 pt-24 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex fixed z-101 rounded-lg top-0 left-60 right-80 h-24 bg-blue-500 items-center justify-between px-6">
          <div className="flex flex-col space-y-1">
            <p className="text-blue-200 font-semibold text-sm">WEEK 1</p>
            <p className="font-bold flex flex-col">
              <span className="text-yellow-400">{currentResource}</span>
              <span className="text-sm">BY {currentAuthor.toUpperCase()}</span>
            </p>
          </div>

          <div className="relative group">
            <button
              disabled={isProcessing}
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className="flex items-center gap-2 px-4 py-3 disabled:opacity-50 border-2 border-b-4 border-slate-600 text-sm font-semibold rounded-2xl cursor-pointer hover:opacity-80"
            >
              <Library size={24} color="purple" />
              RESOURCES
            </button>

            <AnimatePresence>
              {isResourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute opacity-100 visible transition overflow-hidden left-0 w-75 text-center rounded-2xl z-[200] bg-[#131f24] border-slate-600 border-2 mt-2"
                >
                  <div className="sticky top-0 bg-[#131f24] px-4 text-left py-2 border-b-2 border-slate-500 text-gray-400">
                    Resources
                  </div>
                  <div className="max-h-64 overflow-y-auto p-4 flex flex-col gap-2">
                    {bookResources.map(({ title, author }) => (
                      <button
                        onClick={() => {
                          setCurrentResource(title);
                          setCurrentAuthor(author);
                          setIsResourcesOpen(false);
                        }}
                        className={`font-semibold cursor-pointer hover:bg-[#14545b] tracking-wider w-full text-sm rounded-2xl p-2 text-left ${
                          currentResource === title
                            ? "bg-[#14545b]"
                            : "bg-[#0b2f33]"
                        }`}
                        key={title}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content Grid */}
        <div className="px-4 md:px-2 mx-auto space-y-4 gap-2 grid grid-cols-2 lg:grid-cols-3 pt-20 w-full md:pt-30">
          {renderedResource}
        </div>

        {/* Mobile Resources Dropdown */}
        <div className="fixed bottom-20 right-4 md:hidden z-40">
          <AnimatePresence>
            {isResourcesOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-[#131f24] border-2 border-slate-600 rounded-2xl p-4 mb-2 max-h-64 overflow-y-auto"
              >
                <div className="text-gray-400 text-sm mb-2">Resources</div>
                <div className="flex flex-col gap-2">
                  {bookResources.map(({ title, author }) => (
                    <button
                      onClick={() => {
                        setCurrentResource(title);
                        setCurrentAuthor(author);
                        setIsResourcesOpen(false);
                      }}
                      className={`font-semibold  cursor-pointer hover:bg-[#14545b] tracking-wider text-sm rounded-2xl p-2 text-left ${
                        currentResource === title
                          ? "bg-[#14545b]"
                          : "bg-[#0b2f33]"
                      }`}
                      key={title}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={isProcessing}
            onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            className="bg-blue-500 disabled:opacity-50 p-4 rounded-full shadow-lg"
          >
            <Library size={24} color="white" />
          </button>
        </div>
      </main>

      {/* Desktop Right Sidebar */}
      <aside className="hidden lg:block w-80 pl-5 fixed top-0 right-0 h-screen">
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
                <p className="font-semibold text-[17px] tracking-wider">
                  Badge
                </p>
              </span>
              <span className="text-[17px] font-semibold text-gray-300">
                {userData?.hasPremium ? "Beacon" : "Newbie"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}

      {/* Mobile User Info Panel */}
    </div>
  );
};

export default Quiz;
