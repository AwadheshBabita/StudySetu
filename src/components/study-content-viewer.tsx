'use client';

import type { StudyContent } from '@/data/content-engine';

type Props = {
  content: StudyContent[];
};

export default function StudyContentViewer({ content }: Props) {
  if (content.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold">Content Coming Soon</h2>
        <p className="mt-2 text-gray-600">
          Verified study content for this topic will be added here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {content.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {item.type.toUpperCase()}
            </span>

            <span className="text-xs font-semibold text-gray-500">
              {item.status.toUpperCase()}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-bold">
            {item.title}
          </h2>

          <p className="mt-2 text-gray-600">
            {item.summary}
          </p>

          <div className="mt-5 space-y-3">
            {item.content.map((paragraph, index) => (
              <p
                key={index}
                className="leading-7 text-gray-800"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
