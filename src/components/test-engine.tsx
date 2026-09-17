'use client';

import { useMemo, useState } from 'react';
import type { Question } from '@/data/question-bank';

type Props = {
  questions: Question[];
  title: string;
};

export default function TestEngine({ questions, title }: Props) {
  const safeQuestions = useMemo(
    () => questions.filter((q) => q.options.length >= 2),
    [questions]
  );

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <h2 className="text-xl font-bold">No Questions Available</h2>
        <p className="mt-2 text-gray-600">
          Questions will be added soon.
        </p>
      </div>
    );
  }

  if (finished) {
    const score = safeQuestions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.answer ? 1 : 0),
      0
    );

    const percentage = Math.round(
      (score / safeQuestions.length) * 100
    );

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold">{title} Completed</h2>

        <div className="mt-6 space-y-2">
          <p className="text-xl">
            Score: <strong>{score}</strong> / {safeQuestions.length}
          </p>

          <p className="text-lg">
            Percentage: <strong>{percentage}%</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrent(0);
            setAnswers({});
            setFinished(false);
          }}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Retake Test
        </button>
      </div>
    );
  }

  const question = safeQuestions[current];
  const selected = answers[current];
  const answered = selected !== undefined;

  function selectAnswer(index: number) {
    if (answered) return;

    setAnswers((previous) => ({
      ...previous,
      [current]: index,
    }));
  }

  function next() {
    if (current === safeQuestions.length - 1) {
      setFinished(true);
    } else {
      setCurrent((value) => value + 1);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">
          Question {current + 1} / {safeQuestions.length}
        </span>

        <span className="text-sm font-semibold text-gray-600">
          Answered: {Object.keys(answers).length}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold leading-7">
          {question.question}
        </h2>

        <div className="mt-5 space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectAnswer(index)}
              className={`w-full rounded-lg border p-4 text-left font-medium transition ${
                selected === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>

        {answered && (
          <button
            type="button"
            onClick={next}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {current === safeQuestions.length - 1
              ? 'Submit Test'
              : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
