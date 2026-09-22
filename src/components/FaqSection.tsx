'use client';

import React, { useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  title?: string;
  items: FaqItem[];
  pageUrl: string;
}

export default function FaqSection({ 
  title = "अक्सर पूछे जाने वाले सवाल (FAQs & Help Guide)", 
  items,
  pageUrl
}: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  // Google SEO Schema (FAQPage)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((it) => ({
      "@type": "Question",
      "name": it.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": it.a,
      },
    })),
  };

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      {/* गूगल बॉट के लिए अदृश्य स्कीमा */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <span>❓</span>
          <span>{title}</span>
        </h2>

        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 transition"
                >
                  <span>{item.q}</span>
                  <span className="text-slate-500 font-mono text-base shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-3.5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
