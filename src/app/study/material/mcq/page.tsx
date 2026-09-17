'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MCQPractice from '@/components/mcq-practice';
import { questionBank } from '@/data/question-bank';

function MCQContent() {
  const params = useSearchParams();

  const exam = params.get('exam') || 'upsc-cse';
  const topic = params.get('topic') || '';

  const questions = questionBank.filter((question) => {
    if (topic) {
      return (
        question.examId === exam &&
        question.topicId === topic
      );
    }

    return question.examId === exam;
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <a
          href="/study"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Study
        </a>

        <h1 className="mt-4 text-3xl font-bold">
          MCQ Practice
        </h1>

        <p className="mt-2 text-gray-600">
          Practice questions with instant answers, explanations and score.
        </p>

        {topic && (
          <p className="mt-2 text-sm text-gray-500">
            Topic: {topic}
          </p>
        )}
      </div>

      <MCQPractice questions={questions} />
    </main>
  );
}

export default function MCQPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-4 py-8">
          Loading MCQ Practice...
        </main>
      }
    >
      <MCQContent />
    </Suspense>
  );
}
