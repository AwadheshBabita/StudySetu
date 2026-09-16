"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mcqs } from "@/data/mcqs";

function MCQPractice() {
  const searchParams = useSearchParams();

  const topicId = searchParams.get("topic") || "reasoning-analogy";
  const examId = searchParams.get("exam") || "ssc-cgl";

  const questions = useMemo(
    () =>
      mcqs.filter(
        (item) =>
          item.examId === examId &&
          item.topicId === topicId
      ),
    [examId, topicId]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  function selectAnswer(optionId: string) {
    if (selectedOption) return;

    setSelectedOption(optionId);

    if (optionId === currentQuestion.correctOptionId) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedOption(null);
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            MCQ अभी उपलब्ध नहीं हैं
          </h1>
          <p className="mt-3 text-gray-600">
            इस topic के लिए प्रश्न जल्द उपलब्ध किए जाएंगे।
          </p>

          <Link
            href={`/study/material?topic=${topicId}&exam=${examId}`}
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            ← Study Material
          </Link>
        </div>
      </main>
    );
  }

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-blue-600">
            StudySetu MCQ Practice
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Practice Complete
          </h1>

          <div className="mt-8 rounded-2xl bg-gray-50 p-6">
            <p className="text-5xl font-bold text-gray-900">
              {score}/{questions.length}
            </p>

            <p className="mt-2 text-lg text-gray-600">
              {percentage}% Score
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={restartQuiz}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Practice Again
            </button>

            <Link
              href={`/study/material?topic=${topicId}&exam=${examId}`}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              All Materials
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/study/material?topic=${topicId}&exam=${examId}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Study Material
        </Link>

        <span className="text-sm font-semibold text-gray-600">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-blue-600">
            MCQ Practice
          </p>

          <h1 className="mt-3 text-xl font-bold leading-8 text-gray-900">
            {currentQuestion.question}
          </h1>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect =
              option.id === currentQuestion.correctOptionId;

            let optionClass =
              "border-gray-200 hover:border-blue-400 hover:bg-gray-50";

            if (selectedOption) {
              if (isCorrect) {
                optionClass =
                  "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected) {
                optionClass =
                  "border-red-500 bg-red-50 text-red-800";
              } else {
                optionClass =
                  "border-gray-200 bg-gray-50 text-gray-500";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectAnswer(option.id)}
                disabled={Boolean(selectedOption)}
                className={`w-full rounded-xl border p-4 text-left font-medium transition ${optionClass}`}
              >
                <span className="mr-3 font-bold uppercase">
                  {option.id}.
                </span>
                {option.text}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div
            className={`mt-6 rounded-xl border p-4 ${
              selectedOption === currentQuestion.correctOptionId
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p className="font-bold">
              {selectedOption === currentQuestion.correctOptionId
                ? "✓ सही उत्तर"
                : "✗ गलत उत्तर"}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {selectedOption && (
          <button
            type="button"
            onClick={nextQuestion}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {currentIndex + 1 === questions.length
              ? "View Result"
              : "Next Question →"}
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Current Score: {score}
      </div>
    </main>
  );
}

export default function MCQPage() {
  return (
    <Suspense
      fallback={
        <main className="px-4 py-12 text-center">
          Loading MCQ Practice...
        </main>
      }
    >
      <MCQPractice />
    </Suspense>
  );
}
