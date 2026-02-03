import Image from "next/image";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartOffIcon, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../../../lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  Timestamp,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { useUserStore } from "@/lib/store/userStore";
import { impatientPlaceholders, completionMessages } from "@/constants/quiz";

interface Questions {
  id: number;
  question: string;
  options: string[];
}

type SelectedOptions = Record<number, string>;

const QuestionsComponent = ({
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
  const normalizeSelectedOptions = (raw: any) => {
    if (!raw || typeof raw !== "object") return {};
    return Object.entries(raw).reduce(
      (acc, [k, v]) => {
        const val = typeof v === "string" ? v.trim() : String(v);
        acc[Number(k)] = val;
        return acc;
      },
      {} as Record<number, string>,
    );
  };

  const randomMessage =
    completionMessages[Math.floor(Math.random() * completionMessages.length)];

  const router = useRouter();
  const userData = useUserStore((state) => state.userData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roasts, setRoasts] = useState<Record<number, string>>({});
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isRoastLoading, setIsRoastLoading] = useState<Record<number, boolean>>(
    {},
  );
  const [resultModal, setResultModal] = useState(false);

  const getRandomPlaceholder = (questionIndex: number) => {
    const index = questionIndex % impatientPlaceholders.length;
    return impatientPlaceholders[index];
  };

  useEffect(() => {
    if (!hasRestoredProgress) return;
    const quizProgress = {
      selectedOptions,
      currentQuestionIndex,
      roasts,
    };
    sessionStorage.setItem(
      `quiz-${quizId}-progress`,
      JSON.stringify(quizProgress),
    );
  }, [
    selectedOptions,
    currentQuestionIndex,
    roasts,
    quizId,
    hasRestoredProgress,
  ]);

  useEffect(() => {
    const navEntries = performance.getEntriesByType(
      "navigation",
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
        progress.selectedOptions,
      );

      setSelectedOptions(normalizedSelectedOptions);
      setCurrentQuestionIndex(
        typeof progress.currentQuestionIndex !== "undefined"
          ? Number(progress.currentQuestionIndex)
          : 0,
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

  const clearQuizProgress = () => {
    sessionStorage.removeItem(`quiz-${quizId}-progress`);
  };

  useEffect(() => {
    if (userData && userData.hearts < 0) {
      router.replace("/out-of-hearts");
    }
  }, [userData, router]);

  const hearts = userData?.hearts ?? 0;

  const handleClickOption = async (
    option: string,
    event: MouseEvent<HTMLDivElement>,
    index: number,
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
        [currentQuestionIndex]: getRandomPlaceholder(currentQuestionIndex),
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

      const userDataLocal = userDocSnap.data() as any;
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      let lastDateStr: string | null = null;
      if (userDataLocal.lastAnsweredAt) {
        if (userDataLocal.lastAnsweredAt instanceof Timestamp) {
          lastDateStr = userDataLocal.lastAnsweredAt
            .toDate()
            .toISOString()
            .split("T")[0];
        } else if (typeof userDataLocal.lastAnsweredAt === "string") {
          lastDateStr = userDataLocal.lastAnsweredAt.split("T")[0];
        }
      }

      let streakUpdate = userDataLocal.streak || 0;
      if (!lastDateStr) {
        streakUpdate = 1;
      } else {
        if (lastDateStr === today) {
          console.log("Already played today, keeping streak:", streakUpdate);
        } else {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastDateStr === yesterdayStr) {
            streakUpdate += 1;
          } else {
            streakUpdate = 1;
          }
        }
      }

      const chapterId = `${book.toLowerCase().replace(/\s+/g, "-")}-chapter-${id}`;

      await updateDoc(userRef, {
        quizzesTaken: increment(1),
        lastAnsweredAt: serverTimestamp(),
        streak: streakUpdate,
        completedChapters: arrayUnion(chapterId),
      });

      clearQuizProgress();
      toast.success("Chapter completed! 🎉");

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

  const isLastQuestion = currentQuestionIndex === 9;

  if (!hasRestoredProgress) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSelectedOption = selectedOptions[currentQuestionIndex];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center px-4 md:px-6 pb-20 md:pb-0 font-body">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {resultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1e293b] border border-slate-700 text-center p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎉
              </div>

              <h2 className="font-display text-3xl font-extrabold text-white mb-4">
                Chapter Conquered!
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {randomMessage}
              </p>

              <Link href="/take-quiz">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all"
                >
                  Return to Dashboard
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar: Progress & Exit */}
      <div className="w-full flex items-center justify-between gap-6 py-6 border-b border-white/5 mb-8">
        <Link href="/take-quiz">
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </Link>

        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          />
        </div>

        <div className="bg-red-500/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-red-500/20">
          <HeartOffIcon size={18} className="text-red-500" />
          <span className="font-bold text-red-500">{hearts}</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: direction * 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-3xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-center mb-8 md:mb-12">
            {question}
          </h2>

          {/* Character / Roast Area */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-[2px] opacity-20 animate-pulse" />
              <Image
                src="/assets/mezie-cartoon.jpg"
                alt="Mezie The Sage"
                width={80}
                height={80}
                className="rounded-full border-2 border-amber-500 relative z-10 w-full h-full object-cover"
              />
            </div>

            <div className="relative flex-1 bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 w-full text-center md:text-left">
              <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-r-[10px] border-b-[0px] border-transparent border-r-slate-800 hidden md:block" />
              <p className="text-sm md:text-base text-gray-300 italic">
                {isRoastLoading[currentQuestionIndex]
                  ? "Evaluating your life choices..."
                  : (roasts[currentQuestionIndex] ??
                    getRandomPlaceholder(currentQuestionIndex))}
              </p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid gap-3">
            {options.map((option, index) => {
              const isSelected = currentSelectedOption === option.trim();
              const hasAnswered = !!currentSelectedOption;

              return (
                <motion.button
                  key={index}
                  whileHover={
                    !hasAnswered
                      ? {
                          scale: 1.01,
                          backgroundColor: "rgba(30, 41, 59, 0.8)",
                        }
                      : {}
                  }
                  whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                  onClick={(e: any) => handleClickOption(option, e, index)}
                  disabled={hasAnswered}
                  className={`
                    w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-300 text-base md:text-lg font-medium relative overflow-hidden group
                    ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                        : "bg-[#1e293b] border-slate-700 text-gray-300 hover:border-slate-500"
                    }
                    ${hasAnswered && !isSelected ? "opacity-50 grayscale" : ""}
                  `}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? "border-blue-400 bg-blue-500 text-white" : "border-slate-500 text-slate-500 group-hover:border-slate-400"}
                    `}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <span className="text-xs font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#131f24]/90 backdrop-blur-lg border-t border-white/5 md:relative md:bg-transparent md:border-t-0 md:mt-12 md:p-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setCurrentQuestionIndex((prev) => prev - 1);
              setDirection(-1);
            }}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitQuiz}
              disabled={!currentSelectedOption || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {isSubmitting ? "Finishing..." : "Complete Chapter"}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentSelectedOption) {
                  setCurrentQuestionIndex((prev) => prev + 1);
                  setDirection(1);
                }
              }}
              disabled={!currentSelectedOption}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all"
            >
              Next Question
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsComponent;
