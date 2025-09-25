"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

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
};

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

const DeepWork = () => {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [loading, setLoading] = useState(true); // new
  const router = useRouter();

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
      router.push(`/quiz/deepwork/chapter${chapterIndex + 1}`);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong!");
    }
  };

  if (loading) {
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
      {deepWorkChapters.map(({ title, img, chapter }, i) => (
        <div
          key={i}
          onClick={() => handleClick(i)}
          className={`border-2 h-80 border-slate-600 flex flex-col items-center border-b-4 shadow-xl text-center rounded-2xl justify-between overflow-hidden transition-opacity 
      ${
        isProcessing
          ? "pointer-events-none opacity-50"
          : "cursor-pointer hover:opacity-70"
      }`}
        >
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
      ))}
    </>
  );
};

export default DeepWork;
