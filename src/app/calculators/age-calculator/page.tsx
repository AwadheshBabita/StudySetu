'use client';

import React, { useState } from 'react';
import FaqSection from '@/components/FaqSection';

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState<string>('2000-01-01');
  const [targetDate, setTargetDate] = useState<string>('2026-07-01'); // 1 जुलाई सामान्य कटऑफ
  const [ageResult, setAgeResult] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null);

  const ageFaqs = [
    {
      q: "सरकारी भर्ती फॉर्म में आयु गणना की कट-ऑफ तारीख (Cut-off Date) क्या होती है?",
      a: "अधिकांश आयोग (जैसे SSC, UPSC, State Police) 1 जनवरी या 1 जुलाई को आधार मानकर आयु की गणना करते हैं। उदाहरण के लिए, विज्ञापन में लिखा होता है: '01/07/2026 को न्यूनतम 18 और अधिकतम 25 वर्ष'। हमारा टूल उसी कटऑफ पर सटीक उम्र बताता है।"
    },
    {
      q: "क्या यह टूल लीप वर्ष (Leap Year) और 28/30/31 दिनों के महीनों की सटीक गणना करता है?",
      a: "हाँ, यह कैलेंडर एल्गोरिदम पर आधारित है जो प्रत्येक महीने के सटीक दिन और लीप वर्ष को ध्यान में रखकर दिन, माह और वर्ष की बिल्कुल सही गणना करता है।"
    },
    {
      q: "ओबीसी, एससी, एसटी या ईडब्ल्यूएस के लिए आयु सीमा में छूट कैसे देखें?",
      a: "यदि आपकी वास्तविक उम्र अधिकतम सीमा से 1-2 वर्ष अधिक भी आ रही है, तो अपने वर्ग के नियमानुसार (OBC: 3 वर्ष, SC/ST: 5 वर्ष छूट) जोड़कर अपनी पात्रता तय कर सकते हैं।"
    }
  ];

  const calculateAge = () => {
    if (!dob || !targetDate) return;

    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (birth > target) {
      alert('जन्म तिथि कट-ऑफ तारीख से पहले की होनी चाहिए।');
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setAgeResult({ years, months, days, totalDays });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-3">
          भर्ती स्पेशल • सटीक कट-ऑफ गणना
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          सरकारी भर्ती आयु कैलकुलेटर (Age Calculator)
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          फॉर्म में दी गई कट-ऑफ तारीख (उदा. 1 जुलाई या 1 जनवरी) पर अपनी सटीक उम्र (वर्ष, माह, दिन) निकालें।
        </p>

        {/* इनपुट बॉक्स */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              आपकी जन्म तिथि (Date of Birth):
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              गणना की कट-ऑफ तारीख (Age as on Date):
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-[10px] text-purple-700 font-semibold mt-1 block">
              💡 फॉर्म के नोटिफिकेशन में दी गई तारीख यहाँ डालें
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={calculateAge}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2"
        >
          <span>📅</span>
          <span>सटीक उम्र निकालें (Calculate Age)</span>
        </button>

        {/* परिणाम */}
        {ageResult && (
          <div className="mt-6 p-6 bg-purple-50 border-2 border-purple-200 rounded-2xl text-center space-y-3">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
              🎯 आपकी सटीक आयु (Age as on {targetDate}):
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-950">
              {ageResult.years} वर्ष, {ageResult.months} माह, {ageResult.days} दिन
            </div>
            <p className="text-xs text-purple-800 font-semibold">
              कुल दिन: {ageResult.totalDays} दिन | कुल माह: {(ageResult.years * 12) + ageResult.months} माह
            </p>
          </div>
        )}

      </div>

      {/* 3 क्विक स्टेप्स */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mt-6">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-base block mb-1">1️⃣</span>
          <h2 className="text-xs font-bold text-slate-800">DOB चुनें</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">अपनी जन्म तारीख दर्ज करें</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-base block mb-1">2️⃣</span>
          <h2 className="text-xs font-bold text-slate-800">कट-ऑफ तारीख</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">फॉर्म के विज्ञापन वाली तारीख</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-base block mb-1">3️⃣</span>
          <h2 className="text-xs font-bold text-slate-800">सटीक पात्रता</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">वर्ष, माह, दिन में सटीक मान</p>
        </div>
      </div>

      {/* अकॉर्डियन FAQ */}
      <FaqSection 
        title="आयु कैलकुलेटर - अक्सर पूछे जाने वाले सवाल"
        items={ageFaqs}
        pageUrl="https://examsewa.online/calculators/age-calculator"
      />

    </div>
  );
}
