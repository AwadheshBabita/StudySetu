'use client';

import { useMemo, useState } from 'react';
import type { Question } from '@/data/question-bank';

type Props = {
  questions: Question[];
};

export default function MCQPractice({ questions }: Props) {
  const safeQuestions = useMemo(
    () => questions.filter((q) => q.options.length >= 2),
    [questions]
  );

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <h2 className="text-xl font-bold">No Questions Available</h2>
        <p className="mt-2 text-gray-600">
          Questions for this topic will be added soon.
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <h2 className="text-2xl font-bold">Test Completed</h2>

        <p className="mt-4 text-lg">
          Score: <strong>{score}</strong> / {safeQuestions.length}
        </p>

        <button
          type="button"
          onClick={() => {
            setCurrent(0);
            setSelected(null);
            setScore(0);
            setFinished(false);
          }}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Restart Practice
        </button>
      </div>
    );
  }

  const question = safeQuestions[current];
  const answered = selected !== null;

  function chooseOption(index: number) {
    if (answered) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((value) => value + 1);
    }
  }

  function nextQuestion() {
    if (current === safeQuestions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent((value) => value + 1);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">
          Question {current + 1} / {safeQuestions.length}
        </span>

        <span className="text-sm font-semibold text-gray-600">
          Score: {score}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold leading-7">
          {question.question}
        </h2>

        <div className="mt-5 space-y-3">
          {question.options.map((option, index) => {
            let className =
              'w-full rounded-lg border p-4 text-left font-medium transition';

            if (!answered) {
              className +=
                ' border-gray-200 hover:border-blue-400 hover:bg-blue-50';
            }

            if (answered && index === question.answer) {
              className += ' border-green-500 bg-green-50 text-green-800';
            } else if (
              answered &&
              index === selected &&
              index !== question.answer
            ) {
              className += ' border-red-500 bg-red-50 text-red-800';
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => chooseOption(index)}
                className={className}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="font-bold">
              {selected === question.answer ? '✓ Correct' : '✗ Incorrect'}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {question.explanation}
            </p>
          </div>
        )}

        {answered && (
          <button
            type="button"
            onClick={nextQuestion}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {current === safeQuestions.length - 1
              ? 'Finish Test'
              : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
