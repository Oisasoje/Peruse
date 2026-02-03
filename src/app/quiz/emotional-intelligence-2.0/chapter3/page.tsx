"use client";

import QuestionsComponent from "@/app/components/Questions";
import { emotionalIntelligenceChapter3Questions as Questions } from "@/data/emotional-intelligence";
import { useEffect, useState } from "react";

interface Questions {
  id: number;
  question: string;
  options: string[];
  book: string;
}

const Chapter3 = () => {
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
      className="min-h-screen pb-50 font-body text-white  bg-[#131f24]"
    >
      <QuestionsComponent
        id={id}
        question={question}
        options={options}
        book={book}
        currentQuestionIndex={currentQuestionIndex}
        direction={direction}
        width={width}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setDirection={setDirection}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        quizId="emotional-intelligence-chapter3"
      />
    </div>
  );
};
export default Chapter3;
