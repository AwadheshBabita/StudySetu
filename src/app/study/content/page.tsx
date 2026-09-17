'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudyContentViewer from '@/components/study-content-viewer';
import { studyContent } from '@/data/content-engine';

function ContentPage() {
  const params = useSearchParams();

  const exam = params.get('exam') || 'upsc-cse';
  const topic = params.get('topic') || '';
  const type = params.get('type');

  const filtered = studyContent.filter((item) => {
    const examMatch = item.examId === exam;
    const topicMatch = topic ? item.topicId === topic : true;
    const typeMatch = type ? item.type === type : true;

    return examMatch && topicMatch && typeMatch;
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <a
        href="/study"
        className="text-sm font-semibold text-blue-600 hover:underline"
      >
        ← Back to Study
      </a>

      <h1 className="mt-5 text-3xl font-bold">
        Study Content
      </h1>

      <p className="mt-2 text-gray-600">
        Structured study content for UPSC preparation.
      </p>

      <div className="mt-8">
        <StudyContentViewer content={filtered} />
      </div>
    </main>
  );
}

export default function StudyContentPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-4 py-8">
          Loading study content...
        </main>
      }
    >
      <ContentPage />
    </Suspense>
  );
}
