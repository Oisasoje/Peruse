"use client";

import { signOut } from "firebase/auth";
import { doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { Flame, HeartOffIcon, Library } from "lucide-react";
import { Fredoka, Inter } from "next/font/google";

import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";

import { useLoader } from "../components/LoaderContext";
import { useRouter } from "next/navigation";
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
  },
);
const Ultralearning = dynamic(() => import("../components/Ultralearning"), {
  ssr: false,
  loading: () => <SimpleLoader />,
});
const Essentialism = dynamic(() => import("../components/Essentialism"), {
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
  // { title: "LAWS OF HUMAN NATURE", author: "Robert Greene" },
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
    ) : currentResource === "ESSENTIALISM" ? (
      <Essentialism />
    ) : (
      ""
    );

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

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131f24]">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${inter.className} bg-[#131f24] text-white w-full overflow-x-hidden`}
    >
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131f24]/80 backdrop-blur-md border-b border-slate-700/50 md:hidden">
        <div className="flex items-center justify-between p-4">
          <h3
            className={`${fredoka.className} text-blue-500 text-3xl font-extrabold`}
          >
            peruse
          </h3>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700">
              <Flame size={18} className="text-orange-500" />
              <span className="text-sm font-semibold">
                {userData?.streak ?? 0}
              </span>
            </span>
            <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700">
              <HeartOffIcon size={18} className="text-red-500" />
              <span className="text-sm font-semibold">
                {userData?.hearts ?? 0}
              </span>
            </span>
          </div>
        </div>

        {/* Current Resource Info */}
        <div className="px-4 pb-3">
          <p className="font-bold flex flex-col text-xs tracking-wide">
            <span className="text-yellow-500 uppercase truncate">
              {currentResource}
            </span>
            <span className="text-slate-400 truncate text-[10px]">
              BY {currentAuthor.toUpperCase()}
            </span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 lg:mr-80 pb-24 md:pb-8 pt-28 md:pt-8 px-4 transition-all duration-300">
        {/* Desktop Header */}
        <header className="hidden md:flex fixed z-40 rounded-2xl top-4 left-64 right-6 lg:right-84 h-20 bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 items-center justify-between px-8 shadow-xl">
          <div className="flex flex-col space-y-0.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              CURRENTLY READING
            </span>
            <p className="font-bold flex flex-col">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 text-lg">
                {currentResource}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                BY {currentAuthor.toUpperCase()}
              </span>
            </p>
          </div>

          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing}
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className="flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 border border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-sm font-bold rounded-xl cursor-pointer transition-all shadow-lg"
            >
              <Library size={20} className="text-purple-400" />
              LIBRARY
            </motion.button>

            <AnimatePresence>
              {isResourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 w-80 rounded-2xl z-[200] bg-[#1e293b] border border-slate-600 shadow-2xl mt-4 overflow-hidden"
                >
                  <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Available Books
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
                    {bookResources.map(({ title, author }) => (
                      <button
                        onClick={() => {
                          setCurrentResource(title);
                          setCurrentAuthor(author);
                          setIsResourcesOpen(false);
                        }}
                        className={`group flex flex-col items-start px-4 py-3 rounded-xl transition-all ${
                          currentResource === title
                            ? "bg-blue-600/20 border border-blue-500/30"
                            : "hover:bg-slate-700/50 border border-transparent"
                        }`}
                        key={title}
                      >
                        <span
                          className={`font-bold text-sm ${currentResource === title ? "text-blue-400" : "text-slate-200"}`}
                        >
                          {title}
                        </span>
                        <span className="text-xs text-slate-500">{author}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content Grid */}
        <div className="mx-auto w-full md:pt-24 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {renderedResource}
          </motion.div>
        </div>

        {/* Mobile Resources FAB */}
        <div className="fixed bottom-24 right-6 md:hidden z-40">
          <AnimatePresence>
            {isResourcesOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-16 right-0 w-72 bg-[#1e293b] border border-slate-600 rounded-2xl shadow-2xl overflow-hidden mb-2"
              >
                <div className="bg-slate-800/50 px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  Library
                </div>
                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                  {bookResources.map(({ title, author }) => (
                    <button
                      onClick={() => {
                        setCurrentResource(title);
                        setCurrentAuthor(author);
                        setIsResourcesOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        currentResource === title
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "hover:bg-slate-700/50 border border-transparent"
                      }`}
                      key={title}
                    >
                      <div
                        className={`font-bold text-sm ${currentResource === title ? "text-blue-400" : "text-white"}`}
                      >
                        {title}
                      </div>
                      <div className="text-xs text-slate-500">{author}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={isProcessing}
            onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-14 h-14 rounded-full shadow-lg shadow-blue-900/40 flex items-center justify-center text-white transition-colors"
          >
            <Library size={24} />
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
