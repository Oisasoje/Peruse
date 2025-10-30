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
  }
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
      className={`min-h-screen ${inter.className} bg-[#131f24] text-white w-full `}
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
          <p className="font-bold flex flex-col">
            <span className="text-yellow-500 text-lg">{currentResource}</span>
            <span className="text-sm">BY {currentAuthor.toUpperCase()}</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-60 lg:mr-80 pb-20 md:pb-0 pt-24 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex fixed z-101 rounded-lg top-0 left-60 right-80 h-24 bg-blue-500 items-center justify-between px-6">
          <div className="flex flex-col space-y-1">
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
        <div className="px-4 md:px-2 pb-4 mx-auto space-y-4 gap-2 grid grid-cols-2 lg:grid-cols-3 pt-20 w-full md:pt-30">
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
    </div>
  );
};

export default Quiz;
