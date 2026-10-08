with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

export default function IdCardJoinerDemo() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedResult, setCroppedResult] = useState<string | null>(null);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);

  // 4 कोने (प्रतिशत 0 से 100 में: TL, TR, BR, BL)
  const [corners, setCorners] = useState<Point[]>([
    { x: 15, y: 20 },
    { x: 85, y: 20 },
    { x: 85, y: 80 },
    { x: 15, y: 80 },
  ]);

  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // 1. नई फोटो अपलोड या कैमरा से लेना
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string);
      setCroppedResult(null);
      // डिफॉल्ट 4 कोने सेट करें
      setCorners([
        { x: 15, y: 20 },
        { x: 85, y: 20 },
        { x: 85, y: 80 },
        { x: 15, y: 80 },
      ]);
    };
    reader.readAsDataURL(file);
  };

  // 2. टच या माउस से 4 कोनों को ड्रैग करना
  const handlePointerDown = (index: number) => {
    setActiveCorner(index);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeCorner === null || !imgContainerRef.current) return;
      const rect = imgContainerRef.current.getBoundingClientRect();

      const clientX = e.clientX;
      const clientY = e.clientY;

      let pctX = ((clientX - rect.left) / rect.width) * 100;
      let pctY = ((clientY - rect.top) / rect.height) * 100;

      // बाउंड्री में सीमित रखना (0 से 100%)
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

  // 3. 4-प्वाइंट पर्सपेक्टिव क्रॉप (कार्ड को बिल्कुल सीधा 85.6 : 54 अनुपात में काटना)
  const handleExecuteCrop = () => {
    if (!originalImageRef.current || !imageSrc) return;

    const img = originalImageRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    // प्रतिशत को वास्तविक इमेज पिक्सल में बदलना
    const pts = corners.map((p) => ({
      x: (p.x / 100) * nw,
      y: (p.y / 100) * nh,
    }));

    // स्टैंडर्ड आईडी कार्ड साइज (CR80: 1012x638 px)
    const outW = 1012;
    const outH = 638;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // माइक्रो-स्लाइसिंग ट्रांसफ़ॉर्मेशन (सीधा करना)
    const slices = 320;
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

    setCroppedResult(canvas.toDataURL("image/jpeg", 0.95));
  };

  const pathD = `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* शीर्ष हेडर */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded">DEMO</span>
          <h1 className="text-sm font-bold text-white">आईडी कार्ड क्रॉपर व प्रीव्यू स्टेज</h1>
        </div>
        <Link href="/tools/id-card-joiner" className="text-xs text-slate-400 hover:text-white">
          वापस मेन टूल
        </Link>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6">
        {/* स्टेज 1: इनपुट सेलेक्टर */}
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
          <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition">
            📷 कार्ड फोटो चुनें / खींचें
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <span className="text-xs text-slate-400">
            {imageSrc ? "फोटो लोड हो गई है" : "कोई फोटो नहीं चुनी गई"}
          </span>
        </div>

        {/* स्टेज 2: 4-कॉर्नर क्रॉपर बॉक्स */}
        {imageSrc && (
          <div className="flex flex-col gap-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">
                1. चारों कोनों (गोलियों) को पकड़कर कार्ड के सिरों पर सेट करें:
              </span>
              <button
                onClick={handleExecuteCrop}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-1.5 rounded-lg transition active:scale-95 shadow-md"
              >
                ✓ सीधा क्रॉप करें
              </button>
            </div>

            <div
              ref={imgContainerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden touch-none cursor-crosshair flex items-center justify-center border border-slate-700"
            >
              <img
                ref={originalImageRef}
                src={imageSrc}
                alt="Original"
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* 4-कॉर्नर पॉलीगॉन और ड्रैग हैंडल */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={pathD}
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              </svg>

              {/* 4 ड्रैग हैंडल (Touch Handles) */}
              {corners.map((c, idx) => (
                <div
                  key={idx}
                  onPointerDown={() => handlePointerDown(idx)}
                  className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing active:scale-125 transition-transform"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* स्टेज 3: प्रीव्यू बॉक्स (बिल्कुल साफ़ और सीधा आउटपुट) */}
        <div className="flex flex-col gap-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300">
            2. लाइव प्रीव्यू बॉक्स (सीधा किया गया आउटपुट):
          </span>

          <div className="w-full min-h-[220px] bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center p-4">
            {croppedResult ? (
              <div className="relative max-w-sm w-full aspect-[85.6/54] bg-white rounded-lg shadow-2xl overflow-hidden border border-black">
                <img
                  src={croppedResult}
                  alt="Cropped Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <span className="text-xs text-slate-600 font-medium">
                ऊपर फोटो सेट करके &ldquo;✓ सीधा क्रॉप करें&rdquo; दबाएँ, प्रीव्यू यहाँ दिखेगा।
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
''')

print("CLEAN_CROPPER_DEMO_DEPLOYED")
