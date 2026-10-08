with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function IdCardJoinerDemo() {
  const [paperType, setPaperType] = useState<"a4" | "4x6">("a4");
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [targetKb, setTargetKb] = useState<number>(150);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (slot === "front") setFrontImage(res);
      else setBackImage(res);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none pb-20">
      {/* 1. हेडर */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            ES
          </div>
          <div>
            <h1 className="text-sm font-black text-blue-900 leading-tight">Exam Sewa</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">ONLINE TOOL SUITE</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/tools/id-card-joiner"
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
          >
            ← Back
          </Link>
          <Link
            href="/"
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
          >
            🏠 Home
          </Link>
        </div>
      </header>

      {/* 2. प्रीव्यू कंटेनर */}
      <div className="p-3 max-w-lg mx-auto w-full">
        <div className="bg-slate-200/70 border border-slate-300 rounded-2xl p-3 flex flex-col items-center shadow-xs">
          {/* स्टेटस बार */}
          <div className="w-full flex items-center justify-between text-[11px] font-bold mb-2.5 px-1">
            <span className="text-slate-700">
              शीट: {paperType === "a4" ? "A4" : "4×6"} • {layoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"}
            </span>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
              टारगेट: ~{targetKb} KB में सुरक्षित
            </span>
          </div>

          {/* A4 / 4x6 शीट का कार्ड */}
          <div
            className={`w-full bg-white rounded-2xl border-2 border-slate-800 shadow-md p-4 flex flex-col items-center transition-all ${
              paperType === "a4" ? "aspect-[1/1.414]" : "aspect-[4/6]"
            }`}
          >
            {/* कार्ड्स कंटेनर */}
            <div
              className={`w-full flex justify-center gap-2 transition-all ${
                layoutMode === "horizontal" ? "flex-row items-center pt-2" : "flex-col items-center pt-2 gap-3"
              }`}
            >
              {/* फ्रंट कार्ड बॉक्स */}
              <div
                className={`aspect-[85.6/54] border-2 border-slate-900 rounded-lg overflow-hidden bg-white flex items-center justify-center transition-all ${
                  layoutMode === "horizontal" ? "w-[48%]" : "w-[72%]"
                }`}
              >
                {frontImage ? (
                  <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-400">Front</span>
                )}
              </div>

              {/* बैक कार्ड बॉक्स */}
              <div
                className={`aspect-[85.6/54] border-2 border-slate-900 rounded-lg overflow-hidden bg-white flex items-center justify-center transition-all ${
                  layoutMode === "horizontal" ? "w-[48%]" : "w-[72%]"
                }`}
              >
                {backImage ? (
                  <img src={backImage} alt="Back" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-400">Back</span>
                )}
              </div>
            </div>

            {/* कटिंग लाइन */}
            <div className="w-full mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                ✂ शेष खाली {paperType === "a4" ? "A4" : "4×6"} कागज़ (पुनः उपयोग योग्य)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. बॉटम कंट्रोल शीट */}
      <div className="max-w-lg mx-auto w-full px-3">
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="text-center">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1.5"></div>
            <p className="text-[11px] font-bold text-blue-600">
              ↑ टूल्स व डाउनलोड के लिए ऊपर स्क्रॉल करें
            </p>
          </div>

          {/* फ्रंट और बैक अपलोड बटन्स */}
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col items-center justify-center py-2.5 px-2 bg-blue-50/60 border border-blue-200 hover:bg-blue-100 rounded-xl cursor-pointer transition text-center">
              <span className="text-xs font-bold text-slate-800">📷 Front (आगे)</span>
              <span className="text-[11px] font-medium text-blue-600 mt-0.5">+ अपलोड</span>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "front")} className="hidden" />
            </label>

            <label className="flex flex-col items-center justify-center py-2.5 px-2 bg-blue-50/60 border border-blue-200 hover:bg-blue-100 rounded-xl cursor-pointer transition text-center">
              <span className="text-xs font-bold text-slate-800">📷 Back (पीछे)</span>
              <span className="text-[11px] font-medium text-blue-600 mt-0.5">+ अपलोड</span>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "back")} className="hidden" />
            </label>
          </div>

          {/* कागज़ का साइज़ */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">कागज़ का साइज़</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaperType("a4")}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                  paperType === "a4"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                A4 बड़ा पेपर
              </button>
              <button
                type="button"
                onClick={() => setPaperType("4x6")}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                  paperType === "4x6"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                4×6 फोटो पेपर
              </button>
            </div>
          </div>

          {/* कार्ड लेआउट */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">कार्ड लेआउट</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode("horizontal")}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                  layoutMode === "horizontal"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                अगल - बगल (मानक)
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("vertical")}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                  layoutMode === "vertical"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                ऊपर - नीचे
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
''')

print("SCREENSHOT_UI_DEPLOYED")
