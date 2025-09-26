"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useLoader } from "./LoaderContext";
import { Check } from "lucide-react";

type UserDoc = {
  createdAt: string; // or Firebase Timestamp if you switch later
  displayName: string;
  hasPremium: boolean;
  hearts: number;
  lastAnsweredAt: string;
  podName: string;
  podNameChangeCount: number;
  quizzesTaken: number;
  streak: number;
  completedChapters: string[];
};

const CompletionBadge = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="absolute top-2 right-2 z-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full p-2 shadow-lg"
  >
    <Check strokeWidth={3} className="w-5 h-5 text-white" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute inset-0 rounded-full border-2 border-emerald-300"
    />
  </motion.div>
);

const emotionalIntelChapters = [
  {
    chapter: "Chapter 1",
    title: "THE JOURNEY",
    img: "/assets/thejourney.svg",
  },
  {
    chapter: "Chapter 2",
    title: "THE BIG PICTURE",
    img: "/assets/chapter2.svg",
  },
  {
    chapter: "Chapter 3",
    title: "WHAT EMOTIONAL INTELLIGENCE LOOKS LIKE",
    img: "/assets/chapter3.jpg",
  },
  {
    chapter: "Chapter 4",
    title: "DIGGING IN: AN ACTION TO INCREASE YOUR EQ",
    img: "/assets/chapter4.jpg",
  },
  {
    chapter: "Chapter 5",
    title: "SELF-AWARENESS STRATEGIES",
    img: "/assets/chapter5.svg",
  },
  {
    chapter: "Chapter 6",
    title: "SELF-MANAGEMENT STRATEGIES",
    img: "/assets/chapter6.jpg",
  },
  {
    chapter: "Chapter 7",
    title: "SOCIAL AWARENESS STRATEGIES",
    img: "/assets/chapter7.svg",
  },
  {
    chapter: "Chapter 8",
    title: "RELATIONSHIP MANAGEMENT STRATEGIES",
    img: "/assets/chapter8.svg",
  },
];

const EmotionalIntelligence = () => {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const { isProcessing, setIsProcessing } = useLoader();

  const { loading, setLoading } = useLoader(); // new
  const router = useRouter();

  const isChapterCompleted = (chapterIndex: number) => {
    if (!userDoc?.completedChapters) return false;
    const chapterId = `deep-work-chapter-${chapterIndex + 1}`;
    return userDoc.completedChapters.includes(chapterId);
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserDoc(snap.data() as UserDoc);
      }
      setLoading(false); // loaded whether snap exists or not
    });

    return unsub;
  }, []);

  const handleClick = async (chapterIndex: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (!userDoc || userDoc.hearts <= 0) {
        toast.error("No hearts left!");
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      // 1️⃣ Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        hearts: increment(-1),
      });

      // 2️⃣ Update cookie for middleware
      const newHearts = userDoc.hearts - 1;
      Cookies.set("hearts", String(newHearts), { path: "/" });

      // 3️⃣ Tiny wait to ensure cookie is written
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 4️⃣ Redirect to quiz
      router.push(
        `/quiz/emotional-intelligence-2.0/chapter${chapterIndex + 1}`
      );
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong!");
      setTimeout(() => {
        setIsProcessing(false);
      }, 8000);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 15000);
    }
  };

  if (loading || isProcessing) {
    // show placeholder or spinner until userDoc is loaded
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#131f24]/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 bg-[#1e1e1e] text-white px-6 py-4 rounded-2xl shadow-lg"
        >
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      {emotionalIntelChapters.map(({ title, img, chapter }, i) => {
        const completed = isChapterCompleted(i);
        return (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={` relative border-2 pb-10 h-80 border-slate-600 flex flex-col items-center border-b-4 shadow-xl rounded-2xl justify-between text-center ${
              completed ? "opacity-100" : "opacity-70"
            } overflow-hidden transition-opacity 
      ${
        isProcessing
          ? "pointer-events-none opacity-50"
          : "cursor-pointer hover:opacity-90"
      }`}
          >
            {completed && <CompletionBadge />}
            <Image
              src={img}
              alt={title}
              width={200}
              height={200}
              className="object-cover w-full pointer-events-none"
            />
            <p className="flex pt-[70px] pb-4 flex-col items-center">
              <span className="font-semibold tracking-wider">{chapter}</span>
              <span className="text-sm text-gray-400">{title}</span>
            </p>
          </div>
        );
      })}
    </>
  );
};

export default EmotionalIntelligence;
