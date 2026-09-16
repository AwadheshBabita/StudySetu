'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const materialTypes = [
  {
    type: 'notes',
    title: 'Notes',
    description: 'Short and focused study notes.',
  },
  {
    type: 'mcq',
    title: 'MCQ Practice',
    description: 'Practice topic-wise multiple choice questions.',
  },
  {
    type: 'pyq',
    title: 'Previous Year Questions',
    description: 'Practice previous year questions.',
  },
  {
    type: 'revision',
    title: 'One-Page Revision',
    description: 'Quick revision before your exam.',
  },
  {
    type: 'topic-test',
    title: 'Topic Test',
    description: 'Test your preparation for this topic.',
  },
];

function StudyMaterialContent() {
  const searchParams = useSearchParams();

  const topic = searchParams.get('topic') || 'Selected Topic';
  const exam = searchParams.get('exam') || 'Selected Exam';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-semibold text-blue-600">
            STUDY MATERIAL
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {topic}
          </h1>

          <p className="mt-2 text-gray-600">
            Exam: {exam}
          </p>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materialTypes.map((material) => (
            <Link
              key={material.type}
              href={`/study/material/${material.type}?topic=${encodeURIComponent(
                topic
              )}&exam=${encodeURIComponent(exam)}`}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {material.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {material.description}
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-blue-600">
                Open →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}


export default function StudyMaterialPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            Loading...
          </div>
        </main>
      }
    >
      <StudyMaterialContent />
    </Suspense>
  );
}
