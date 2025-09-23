"use client";

import { Inter } from "next/font/google";
import QuestionsComponent from "@/app/components/Questions";
import { emotionalIntelligenceChapter2Questions as Questions } from "../../../../../data";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

interface Questions {
  id: number;
  question: string;
  book: string;
  options: string[];
}

const Chapter2 = () => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [questions, setQuestions] = useState<Questions[] | null>(null);

  useEffect(() => {
    // clone the imported array so we don't mutate it
    const shuffled = [...Questions];

    // Fisher–Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setQuestions(shuffled);
  }, []);

  const currentQuestionList = questions ?? Questions; // fallback
  const currentQuestion = currentQuestionList[currentQuestionIndex];
  const { question, options, id, book } = currentQuestion;

  const width = ((currentQuestionIndex + 1) / Questions.length) * 100;
  const [direction, setDirection] = useState(1);

  return (
    <div
      className={`min-h-screen pb-50 ${inter.className} text-white  bg-[#131f24]`}
    >
      <QuestionsComponent
        id={id}
        question={question}
        book={book}
        options={options}
        currentQuestionIndex={currentQuestionIndex}
        direction={direction}
        width={width}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setDirection={setDirection}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        quizId="emotional-intelligence-chapter2"
      />
    </div>
  );
};
export default Chapter2;
