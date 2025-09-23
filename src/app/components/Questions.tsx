import Image from "next/image";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartOffIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../../../lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { serverTimestamp } from "firebase/firestore";
import { Inter } from "next/font/google";

interface Questions {
  id: number;
  question: string;
  options: string[];
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

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
};

type SelectedOptions = Record<number, string>;

const QuestionsComponent = ({
  Questions,
  question,
  options,
  id,
  book,
  currentQuestionIndex,
  direction,
  width,
  setCurrentQuestionIndex,
  setDirection,
  selectedOptions,
  setSelectedOptions,
  quizId,
}: {
  Questions: Questions[];
  question: string;
  options: string[];
  id: number;
  book: string;
  currentQuestionIndex: number;
  direction: number;
  width: number;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setDirection: Dispatch<SetStateAction<number>>;
  selectedOptions: SelectedOptions;
  setSelectedOptions: Dispatch<SetStateAction<SelectedOptions>>;
  quizId: string;
}) => {
  // normalize parsed selectedOptions so keys are numbers & strings trimmed
  const normalizeSelectedOptions = (raw: any) => {
    if (!raw || typeof raw !== "object") return {};
    return Object.entries(raw).reduce((acc, [k, v]) => {
      const val = typeof v === "string" ? v.trim() : String(v);
      acc[Number(k)] = val;
      return acc;
    }, {} as Record<number, string>);
  };

  const completionMessages = [
    `🔥 Another chapter down! Mama Kuti is impressed you finished Chapter ${id} of ${book}.`,
    `From page-turner to page-master: Chapter ${id} of ${book} is officially yours.`,
    `Your brain just did push-ups through Chapter ${id} — keep flexing that ${book} muscle!`,
    `🎯 You just crossed Chapter ${id} of ${book} like a pro. The Bridge salutes you!`,
    `Ah-ah, you actually finished Chapter ${id}? Mama Kuti didn't see that coming. 🏆`,
    `Your attention span just shocked the nation. Chapter ${id} of ${book}… conquered.`,
    `Not just reading — bridging. Chapter ${id} of ${book} done and dusted. 💪`,
    `📚 Chapter ${id} in the bag! ${book} is starting to look like your playground.`,
    `Who said you can't focus? Chapter ${id} of ${book} complete. Respect!`,
    `🚀 You and ${book} are becoming besties. Chapter ${id} absorbed. On to the next!`,
  ];

  const randomMessage =
    completionMessages[Math.floor(Math.random() * completionMessages.length)];

  const router = useRouter();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [roasts, setRoasts] = useState<Record<number, string>>({});
  const [roastCache, setRoastCache] = useState<Record<string, string>>({});
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isRoastLoading, setIsRoastLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [resultModal, setResultModal] = useState(false);

  // Save progress to sessionStorage whenever it changes
  useEffect(() => {
    if (!hasRestoredProgress) return;

    const quizProgress = {
      selectedOptions,
      currentQuestionIndex,
      roasts,
    };

    sessionStorage.setItem(
      `quiz-${quizId}-progress`,
      JSON.stringify(quizProgress)
    );
  }, [
    selectedOptions,
    currentQuestionIndex,
    roasts,
    quizId,
    hasRestoredProgress,
  ]);

  // Restore progress from sessionStorage on component mount
  useEffect(() => {
    const navEntries = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (!isReload) {
      sessionStorage.removeItem(`quiz-${quizId}-progress`);
    }
  }, [quizId]);

  useEffect(() => {
    const savedProgress = sessionStorage.getItem(`quiz-${quizId}-progress`);

    if (!savedProgress) {
      setHasRestoredProgress(true);
      return;
    }

    try {
      const progress = JSON.parse(savedProgress);
      const normalizedSelectedOptions = normalizeSelectedOptions(
        progress.selectedOptions
      );

      setSelectedOptions(normalizedSelectedOptions);
      setCurrentQuestionIndex(
        typeof progress.currentQuestionIndex !== "undefined"
          ? Number(progress.currentQuestionIndex)
          : 0
      );
      setRoasts(progress.roasts || {});

      toast.success("Your quiz progress has been restored!");
    } catch (error) {
      console.error("Error restoring quiz progress:", error);
      sessionStorage.removeItem(`quiz-${quizId}-progress`);
    } finally {
      setHasRestoredProgress(true);
    }
  }, [quizId, setSelectedOptions, setCurrentQuestionIndex]);

  // Clear progress when quiz is completed
  const clearQuizProgress = () => {
    sessionStorage.removeItem(`quiz-${quizId}-progress`);
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.hearts < 0) {
          router.replace("/out-of-hearts");
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserDoc(snap.data() as UserDoc);
      }
    });
  }, []);

  const hearts = userDoc?.hearts ?? 0;

  const handleClickOption = async (
    option: string,
    event: MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    if (currentSelectedOption || isLoading) return;

    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestionIndex]: option.trim(),
    }));

    setIsRoastLoading((prev) => ({ ...prev, [currentQuestionIndex]: true }));

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentQuestion: question,
          selectedAnswer: option,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch roast");

      const data = await res.json();
      setRoasts((prev) => ({ ...prev, [currentQuestionIndex]: data.roast }));
    } catch (err) {
      console.error("Error fetching roast:", err);
      setRoasts((prev) => ({
        ...prev,
        [currentQuestionIndex]: "I can't even be bothered to roast this.",
      }));
    } finally {
      setIsRoastLoading((prev) => ({ ...prev, [currentQuestionIndex]: false }));
    }
  };

  const handleSubmitQuiz = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to submit a quiz");
      return;
    }

    setIsSubmitting(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userRef);
      if (!userDocSnap.exists()) {
        toast.error("User data not found");
        return;
      }

      const userData = userDocSnap.data() as UserDoc;
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );

      let lastPlayedDate: Date | null = null;
      if (userData.lastAnsweredAt) {
        const tempDate = new Date(userData.lastAnsweredAt);
        lastPlayedDate = new Date(
          Date.UTC(
            tempDate.getUTCFullYear(),
            tempDate.getUTCMonth(),
            tempDate.getUTCDate()
          )
        );
      }

      let streakUpdate = userData.streak || 0;

      if (!lastPlayedDate) {
        streakUpdate = 1;
      } else {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        if (lastPlayedDate.getTime() === today.getTime()) {
          // Keep streak unchanged
        } else if (lastPlayedDate.getTime() === yesterday.getTime()) {
          streakUpdate += 1;
        } else {
          streakUpdate = 1;
        }
      }

      await updateDoc(userRef, {
        quizzesTaken: increment(1),
        lastAnsweredAt: serverTimestamp(),
        streak: streakUpdate,
      });

      clearQuizProgress();
      toast.success("Quiz submitted successfully!");

      setTimeout(() => {
        setResultModal(true);
      }, 1500);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(selectedOptions).length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved quiz progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedOptions]);

  const isLastQuestion = currentQuestionIndex === 9;

  if (!hasRestoredProgress) {
    return (
      <div className="pt-5 w-full h-full flex items-center justify-center">
        <span>Loading your quiz…</span>
      </div>
    );
  }

  const currentSelectedOption = selectedOptions[currentQuestionIndex];

  return (
    <div
      className={`pt-5 ${inter.className} w-full flex flex-col items-center px-4 sm:px-6 lg:px-8`}
    >
      {resultModal && (
        <div
          className={`inset-0 z-50 fixed bg-black/40 flex justify-center items-center w-full h-full ${inter.className} px-4`}
        >
          <div className="bg-blue-500 text-center p-4 sm:p-6 rounded-2xl shadow-lg max-w-md w-full mx-4 text-white">
            <h1 className="text-xl sm:text-2xl tracking-wider font-bold">
              Congratulations! <span className="text-2xl sm:text-3xl">🎉</span>
            </h1>
            <p className="mt-2 text-base sm:text-lg">{randomMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link href={"/take-quiz"}>
                <button className="bg-blue-600 cursor-pointer px-4 py-2 rounded-xl hover:bg-blue-800 w-full sm:w-auto">
                  Back To Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex w-full items-center justify-between gap-3 sm:gap-5 mt-4 max-w-4xl">
        <Link href={"/take-quiz"}>
          <span className="text-[#37464f]">
            <X
              size={30}
              className="sm:size-[30px] hover:opacity-60 cursor-pointer"
            />
          </span>
        </Link>

        <div className="flex-1 max-w-2xl">
          <div className="w-full overflow-hidden h-4 bg-[#37464f] rounded-2xl">
            <div
              className="h-4 rounded-2xl bg-blue-500 transition-all duration-500 ease-in-out"
              style={{ width: `${width}%` }}
            ></div>
          </div>
        </div>

        <span className="flex items-center gap-2 min-w-fit">
          <HeartOffIcon
            size={30}
            className="sm:size-[30px]"
            strokeWidth={3}
            color="red"
          />
          <span className="flex flex-col">
            <span className="font-semibold text-base sm:text-lg text-red-500">
              {hearts}
            </span>
          </span>
        </span>
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: direction * 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -30, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-5 w-full max-w-4xl"
        >
          {/* Question Text */}
          <div className="px-2 sm:px-0">
            <span className="text-lg sm:text-xl lg:text-2xl text-gray-100 font-extrabold tracking-wider leading-relaxed">
              {question}
            </span>
          </div>

          {/* Character and Speech Bubble */}
          <div className="flex flex-row gap-4 items-start sm:items-center mt-6 px-2 sm:px-0">
            <div className="w-20 h-20 sm:w-20 sm:h-20 lg:w-25 lg:h-25 border-amber-500 border-2 border-b-4 sm:ml-12 shadow-black shadow-xl rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/assets/mezie-cartoon.jpg"
                alt="Mezie The Sage"
                width={100}
                height={100}
                className="w-full h-full pointer-events-none object-cover"
              />
            </div>

            <div className="relative bg-slate-600 text-white p-3 sm:p-4 rounded-xl max-w-full sm:max-w-xs lg:max-w-md">
              <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-slate-600 block"></div>

              <p className="relative z-10 tracking-wider text-sm sm:text-base leading-relaxed">
                {isRoastLoading[currentQuestionIndex]
                  ? "Loading roast..."
                  : roasts[currentQuestionIndex] ??
                    "I can't even be bothered to roast this."}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="mt-6 sm:mt-8 space-y-3 w-full">
            {options.map((option, index) => {
              const isSelected = currentSelectedOption === option.trim();
              const hasAnswerForThisQuestion =
                Object.prototype.hasOwnProperty.call(
                  selectedOptions,
                  currentQuestionIndex
                );

              return (
                <motion.div
                  key={index}
                  animate={{
                    scale: isSelected ? 0.98 : 1,
                    opacity: hasAnswerForThisQuestion && !isSelected ? 0.7 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`w-full px-4 py-3 sm:px-6 sm:py-4 rounded-2xl text-base sm:text-lg
                    ${
                      isSelected
                        ? "bg-slate-800 border-amber-500"
                        : hasAnswerForThisQuestion
                        ? "bg-gray-600 cursor-not-allowed"
                        : "hover:bg-slate-700 cursor-pointer"
                    }
                    font-bold border-2 border-b-4 tracking-wide transition-colors duration-200`}
                  onClick={(event) => {
                    if (!currentSelectedOption) {
                      handleClickOption(option, event, index);
                    }
                  }}
                >
                  {option}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 mt-8 sm:mt-10 justify-between w-full max-w-4xl px-2 sm:px-0">
        <button
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 sm:px-15 sm:py-2 rounded-2xl text-base sm:text-xl font-bold tracking-wider border-2 border-b-4
            ${
              currentQuestionIndex === 0
                ? "text-slate-500 border-slate-500 cursor-not-allowed opacity-40"
                : "text-white border-white cursor-pointer hover:bg-[#101b1f]"
            } outline-none transition-colors duration-200`}
          onClick={() => {
            setCurrentQuestionIndex((prev) => prev - 1);
            setDirection(-1);
          }}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            className="px-6 py-3 sm:px-10 sm:py-2 outline-none rounded-2xl text-base sm:text-xl font-bold cursor-pointer 
              text-white tracking-wider bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed
              transition-colors duration-200 w-full sm:w-auto"
            onClick={handleSubmitQuiz}
            disabled={!selectedOptions[currentQuestionIndex] || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            disabled={!selectedOptions[currentQuestionIndex]}
            className={`px-6 py-3 sm:px-15 sm:py-2 outline-none rounded-2xl text-base sm:text-xl font-bold tracking-wider 
              transition-all duration-200 w-full sm:w-auto
              ${
                !selectedOptions[currentQuestionIndex]
                  ? "bg-blue-300 text-slate-700 cursor-not-allowed"
                  : "bg-blue-500 text-[#131f24] hover:bg-blue-400 cursor-pointer"
              }`}
            onClick={() => {
              if (selectedOptions[currentQuestionIndex]) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setDirection(1);
              }
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionsComponent;
