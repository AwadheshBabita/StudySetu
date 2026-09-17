"use client";

import { useState } from "react";

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState<string>("2000-01-01");
  const [asOnDate, setAsOnDate] = useState<string>("2026-08-01");
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    nextBdayDays: number;
  } | null>(null);

  const calculateAge = () => {
    if (!dob || !asOnDate) return;

    const birth = new Date(dob);
    const target = new Date(asOnDate);

    if (birth > target) {
      alert("जन्म तिथि कट-ऑफ तारीख से पहले की होनी चाहिए!");
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

    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    const nextBdayDays = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      nextBdayDays,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Age Calculator (सरकारी फॉर्म विशेष)
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          कट-ऑफ डेट पर अपनी सटीक उम्र (वर्ष, माह, दिन) निकालें
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              जन्म तिथि (Date of Birth)
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              इस तारीख को आयु चाहिए (Age as on Date / Cut-Off)
            </label>
            <input
              type="date"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              सरकारी नोटिफिकेशन में दी गई कट-ऑफ डेट (जैसे 01-08-2026) यहाँ दर्ज करें
            </p>
          </div>

          <button
            onClick={calculateAge}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            सटीक उम्र की गणना करें (Calculate Age)
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">आपकी कुल आयु</span>
              <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
                {result.years} <span className="text-base font-normal text-slate-600">साल</span> {result.months} <span className="text-base font-normal text-slate-600">महीने</span> {result.days} <span className="text-base font-normal text-slate-600">दिन</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">कुल दिन</span>
                <span className="text-lg font-bold text-slate-800">{result.totalDays.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">कुल सप्ताह</span>
                <span className="text-lg font-bold text-slate-800">{result.totalWeeks.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 font-semibold block">अगला जन्मदिन</span>
                <span className="text-lg font-bold text-slate-800">{result.nextBdayDays} दिन बाद</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
