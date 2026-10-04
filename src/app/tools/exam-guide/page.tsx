"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ExamRule {
  id: string;
  name: string;
  state: string;
  badgeColor: string;
  photoSpecs: {
    size: string;
    dimension: string;
    bg: string;
    extra?: string;
  };
  signSpecs: {
    size: string;
    dimension: string;
    ink: string;
  };
  docSpecs?: string;
  toolAction: {
    name: string;
    href: string;
  };
}

const EXAM_DATA: ExamRule[] = [
  {
    id: "up-police",
    name: "UP Police & UPSSSC भर्ती",
    state: "उत्तर प्रदेश",
    badgeColor: "bg-blue-600 text-white",
    photoSpecs: {
      size: "20 KB से 50 KB",
      dimension: "3.5 cm × 4.5 cm",
      bg: "सफेद या हल्का स्लेटी (Light Grey)",
      extra: "चेहरा 70% दिखना चाहिए, दोनों कान साफ दिखें।"
    },
    signSpecs: {
      size: "5 KB से 20 KB",
      dimension: "3.5 cm × 1.5 cm",
      ink: "काली स्याही (Black Ink) पेन"
    },
    docSpecs: "जाति / निवास प्रमाण पत्र: 50 KB से 100 KB (JPG / PDF)",
    toolAction: {
      name: "UP Police फोटो रिसाइज़र खोलें →",
      href: "/tools/up-police-photo-resizer"
    }
  },
  {
    id: "ssc",
    name: "SSC (CGL, CHSL, GD, MTS)",
    state: "केंद्रीय",
    badgeColor: "bg-red-600 text-white",
    photoSpecs: {
      size: "20 KB से 50 KB",
      dimension: "3.5 cm × 4.5 cm",
      bg: "हल्का बैकग्राउंड / लाइव वेबकैम फोटो",
      extra: "चश्मा या टोपी पूरी तरह वर्जित है।"
    },
    signSpecs: {
      size: "10 KB से 20 KB",
      dimension: "4.0 cm × 2.0 cm",
      ink: "काली या नीली स्याही"
    },
    docSpecs: "मार्कशीट व प्रमाण पत्र: 100 KB से 300 KB (PDF / JPG)",
    toolAction: {
      name: "SSC फोटो मेकर खोलें →",
      href: "/tools/ssc-photo-maker"
    }
  },
  {
    id: "rrb",
    name: "रेलवे भर्ती (RRB ALP, Technician, NTPC)",
    state: "केंद्रीय",
    badgeColor: "bg-emerald-600 text-white",
    photoSpecs: {
      size: "30 KB से 70 KB",
      dimension: "35 mm × 45 mm (100 DPI)",
      bg: "प्योर सफेद (Plain White) बैकग्राउंड",
      extra: "नाम व फोटो खींचने की तारीख (DOP) आवश्यक।"
    },
    signSpecs: {
      size: "30 KB से 70 KB",
      dimension: "50 mm × 20 mm",
      ink: "काली स्याही केवल"
    },
    docSpecs: "SC/ST पास व सर्टिफिकेट: 300 KB से 500 KB (PDF)",
    toolAction: {
      name: "फोटो पर नाम व तारीख जोड़ें →",
      href: "/tools/rrb-railway-photo-maker"
    }
  },
  {
    id: "mpsc",
    name: "MPSC (महाराष्ट्र लोक सेवा आयोग)",
    state: "महाराष्ट्र",
    badgeColor: "bg-amber-600 text-white",
    photoSpecs: {
      size: "50 KB से 100 KB",
      dimension: "3.5 cm × 4.5 cm",
      bg: "सफेद बैकग्राउंड",
      extra: "हाल ही में ली गई स्पष्ट पासपोर्ट फोटो।"
    },
    signSpecs: {
      size: "20 KB से 50 KB",
      dimension: "3.5 cm × 1.5 cm",
      ink: "काली स्याही (Black Ink)"
    },
    docSpecs: "शैक्षणिक दस्तावेज़: 100 KB से 500 KB PDF",
    toolAction: {
      name: "फोटो व साइन रिसाइज़र खोलें →",
      href: "/tools/mpsc-photo-resizer"
    }
  },
  {
    id: "wbpsc",
    name: "WBPSC (पश्चिम बंगाल PSC व क्लर्कशिप)",
    state: "पश्चिम बंगाल",
    badgeColor: "bg-indigo-600 text-white",
    photoSpecs: {
      size: "20 KB से 100 KB",
      dimension: "3.5 cm × 4.5 cm (200 DPI)",
      bg: "हल्का या सफेद बैकग्राउंड",
      extra: "स्पष्ट बिना चश्मे वाली फोटो।"
    },
    signSpecs: {
      size: "10 KB से 50 KB",
      dimension: "4 cm × 2 cm",
      ink: "काली या गहरी नीली स्याही"
    },
    docSpecs: "दस्तावेज़: 100 KB से 200 KB PDF",
    toolAction: {
      name: "हस्ताक्षर क्रॉप व रिसाइज करें →",
      href: "/tools/wbpsc-photo-resizer"
    }
  },
  {
    id: "tnpsc",
    name: "TNPSC (तमिलनाडु Group 1, 2, 4)",
    state: "तमिलनाडु",
    badgeColor: "bg-purple-600 text-white",
    photoSpecs: {
      size: "20 KB से 50 KB",
      dimension: "3.5 cm × 4.5 cm",
      bg: "सफेद बैकग्राउंड",
      extra: "निचले हिस्से में नाम व फोटो की तारीख अंकित हो।"
    },
    signSpecs: {
      size: "10 KB से 20 KB",
      dimension: "3.5 cm × 1.5 cm",
      ink: "गहरी नीली या काली स्याही"
    },
    docSpecs: "कम्युनिटी सर्टिफिकेट: 100 KB से 200 KB PDF",
    toolAction: {
      name: "पासपोर्ट फोटो मेकर (नाम/तारीख) →",
      href: "/tools/tnpsc-photo-maker"
    }
  }
];

export default function ExamGuideDemo() {
  const [selectedState, setSelectedState] = useState<string>("सभी");

  const states = ["सभी", "उत्तर प्रदेश", "केंद्रीय", "महाराष्ट्र", "पश्चिम बंगाल", "तमिलनाडु"];

  const filteredExams = selectedState === "सभी" 
    ? EXAM_DATA 
    : EXAM_DATA.filter(item => item.state === selectedState);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* शीर्ष हेडर */}
      <div className="bg-gradient-to-r from-[#0b132b] via-[#1c2d5a] to-[#0b132b] text-white py-8 px-4 border-b border-blue-900/50 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Link 
              href="/" 
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 transition"
            >
              ← होमपेज पर वापस
            </Link>
            <span className="text-[11px] font-black bg-amber-400 text-black px-2.5 py-0.5 rounded shadow-sm">
              गाइड डेमो प्रीव्यू
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V10" />
                <path d="M9 21V10" />
                <path d="M15 21V10" />
                <path d="M19 21V10" />
                <path d="M3 10h18" />
                <path d="m12 3 9 5H3l9-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#fbbf24] tracking-tight">
                राज्य-स्तरीय व केंद्रीय परीक्षा भर्ती गाइड
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                सटीक फोटो, हस्ताक्षर, KB साइज़ व दस्तावेज़ नियम — एक क्लिक में सीधा टूल खोलें
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* राज्य फ़िल्टर टैब्स */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {states.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${
                selectedState === st
                  ? "bg-slate-900 text-white ring-2 ring-blue-500"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* नियमों के कार्ड्स ग्रिड */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <div 
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* कार्ड हेडर */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                  <h2 className="font-black text-sm sm:text-base text-slate-900">
                    {exam.name}
                  </h2>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${exam.badgeColor}`}>
                    {exam.state}
                  </span>
                </div>

                {/* फोटो नियम */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <span>📷</span>
                    <span>फोटो के नियम:</span>
                  </div>
                  <ul className="text-slate-600 space-y-0.5 pl-4 list-disc text-[11px] font-medium">
                    <li><strong className="text-slate-800">साइज़ (KB):</strong> {exam.photoSpecs.size}</li>
                    <li><strong className="text-slate-800">डायमेंशन:</strong> {exam.photoSpecs.dimension}</li>
                    <li><strong className="text-slate-800">बैकग्राउंड:</strong> {exam.photoSpecs.bg}</li>
                    {exam.photoSpecs.extra && (
                      <li className="text-amber-800 font-semibold">{exam.photoSpecs.extra}</li>
                    )}
                  </ul>
                </div>

                {/* हस्ताक्षर नियम */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <span>✍️</span>
                    <span>हस्ताक्षर (Sign) नियम:</span>
                  </div>
                  <ul className="text-slate-600 space-y-0.5 pl-4 list-disc text-[11px] font-medium">
                    <li><strong className="text-slate-800">साइज़ (KB):</strong> {exam.signSpecs.size}</li>
                    <li><strong className="text-slate-800">डायमेंशन:</strong> {exam.signSpecs.dimension}</li>
                    <li><strong className="text-slate-800">स्याही (Ink):</strong> {exam.signSpecs.ink}</li>
                  </ul>
                </div>

                {/* दस्तावेज़ विवरण */}
                {exam.docSpecs && (
                  <p className="text-[11px] text-slate-500 font-medium px-1 mb-3">
                    📁 <strong>डॉक्यूमेंट्स:</strong> {exam.docSpecs}
                  </p>
                )}
              </div>

              {/* सीधा टूल खोलने वाला एक्शन बटन */}
              <Link
                href={exam.toolAction.href}
                className="w-full mt-2 text-center bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs py-2.5 px-3 rounded-xl shadow transition active:scale-98 flex items-center justify-center gap-1"
              >
                <span>{exam.toolAction.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
