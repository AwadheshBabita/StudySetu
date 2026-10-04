'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CGPAConverter() {
  const [cgpa, setCgpa] = useState('');
  const [scale, setScale] = useState('9.5'); // CBSE standard multiplier
  const [percentage, setPercentage] = useState<string | null>(null);

  const calculatePercentage = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cgpa);
    const mul = parseFloat(scale);
    if (isNaN(val) || val < 0 || val > 10) {
      alert("कृपया 0 से 10 के बीच मान्य CGPA दर्ज करें!");
      return;
    }
    const res = (val * mul).toFixed(2);
    setPercentage(res);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href="/calculators" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition active:scale-95">
            ← कैलकुलेटर हब
          </Link>
          <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition active:scale-95">
            🏠 होम पेज
          </Link>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          CGPA Converter
        </span>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3">
          Academic Converter (शैक्षणिक)
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">CGPA to Percentage Converter</h1>
        <p className="text-sm text-slate-600 mb-6">
          CBSE, UP Board, इंजीनियरिंग व कॉलेज CGPA को 1-क्लिक में प्रतिशत (%) में बदलें।
        </p>

        <form onSubmit={calculatePercentage} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">अपना CGPA दर्ज करें (0 - 10)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="10"
              required
              placeholder="उदा. 8.4 या 9.2"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">बोर्ड / यूनिवर्सिटी नियम (Multiplier)</label>
            <select 
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white"
            >
              <option value="9.5">CBSE मानक (CGPA × 9.5)</option>
              <option value="10.0">मानक 10 स्केल (CGPA × 10.0)</option>
              <option value="9.0">कुछ राज्य विश्वविद्यालय (CGPA × 9.0)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition text-base"
          >
            प्रतिशत निकालें (Calculate %)
          </button>
        </form>

        {percentage && (
          <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xs uppercase tracking-wide text-amber-800 font-bold mb-1">आपका कुल प्रतिशत (Percentage):</p>
            <div className="text-3xl font-extrabold text-amber-950">
              {percentage}%
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">फॉर्मूला प्रयुक्त: CGPA ({cgpa}) × {scale}</p>
          </div>
        )}
      </div>
    </div>
  );
}
