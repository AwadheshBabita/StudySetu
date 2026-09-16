"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notes } from "@/data/notes";

function NotesContent() {
  const searchParams = useSearchParams();

  const topicId = searchParams.get("topic") || "";
  const examId = searchParams.get("exam") || "";

  const note = notes.find(
    (item) =>
      item.topicId === topicId &&
      item.examId === examId &&
      item.available
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/study/material?topic=${topicId}&exam=${examId}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Study Material
        </Link>
      </div>

      {!note ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Notes अभी उपलब्ध नहीं हैं
          </h1>
          <p className="mt-3 text-gray-600">
            इस topic के Notes जल्द उपलब्ध किए जाएंगे।
          </p>
        </section>
      ) : (
        <>
          <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">
              StudySetu Notes
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {note.title}
            </h1>

            <p className="mt-3 text-gray-600">
              {note.shortDescription}
            </p>
          </header>

          <div className="mt-6 space-y-6">
            {note.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {section.heading}
                </h2>

                <div className="mt-4 space-y-3">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="leading-7 text-gray-700"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Key Points
              </h2>

              <ul className="mt-4 space-y-3">
                {note.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-gray-700"
                  >
                    <span className="font-bold text-blue-600">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/study/material?topic=${topicId}&exam=${examId}`}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← All Materials
            </Link>

            <Link
              href={`/study?exam=${examId}`}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Continue Study →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-4 py-12 text-center">
          Loading Notes...
        </main>
      }
    >
      <NotesContent />
    </Suspense>
  );
}
