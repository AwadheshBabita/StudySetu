'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const examData: Record<string, { title: string; state: string; photoKb: string; signKb: string; note: string }> = {
  "mpsc": {
    title: "MPSC (महाराष्ट्र लोकसेवा आयोग)",
    state: "Maharashtra",
    photoKb: "20KB - 50KB",
    signKb: "10KB - 20KB",
    note: "फोटोची रुंदी व उंची नियमानुसार असावी. स्वाक्षरी पांढऱ्या कागदावर काळ्या शाईने असावी."
  },
  "wbpsc": {
    title: "WBPSC (West Bengal PSC)",
    state: "West Bengal",
    photoKb: "20KB - 50KB",
    signKb: "10KB - 20KB",
    note: "ছবির ব্যাকগ্রাউন্ড হালকা রঙের হতে হবে এবং স্বাক্ষর স্পষ্ট হতে হবে।"
  },
  "tnpsc": {
    title: "TNPSC (Tamil Nadu PSC)",
    state: "Tamil Nadu",
    photoKb: "20KB - 50KB",
    signKb: "10KB - 20KB",
    note: "புகைப்படம் 20KB முதல் 50KB வரையிலும், கையொப்பம் 10KB முதல் 20KB வரையிலும் இருக்க வேண்டும்."
  },
  "railway": {
    title: "Railway RRB (ALP, Tech, NTPC)",
    state: "All India",
    photoKb: "30KB - 70KB",
    signKb: "10KB - 30KB",
    note: "रेलवे भर्ती बोर्ड के फॉर्म के लिए सफेद बैकग्राउंड की रंगीन फोटो मान्य है।"
  }
};

export default function ExamPresetsPage() {
  const [activeExam, setActiveExam] = useState<string>("mpsc");
  const current = examData[activeExam] || examData["mpsc"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            ← होम पर वापस
          </Link>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black text-slate-800">परीक्षा साइज गाइड</h1>
            <p className="text-[11px] text-slate-500 font-medium">राज्य-स्तरीय आधिकारिक फॉर्म नियम</p>
          </div>
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 font-black rounded-full">100% सटीक</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(examData).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveExam(key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-xs ${
                activeExam === key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              {item.title.split(" ")[0]} ({item.state})
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <span>✅</span> {current.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{current.note}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-blue-700 block">आधिकारिक फोटो नियम</span>
                <span className="text-xl font-black text-blue-900 mt-1 block">{current.photoKb}</span>
                <span className="text-[11px] text-slate-500">फॉर्मेट: JPG / JPEG</span>
              </div>
              <Link
                href="/tools/photo-resizer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-bold transition shadow-xs"
              >
                🖼️ फोटो रिसाइज करें
              </Link>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 block">आधिकारिक हस्ताक्षर नियम</span>
                <span className="text-xl font-black text-emerald-900 mt-1 block">{current.signKb}</span>
                <span className="text-[11px] text-slate-500">सफेद बैकग्राउंड पर काली स्याही</span>
              </div>
              <Link
                href="/tools/signature-resize"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-bold transition shadow-xs"
              >
                ✍️ हस्ताक्षर रिसाइज करें
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
