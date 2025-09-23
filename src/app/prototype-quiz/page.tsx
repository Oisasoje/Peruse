"use client";

import { Fredoka, Inter, Nosifer, Orbitron } from "next/font/google";
import Image from "next/image";
import { motion, scale } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaShareSquare } from "react-icons/fa";
import Link from "next/link";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const nosifer = Nosifer({
  subsets: ["latin"],
  weight: ["400"],
});

const Questions = [
  {
    question:
      "Power grid don fail. Society don scatter. You jam deserted grocery store. Wetin you go grab first?",
    options: [
      "A) Canned food and water",
      "B) Medical supplies and antibiotics",
      "C) Tools and weapons",
      "D) Comfort items: coffee, chocolate, blanket",
    ],
  },
  {
    question:
      "Night don fall, hungry dogs dey circle your fire. Wetin you go do?",
    options: [
      "A) Throw dem small food make dem go",
      "B) Pick stick chase dem",
      "C) Climb tree dey wait make dem waka go",
      "D) Try make one become your dog",
    ],
  },
  {
    question:
      "Stranger wey wound but carry food show for camp gate. Wetin you go do?",
    options: [
      "A) Rush go help am share your own tins",
      "B) Collect hin food leave am outside",
      "C) Dey watch am from far",
      "D) Shout question am make fear catch am",
    ],
  },
  {
    question: "If you wan travel for dis wahala time, how you go move?",
    options: [
      "A) Alone, fast fast",
      "B) Small trusted group",
      "C) Any big group wey you see",
      "D) I no dey move at all",
    ],
  },
  {
    question:
      "Camp water tank don dey leak, only remain one day water. Wetin you go do?",
    options: [
      "A) Ration am tight tight",
      "B) Drink plenty now",
      "C) Try fix am yourself",
      "D) Hide small for later",
    ],
  },
  {
    question: "Zombie block only safe road ahead. Wetin you go do?",
    options: [
      "A) Sneak pass quietly",
      "B) Attack am straight",
      "C) Use noise lure am go another place",
      "D) Wait for night slip through",
    ],
  },
  {
    question: "You find stash of old newspaper and books. Wetin you go do?",
    options: [
      "A) Burn am for fire",
      "B) Read am for sense",
      "C) Use am trade",
      "D) Use am as bed",
    ],
  },
  {
    question: "Grandpa talk say we need new base. Which one you go choose?",
    options: [
      "A) Abandoned school",
      "B) Underground bunker",
      "C) Moving bus or train",
      "D) Remote farm for bush",
    ],
  },
  {
    question:
      "Food don finish. Person suggest make una chop camp chicken. Wetin you go do?",
    options: [
      "A) Agree — survival first",
      "B) Refuse — keep breed dem",
      "C) Offer go hunt instead",
      "D) Secretly cook one for yourself",
    ],
  },
  {
    question:
      "Grandpa lean in: 'Last question. Wetin dey keep you dey push for dis life?'",
    options: [
      "A) Hope say we go rebuild better world",
      "B) To protect people wey you love",
      "C) Pure stubbornness and will to live",
      "D) Nothing — just dey waka till e finish",
    ],
  },
];

export const ProgressBar = ({ current = 300, goal = 400 }) => {
  // compute percentage (cap at 100)
  const percent = Math.min(100, Math.round((current / goal) * 100));

  return (
    <div className="w-full text-white max-w-md mx-auto">
      {/* text labels */}
      <div className="text-purple-500 text-2xl mb-2 font-bold">
        Total Shares:{" "}
        <span className="text-white text-lg font-normal">
          <span className="text-2xl text-blue-500 font-semibold">
            {current}
          </span>{" "}
          / {goal.toLocaleString()}
        </span>
      </div>

      {/* bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r via-red-500 from-yellow-400 to-pink-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const Quiz = () => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  const currentQuestion = Questions[currentQuestionIndex].question;
  const options = Questions[currentQuestionIndex].options;
  const roastRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (clickedIndex !== null) {
      roastRef.current?.scrollIntoView({
        behavior: "smooth", // nice animation
        block: "center", // position in viewport (start, center, end, nearest)
      });
    }
  }, [clickedIndex]);

  const getRoast = async (answer: string) => {
    // 1. Show loading state
    setIsLoading(true);

    // 2. Prepare the data. This should include past Q&As for context.
    const requestData = {
      currentQuestion,
      selectedAnswer: answer, // use the fresh one
    };

    const res = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData), // Send the new simple object
    });

    const { roast } = await res.json();
    setCurrentRoast(roast); // Display this in your bubble
    setIsLoading(false);
  };

  return (
    <div className={`w-full ${orbitron.className} min-h-screen bg-black`}>
      <div className="flex z-50 fixed w-full bg-slate-800 justify-between p-4">
        <h1
          className={` ${fredoka.className}  bg-gradient-to-r from-blue-500 via-blue-300 to-white bg-clip-text text-transparent text-4xl font-extrabold`}
        >
          PERUSE
        </h1>
        <div
          className="flex justify-center hover:opacity-80 cursor-pointer items-center gap-3"
          aria-roledescription="button"
        >
          <span className="text-green-500 font-bold text-lg">
            Share With Other Bridgers
          </span>
          <button className="cursor-pointer">
            <FaShareSquare size={35} color="yellow" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <ProgressBar />
        </div>
      </div>
      <div className="flex flex-col  justify-center min-h-screen items-center">
        <div className="mt-25   p-4 min-h-screen w-[700px] flex flex-col justify-center items-center">
          <h2
            className={` font-bold ${nosifer.className} text-rose-600 text-center text-3xl`}
          >
            You Fit Survive The Apocalypse?
          </h2>
          <div className="mt-3 p-6 rounded-2xl border-amber-500 border-4">
            <div className="flex gap-4 justify-between">
              <div className="flex gap-3">
                <div className="w-15 ">
                  <Image
                    src="/assets/perusemascot.png"
                    alt="peruse mascot"
                    width={200}
                    height={200}
                    className="w-full object-cover"
                  />
                </div>
                <div
                  ref={roastRef}
                  tabIndex={-1}
                  className="flex items-start mt-4 space-x-2"
                >
                  {/* The Speech Bubble */}
                  <div className="relative bg-slate-600 text-white p-4 rounded-xl max-w-xs">
                    {/* The "tail" of the bubble pointing to the mascot */}
                    <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-slate-600"></div>
                    {/* The text of the roast */}
                    <p className={`relative z-10 tracking-wider `}>
                      {currentRoast && clickedIndex
                        ? currentRoast
                        : "I can't even be bothered to roast this."}
                    </p>
                  </div>
                </div>
              </div>
              <h3 className="text-xl pr-3  mt-30 text-white">
                <span className="text-2xl font-semibold text-blue-500">
                  Question {currentQuestionIndex + 1}
                </span>
                /10
              </h3>
            </div>

            <p className="text-xl mt-3 text-red-400 font-semibold tracking-wide">
              <span key={Math.random()}>{currentQuestion}</span>
            </p>
            <ul className="mt-3 text-black space-y-4">
              {options.map((option, index) => (
                <motion.li
                  key={index}
                  className=" cursor-pointer max-w-fit text-lg rounded-2xl shadow-lg shadow-green-500 px-6 py-3"
                  onClick={() => {
                    setClickedIndex(index);
                    setSelectedAnswer(option);
                    getRoast(option);
                    // Pass the freshly clicked option
                  }}
                  animate={{
                    scale: clickedIndex === index ? 0.95 : 1,
                    backgroundColor:
                      clickedIndex === index ? "purple" : "white",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  }}
                >
                  {option}
                </motion.li>
              ))}
            </ul>

            <div
              className={`w-full ${
                currentQuestionIndex === 0 ? "justify-end" : "justify-between"
              } flex `}
            >
              <motion.button
                className={`bg-green-600 cursor-pointer hover:bg-green-500 text-xl text-white mt-6 font-bold ${
                  currentQuestionIndex > 0 ? "block" : "hidden"
                } px-10 py-3  outline-none rounded-lg`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestionIndex(
                    (prev) => (prev - 1) % Questions.length
                  );
                  setClickedIndex(null);
                  setCurrentRoast(null);
                }}
              >
                Previous
              </motion.button>
              <motion.button
                className={`bg-amber-600 ${
                  currentQuestionIndex + 1 < Questions.length
                    ? "block"
                    : "hidden"
                } cursor-pointer hover:bg-amber-500 self-end justify-self-end text-xl mt-6 font-bold px-10 py-3  outline-none rounded-lg`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestionIndex(
                    (prev) => (prev + 1) % Questions.length
                  );
                  setClickedIndex(null);
                  setCurrentRoast(null);
                }}
              >
                Next
              </motion.button>
              <Link
                href="/submit"
                className={`${
                  currentQuestionIndex + 1 === Questions.length
                    ? "block"
                    : "hidden"
                }`}
              >
                <motion.button
                  className={`bg-amber-600  cursor-pointer hover:bg-amber-500 self-end text-xl mt-6 font-bold px-10 py-3  outline-none rounded-lg`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setClickedIndex(null);
                    setCurrentRoast(null);
                  }}
                >
                  Submit
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Quiz;
