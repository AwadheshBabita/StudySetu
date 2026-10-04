"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ExamGuideStripDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "up" | "ssc" | "states">("all");

  const examGuidelines = [
    {
      id: "up-police",
      category: "up",
      title: "UP Police / UPSSSC भर्ती",
      photo: "20 KB से 50 KB (3.5 × 4.5 cm, चेहरा 70%, सादा बैकग्राउंड)",
      sign: "5 KB से 20 KB (काली स्याही, स्पष्ट हस्ताक्षर)",
      docs: "100 KB से 200 KB (जाति, निवास, 10वीं मार्कशीट)",
      toolUrl: "/tools/photo-resizer",
      toolName: "फोटो व साइन रिसाइज़र खोलें",
    },
    {
      id: "ssc-rly",
      category: "ssc",
      title: "SSC / Railway (RRB) भर्ती",
      photo: "20 KB से 50 KB (सफेद या हल्का बैकग्राउंड, बिना चश्मा/टोपी)",
      sign: "10 KB से 20 KB (4.0 × 2.0 cm, काली या नीली स्याही)",
      docs: "100 KB से 300 KB (PDF / JPG सर्टिफिकेट)",
      toolUrl: "/tools/photo-resizer",
      toolName: "SSC फोटो टूल खोलें",
    },
    {
      id: "states-psc",
      category: "states",
      title: "MPSC (महाराष्ट्र) / WBPSC / TNPSC",
      photo: "20 KB से 100 KB (राज्य पोर्टल के तय मानक अनुसार)",
      sign: "10 KB से 20 KB (सफेद कागज पर काले पेन से हस्ताक्षर)",
      docs: "100 KB से 250 KB (सत्यापित पीडीएफ या जेपीजी)",
      toolUrl: "/tools/photo-resizer",
      toolName: "राज्य भर्ती टूल खोलें",
    },
    {
      id: "id-cards",
      category: "all",
      title: "पहचान पत्र (आधार / पैन / वोटर / ड्राइविंग लाइसेंस)",
      photo: "मानक कार्ड साइज (85.6mm × 54mm) फ्रंट व बैक एक साथ",
      sign: "स्पष्ट स्कैन, दोनों हिस्से A4 शीट पर सीधे प्रिंट योग्य",
      docs: "100 KB से 300 KB (प्रिंट व ऑनलाइन अपलोड हेतु)",
      toolUrl: "/tools/id-card-joiner",
      toolName: "ID कार्ड जॉइनर खोलें",
    },
  ];

  const filteredGuides =
    activeTab === "all"
      ? examGuidelines
      : examGuidelines.filter((g) => g.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link href="/" className="text-sm font-bold text-slate-600 hover:text-emerald-700">
          ← वापस होमपेज
        </Link>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
          लाइव डेमो प्रीव्यू
        </span>
      </div>

      <div className="w-full max-w-4xl">
        {/* 1. मुख्य गाइड पट्टी (स्क्रीनशॉट अनुसार) */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            {/* बायाँ सरकारी भवन आइकन */}
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  खास गाइड
                </span>
                <h3 className="text-amber-400 font-extrabold text-sm sm:text-base tracking-tight">
                  राज्य-स्तरीय परीक्षा गाइड व प्रीसेट्स
                </h3>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 sm:line-clamp-none">
                MPSC (महाराष्ट्र), WBPSC (बंगाल), TNPSC (तमिलनाडु) व रेलवे भर्ती के सटीक फोटो व साइन नियम
              </p>
            </div>
          </div>

          {/* दायाँ सफेद एक्शन बटन */}
          <button
            onClick={() => setIsOpen(true)}
            className="self-end sm:self-center bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1 shrink-0"
          >
            <span>नियम देखें व साइन करें</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 2. इंटरैक्टिव पॉप-अप मोडल */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* मोडल हेडर */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base">🏛</span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base leading-tight">
                    भर्ती परीक्षा फोटो, साइन व दस्तावेज़ गाइड
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    मानक अनुसार नियम देखें और सीधे सही टूल पर जाएं
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* कैटेगरी टैब्स */}
            <div className="flex gap-1.5 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-bold">
              {[
                { id: "all", label: "सभी नियम" },
                { id: "up", label: "UP Police / UPSSSC" },
                { id: "ssc", label: "SSC व रेलवे" },
                { id: "states", label: "अन्य राज्य PSC" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* गाइड कार्ड्स लिस्ट */}
            <div className="p-3 sm:p-4 overflow-y-auto flex flex-col gap-3">
              {filteredGuides.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2 hover:border-slate-300 transition"
                >
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {item.title}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-0.5">📷 फोटो मानक:</span>
                      <span className="text-slate-800">{item.photo}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-0.5">✍️ हस्ताक्षर:</span>
                      <span className="text-slate-800">{item.sign}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-0.5">📄 डाक्यूमेंट्स:</span>
                      <span className="text-slate-800">{item.docs}</span>
                    </div>
                  </div>

                  {/* सीधा टूल लिंक बटन */}
                  <div className="flex justify-end pt-1">
                    <Link
                      href={item.toolUrl}
                      onClick={() => setIsOpen(false)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{item.toolName}</span>
                      <span>➔</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* मोडल फुटर */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
