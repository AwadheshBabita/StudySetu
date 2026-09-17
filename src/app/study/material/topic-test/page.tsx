'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TestEngine from '@/components/test-engine';
import { questionBank } from '@/data/question-bank';

function TopicTestContent() {
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
          Topic Test
        </h1>

        <p className="mt-2 text-gray-600">
          Topic-wise test with score calculation.
        </p>

        {topic && (
          <p className="mt-2 text-sm text-gray-500">
            Topic: {topic}
          </p>
        )}
      </div>

      <TestEngine
        questions={questions}
        title="Topic Test"
      />
    </main>
  );
}

export default function TopicTestPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-4 py-8">
          Loading Topic Test...
        </main>
      }
    >
      <TopicTestContent />
    </Suspense>
  );
}
