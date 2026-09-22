import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EXAM_PRESETS } from '@/data/examPresets';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = EXAM_PRESETS[slug];
  if (!exam) return {};
  return {
    title: `${exam.title} - 100% Free Online Tool`,
    description: exam.desc,
    alternates: {
      canonical: `https://examsewa.online/exams/${slug}`,
    }
  };
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const exam = EXAM_PRESETS[slug];
  if (!exam) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8">
        <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
          1-Click Exam Preset
        </span>
        <h1 className="text-2xl md:text-4xl font-black mt-3">{exam.title}</h1>
        <p className="text-blue-100 text-lg mt-1 font-medium">{exam.hindiTitle}</p>
        <p className="text-slate-200 text-sm mt-3 leading-relaxed">{exam.desc}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
            📸 फोटो की आधिकारिक गाइडलाइन
          </h2>
          <ul className="text-sm text-slate-600 space-y-2">
            <li><strong>साइज रेंज:</strong> {exam.photoSpec.minKb} KB से {exam.photoSpec.maxKb} KB</li>
            <li><strong>डायमेंशन:</strong> {exam.photoSpec.widthMm}mm × {exam.photoSpec.heightMm}mm</li>
            <li><strong>विशेष नियम:</strong> {exam.photoSpec.note}</li>
            {exam.photoSpec.hasDop && <li className="text-amber-600 font-medium">⚠️ फोटो पर नाम और तारीख (Name & Date) आवश्यक है।</li>}
          </ul>
          <Link
            href={`/tools/photo-resizer?preset=${exam.slug}`}
            className="mt-6 block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition"
          >
            यह फोटो रिसाइज़र अभी खोलें ➔
          </Link>
        </div>

        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
            ✍️ सिग्नेचर (हस्ताक्षर) गाइडलाइन
          </h2>
          <ul className="text-sm text-slate-600 space-y-2">
            <li><strong>साइज रेंज:</strong> {exam.signSpec.minKb} KB से {exam.signSpec.maxKb} KB</li>
            <li><strong>डायमेंशन:</strong> {exam.signSpec.widthMm}mm × {exam.signSpec.heightMm}mm</li>
            <li><strong>स्याही का रंग:</strong> {exam.signSpec.inkColor}</li>
            <li><strong>निर्देश:</strong> {exam.signSpec.note}</li>
          </ul>
          <Link
            href={`/tools/signature-crop?preset=${exam.slug}`}
            className="mt-6 block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow transition"
          >
            यह सिग्नेचर क्रॉप टूल खोलें ➔
          </Link>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-3 text-base">महत्वपूर्ण परीक्षा निर्देश</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
          {exam.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
          <li>Exam Seva पर आपकी सभी फाइलें 100% प्राइवेट रहती हैं और कभी किसी सर्वर पर स्टोर नहीं होतीं।</li>
        </ul>
      </div>
    </div>
  );
}
