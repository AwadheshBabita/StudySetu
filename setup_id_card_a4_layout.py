with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

export default function IdCardJoinerDemo() {
  // सक्रिय स्लॉट: फ्रंट या बैक
  const [activeSlot, setActiveSlot] = useState<"front" | "back">("front");
  
  // दोनों कार्ड्स के क्रॉप किए गए परिणाम (DataURL)
  const [frontCropped, setFrontCropped] = useState<string | null>(null);
  const [backCropped, setBackCropped] = useState<string | null>(null);

  // लेआउट मोड: 'vertical' (ऊपर-नीचे) या 'horizontal' (दाएँ-बाएँ)
  const [layoutMode, setLayoutMode] = useState<"vertical" | "horizontal">("vertical");

  // क्रॉपिंग स्टेट्स (स्मार्ट डॉक्यूमेंट स्कैनर इंजन)
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 15, y: 25 },
    { x: 85, y: 25 },
    { x: 85, y: 75 },
    { x: 15, y: 75 },
  ]);

  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // नई फोटो चुनना
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSlot(slot);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCurrentImageSrc(ev.target?.result as string);
      setCorners([
        { x: 15, y: 25 },
        { x: 85, y: 25 },
        { x: 85, y: 75 },
        { x: 15, y: 75 },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // रीसेट
  };

  // कोनों को ड्रैग करना
  const handlePointerDown = (index: number) => {
    setActiveCorner(index);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeCorner === null || !imgContainerRef.current) return;
      const rect = imgContainerRef.current.getBoundingClientRect();

      let pctX = ((e.clientX - rect.left) / rect.width) * 100;
      let pctY = ((e.clientY - rect.top) / rect.height) * 100;

      pctX = Math.max(0, Math.min(100, pctX));
      pctY = Math.max(0, Math.min(100, pctY));

      setCorners((prev) => {
        const next = [...prev];
        next[activeCorner] = { x: pctX, y: pctY };
        return next;
      });
    },
    [activeCorner]
  );

  const handlePointerUp = useCallback(() => {
    setActiveCorner(null);
  }, []);

  // स्मार्ट पर्सपेक्टिव ट्रांसफॉर्म (आईडी कार्ड के मानक अनुपात में काटना)
  const handleApplyCrop = () => {
    if (!originalImageRef.current || !currentImageSrc) return;

    const img = originalImageRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const pts = corners.map((p) => ({
      x: (p.x / 100) * nw,
      y: (p.y / 100) * nh,
    }));

    const outW = 1012;
    const outH = 638;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slices = 300;
    for (let i = 0; i < slices; i++) {
      const t1 = i / slices;
      const t2 = (i + 1) / slices;

      const lx1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
      const ly1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
      const rx1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
      const ry1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

      const dy1 = t1 * outH;
      const dy2 = t2 * outH;
      const dh = dy2 - dy1;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, dy1, outW, dh + 0.8);
      ctx.clip();

      const angle = Math.atan2(ry1 - ly1, rx1 - lx1);
      const spanW = Math.hypot(rx1 - lx1, ry1 - ly1);

      ctx.translate(0, dy1);
      ctx.scale(outW / spanW, 1);
      ctx.rotate(-angle);
      ctx.drawImage(img, -lx1, -ly1);
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    if (activeSlot === "front") {
      setFrontCropped(dataUrl);
    } else {
      setBackCropped(dataUrl);
    }
    setCurrentImageSrc(null); // क्रॉपर बंद करें और प्रीव्यू दिखाएँ
  };

  const pathD = `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* हेडर */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded">DEMO</span>
          <h1 className="text-sm font-bold text-white">आईडी कार्ड A4 जॉइनर (स्मार्ट स्कैनर इंजन)</h1>
        </div>
        <Link href="/tools/id-card-joiner" className="text-xs text-slate-400 hover:text-white">
          मुख्य टूल
        </Link>
      </header>

      {/* मुख्य कार्यक्षेत्र (दो कॉलम: कंट्रोल + A4 शीट प्रीव्यू) */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* बायाँ पैनल: इनपुट और लेआउट स्विच */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* लेआउट मोड सिलेक्टर (ऊपर-नीचे / दाएँ-बाएँ) */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300">A4 शीट पर कार्ड का स्थान (मोड):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLayoutMode("vertical")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                  layoutMode === "vertical"
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-lg"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <span>↕️ ऊपर - नीचे</span>
              </button>
              <button
                onClick={() => setLayoutMode("horizontal")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                  layoutMode === "horizontal"
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-lg"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <span>↔️ दाएँ - बाएँ</span>
              </button>
            </div>
          </div>

          {/* दोनों कार्ड अपलोड स्लॉट्स */}
          <div className="grid grid-cols-2 gap-3">
            {/* फ्रंट स्लॉट */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center gap-2 ${activeSlot === 'front' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-900/60'}`}>
              <span className="text-xs font-bold text-slate-200">1. फ्रंट कार्ड (Front)</span>
              <div className="w-full aspect-[85.6/54] bg-slate-950 rounded-lg overflow-hidden border border-dashed border-slate-700 flex items-center justify-center relative">
                {frontCropped ? (
                  <img src={frontCropped} alt="Front" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] text-slate-500">खाली</span>
                )}
              </div>
              <label className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 rounded-lg cursor-pointer transition">
                {frontCropped ? "बदलें" : "फोटो चुनें"}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "front")} className="hidden" />
              </label>
            </div>

            {/* बैक स्लॉट */}
            <div className={`p-3 rounded-2xl border flex flex-col items-center gap-2 ${activeSlot === 'back' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-900/60'}`}>
              <span className="text-xs font-bold text-slate-200">2. बैक कार्ड (Back)</span>
              <div className="w-full aspect-[85.6/54] bg-slate-950 rounded-lg overflow-hidden border border-dashed border-slate-700 flex items-center justify-center relative">
                {backCropped ? (
                  <img src={backCropped} alt="Back" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] text-slate-500">खाली</span>
                )}
              </div>
              <label className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 rounded-lg cursor-pointer transition">
                {backCropped ? "बदलें" : "फोटो चुनें"}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "back")} className="hidden" />
              </label>
            </div>
          </div>

          {/* क्रॉपर बॉक्स (जब कोई फोटो चुनी जाए) */}
          {currentImageSrc && (
            <div className="bg-slate-900 border border-emerald-500/50 p-3.5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {activeSlot === "front" ? "फ्रंट" : "बैक"} के 4 कोने सेट करें:
                </span>
                <button
                  onClick={handleApplyCrop}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-1 rounded-lg transition"
                >
                  ✓ लागू करें
                </button>
              </div>

              <div
                ref={imgContainerRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden touch-none border border-slate-700 flex items-center justify-center cursor-crosshair"
              >
                <img
                  ref={originalImageRef}
                  src={currentImageSrc}
                  alt="Crop Target"
                  className="w-full h-full object-contain pointer-events-none"
                />

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d={pathD} fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="0.8" />
                </svg>

                {corners.map((c, idx) => (
                  <div
                    key={idx}
                    onPointerDown={() => handlePointerDown(idx)}
                    className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-xl flex items-center justify-center cursor-grab active:scale-125 transition-transform"
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* दायाँ पैनल: असली A4 शीट लाइव प्रीव्यू (210 x 297 mm Ratio) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-300">
              A4 शीट लाइव प्रीव्यू ({layoutMode === "vertical" ? "ऊपर-नीचे" : "दाएँ-बाएँ"}):
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
              मानक प्रिंट रेडी
            </span>
          </div>

          {/* असली A4 शीट बॉक्स (अनुपात: 210 x 297 mm) */}
          <div className="w-full max-w-[460px] aspect-[210/297] bg-white rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col border border-slate-300 text-black select-none">
            
            {/* A4 शीट का आंतरिक प्रिंटिंग एरिया */}
            <div
              className={`w-full h-full flex transition-all ${
                layoutMode === "vertical"
                  ? "flex-col items-center justify-start gap-4 pt-4"
                  : "flex-row items-start justify-center gap-4 pt-10"
              }`}
            >
              {/* 1. फ्रंट कार्ड स्लॉट (85.6mm x 54mm) */}
              <div
                className={`aspect-[85.6/54] border-2 border-black rounded-xs overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-sm ${
                  layoutMode === "vertical" ? "w-[72%]" : "w-[46%]"
                }`}
              >
                {frontCropped ? (
                  <img src={frontCropped} alt="Front Card" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold p-2 text-center">
                    <span>फ्रंट कार्ड बॉक्स</span>
                    <span className="text-[9px] font-normal text-slate-400">(85.6 × 54 mm)</span>
                  </div>
                )}
              </div>

              {/* 2. बैक कार्ड स्लॉट (85.6mm x 54mm) */}
              <div
                className={`aspect-[85.6/54] border-2 border-black rounded-xs overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-sm ${
                  layoutMode === "vertical" ? "w-[72%]" : "w-[46%]"
                }`}
              >
                {backCropped ? (
                  <img src={backCropped} alt="Back Card" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold p-2 text-center">
                    <span>बैक कार्ड बॉक्स</span>
                    <span className="text-[9px] font-normal text-slate-400">(85.6 × 54 mm)</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
''')

print("ID_CARD_A4_LAYOUT_DEPLOYED")
