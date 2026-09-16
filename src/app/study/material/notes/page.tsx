'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const titles: Record<string, string> = {
  notes: 'Notes',
  mcq: 'MCQ Practice',
  pyq: 'Previous Year Questions',
  revision: 'One-Page Revision',
  'topic-test': 'Topic Test',
};

function MaterialContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'Selected Topic';
  const exam = searchParams.get('exam') || 'Selected Exam';
  const type = 'notes';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-semibold text-blue-600">
            STUDYSETU • STUDY
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {titles[type]}
          </h1>

          <p className="mt-2 text-gray-600">
            Exam: {exam}
          </p>

          <p className="mt-1 text-gray-600">
            Topic: {topic}
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Content coming soon
          </h2>

          <p className="mt-2 text-gray-600">
            This section is ready for verified StudySetu content.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/study"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Study
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function MaterialPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            Loading...
          </div>
        </main>
      }
    >
      <MaterialContent />
    </Suspense>
  );
}
