'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface StateRule {
  id: string;
  state: string;
  exam: string;
  photoRule: string;
  signRule: string;
  docRule: string;
  specialNote: string;
}

const STATE_EXAM_DATA: StateRule[] = [
  {
    id: 'up',
    state: 'उत्तर प्रदेश (UP)',
    exam: 'UP Police (Constable/SI), UPSSSC (PET, लेखपाल), RO/ARO',
    photoRule: '20 KB से 50 KB (सफेद या हल्का ग्रे बैकग्राउंड, चेहरा 70% दिखना चाहिए)',
    signRule: '5 KB से 20 KB (काली स्याही से सफेद कागज पर, 3.5 × 1.5 cm)',
    docRule: 'ओबीसी/ईडब्ल्यूएस प्रमाणपत्र निर्धारित वित्तीय वर्ष का ही मान्य (PDF/JPG 100-300 KB)',
    specialNote: 'UPSSSC में साइन के ऊपर हिंदी में नाम व नीचे अंग्रेजी में हस्ताक्षर अनिवार्य होता है।'
  },
  {
    id: 'bihar',
    state: 'बिहार (Bihar)',
    exam: 'BPSC, Bihar Police, BSSC (इंटर व स्नातक स्तरीय)',
    photoRule: '20 KB से 50 KB (बैकग्राउंड सफेद या हल्का, दोनों कान साफ दिखने चाहिए)',
    signRule: '10 KB से 20 KB (अंग्रेजी व हिंदी दोनों में अलग-अलग हस्ताक्षर अपलोड होते हैं)',
    docRule: 'NCL (नॉन क्रीमी लेयर) और आवासीय प्रमाणपत्र बिहार सरकार के प्रारूप पर (100-400 KB PDF)',
    specialNote: 'BPSC में लाइव वेबकैम से फोटो कैप्चर का भी नियम होता है।'
  },
  {
    id: 'mp',
    state: 'मध्य प्रदेश (MP)',
    exam: 'MPESB (व्यापम), MPPSC, MP Police',
    photoRule: 'Template आधारित: फोटो पर अभ्यर्थी का नाम और फोटो खींचने की तारीख (DOP) अनिवार्य',
    signRule: 'Template बॉक्स के अंदर ही हस्ताक्षर होना चाहिए (साफ काली स्याही)',
    docRule: 'रोजगार पंजीयन (Employment Registration) जीवित और सक्रिय होना अनिवार्य',
    specialNote: 'MP फॉर्म में 1-पेज का प्रोफाइल टेम्पलेट अपलोड होता है जिसमें फोटो, साइन व हैंडराइटिंग होती है।'
  },
  {
    id: 'rajasthan',
    state: 'राजस्थान (Rajasthan)',
    exam: 'RSMSSB (CET, पटवारी, LDC), RPSC',
    photoRule: '50 KB से 100 KB (अधिकतम 1 माह पुरानी, सफेद/हल्का बैकग्राउंड)',
    signRule: '20 KB से 50 KB (काले पेन से 7 × 2 cm साइज)',
    docRule: 'SSO ID प्रोफाइल से सीधे जुड़े प्रमाण पत्र, जाति प्रमाण पत्र डिजिटल हस्ताक्षरित',
    specialNote: 'चश्मा पहनकर फोटो खिंचवाने पर चमक (Reflection) नहीं होनी चाहिए।'
  },
  {
    id: 'delhi',
    state: 'दिल्ली / केंद्र (DSSSB / SSC)',
    exam: 'DSSSB, SSC (CGL, CHSL, GD, MTS)',
    photoRule: '20 KB से 50 KB (SSC में अब लाइव वेबकैम कैप्चर मान्य, कैप/चश्मा वर्जित)',
    signRule: '10 KB से 20 KB (आकार 4.0 × 2.0 cm, 140 × 60 px)',
    docRule: '10वीं मार्कशीट, जाति प्रमाणपत्र 100-300 KB PDF/JPG',
    specialNote: 'DSSSB में पोस्टकार्ड साइज (5×7 इंच) फोटो व दोनों अंगूठे के निशान भी मांगे जाते हैं।'
  }
];

export default function StateExamsPage() {
  const [selectedState, setSelectedState] = useState<string>('all');

  const filteredRules = selectedState === 'all' 
    ? STATE_EXAM_DATA 
    : STATE_EXAM_DATA.filter(item => item.id === selectedState);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3">
      <div className="max-w-3xl mx-auto">
        {/* बैक बटन */}
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            ← मुख्य होमपेज
          </Link>
        </div>

        {/* मुख्य हेडर बैनर */}
        <div 
          style={{
            background: "linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 14px -2px rgba(37, 99, 235, 0.4)"
          }}
          className="p-4 sm:p-5 rounded-2xl mb-4 text-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-base sm:text-xl font-black leading-tight text-white">
                राज्य स्तरीय परीक्षा गाइड (State Exam Rules)
              </h1>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                विभिन्न राज्यों के सरकारी फॉर्म भरते समय फोटो, साइन और डॉक्यूमेंट के आधिकारिक नियम
              </p>
            </div>
          </div>
        </div>

        {/* राज्य फ़िल्टर टैब्स */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          <button
            onClick={() => setSelectedState('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            सभी राज्य
          </button>
          <button
            onClick={() => setSelectedState('up')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'up'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            उत्तर प्रदेश
          </button>
          <button
            onClick={() => setSelectedState('bihar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'bihar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            बिहार
          </button>
          <button
            onClick={() => setSelectedState('mp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'mp'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            मध्य प्रदेश
          </button>
          <button
            onClick={() => setSelectedState('rajasthan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'rajasthan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            राजस्थान
          </button>
          <button
            onClick={() => setSelectedState('delhi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedState === 'delhi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            दिल्ली / SSC
          </button>
        </div>

        {/* नियमों के कार्ड्स */}
        <div className="space-y-3.5">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    {rule.state}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {rule.exam}
                  </p>
                </div>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  आधिकारिक नियम
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* फोटो नियम */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-slate-700 block mb-1">
                    📸 फोटो नियम:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rule.photoRule}
                  </p>
                </div>

                {/* हस्ताक्षर नियम */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-slate-700 block mb-1">
                    ✍️ हस्ताक्षर (Sign) नियम:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rule.signRule}
                  </p>
                </div>

                {/* डॉक्यूमेंट नियम */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="font-extrabold text-slate-700 block mb-1">
                    📄 प्रमाणपत्र (Caste/Domicile/Marksheet):
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rule.docRule}
                  </p>
                </div>
              </div>

              {/* विशेष नोट */}
              <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-bold flex items-start gap-1.5">
                <span className="shrink-0">⚠️</span>
                <span>{rule.specialNote}</span>
              </div>

              {/* सीधे टूल पर जाने का लिंक */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">क्या आपको साइज सेट करना है?</span>
                <div className="flex gap-2 font-bold">
                  <Link href="/tools/photo-resize" className="text-green-700 hover:underline">
                    फोटो बनाएँ →
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link href="/tools/signature-resize" className="text-blue-700 hover:underline">
                    साइन बनाएँ →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
