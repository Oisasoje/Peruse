"use client";

import QuestionsComponent from "@/app/components/Questions";
import { deepWorkChapter1Questions as Questions } from "@/data/deep-work";
import { useEffect, useState } from "react";

interface Questions {
  id: number;
  question: string;
  book: string;
  options: string[];
}

const Chapter1 = () => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
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
        question={question}
        options={options}
        book={book}
        id={id}
        currentQuestionIndex={currentQuestionIndex}
        direction={direction}
        width={width}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setDirection={setDirection}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        quizId="deepwork-chapter1"
      />
    </div>
  );
};
export default Chapter1;
