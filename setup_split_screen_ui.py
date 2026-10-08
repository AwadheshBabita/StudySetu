with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

export default function IdCardJoinerDemo() {
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [targetKb, setTargetKb] = useState<number>(150);

  // क्रॉप किए गए कार्ड्स
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  // स्लॉट व मोडल स्टेट्स
  const [activeSlot, setActiveSlot] = useState<"front" | "back">("front");
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // कैमरा स्टेट्स
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 4 कोने (% 0 से 100)
  const [corners, setCorners] = useState<Point[]>([
    { x: 12, y: 22 },
    { x: 88, y: 22 },
    { x: 88, y: 78 },
    { x: 12, y: 78 },
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);

  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // 1. गैलरी से चुनना
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>, slot: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSlot(slot);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target?.result as string);
      setCorners([
        { x: 12, y: 22 },
        { x: 88, y: 22 },
        { x: 88, y: 78 },
        { x: 12, y: 78 },
      ]);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 2. लाइव कैमरा
  const handleOpenLiveCamera = async (slot: "front" | "back") => {
    setActiveSlot(slot);
    setCameraModalOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      alert("कैमरा शुरू नहीं हो सका। कृपया परमिशन दें या गैलरी से चुनें।");
      setCameraModalOpen(false);
    }
  };

  const handleCaptureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const snapUrl = canvas.toDataURL("image/jpeg", 0.95);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraModalOpen(false);

    setRawImageSrc(snapUrl);
    setCorners([
      { x: 12, y: 22 },
      { x: 88, y: 22 },
      { x: 88, y: 78 },
      { x: 12, y: 78 },
    ]);
    setCropModalOpen(true);
  };

  const handleCloseCameraModal = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraModalOpen(false);
  };

  // 3. कॉर्नर ड्रैगिंग
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

  // 4. क्रॉप लागू करना
  const handleApplyCrop = () => {
    if (!originalImageRef.current || !rawImageSrc) return;

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

    const croppedData = canvas.toDataURL("image/jpeg", 0.95);
    if (activeSlot === "front") {
      setFrontImage(croppedData);
    } else {
      setBackImage(croppedData);
    }

    setCropModalOpen(false);
    setRawImageSrc(null);
  };

  const pathD = `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-200 flex flex-col font-sans select-none">
      {/* 1. कॉम्पैक्ट टॉप हेडर */}
      <header className="bg-white border-b border-slate-300 px-3 py-2 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            ES
          </div>
          <div>
            <h1 className="text-xs font-black text-blue-900 leading-none">Exam Sewa</h1>
            <p className="text-[9px] font-bold text-slate-400">ID CARD JOINER</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <Link
            href="/tools/id-card-joiner"
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md border border-slate-300"
          >
            ← Back
          </Link>
          <Link
            href="/"
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md border border-blue-200"
          >
            🏠 Home
          </Link>
        </div>
      </header>

      {/* 2. मुख्य कंटेनर: दो भागों में विभाजित */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ======================= भाग 1: प्रीव्यू बॉक्स (स्थिर / FIXED STAGE) ======================= */}
        {/* मोबाइल में स्क्रीन के ऊपरी 52% हिस्से पर बिल्कुल स्थिर जमा रहेगा */}
        <div className="h-[52%] shrink-0 bg-slate-100 border-b-2 border-slate-300 flex flex-col p-2 items-center justify-between shadow-sm relative z-10">
          
          {/* स्टेटस पट्टी */}
          <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-bold px-1 mb-1">
            <span className="text-slate-700">
              शीट: A4 • {layoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"}
            </span>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
              टारगेट: ~{targetKb} KB में सुरक्षित
            </span>
          </div>

          {/* स्थिर A4 शीट (पोर्ट्रेट) */}
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <div className="h-full aspect-[210/297] bg-white rounded-xl border-2 border-slate-800 shadow-md p-2.5 flex flex-col items-center justify-between">
              
              {/* दोनों कार्ड्स स्लॉट */}
              <div
                className={`w-full flex justify-center gap-1.5 transition-all ${
                  layoutMode === "horizontal" ? "flex-row items-center pt-1" : "flex-col items-center pt-1 gap-1.5"
                }`}
              >
                {/* फ्रंट स्लॉट */}
                <div
                  className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                    layoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}
                >
                  {frontImage ? (
                    <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Front</span>
                  )}
                </div>

                {/* बैक स्लॉट */}
                <div
                  className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                    layoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}
                >
                  {backImage ? (
                    <img src={backImage} alt="Back" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Back</span>
                  )}
                </div>
              </div>

              {/* कटिंग लाइन */}
              <div className="w-full pt-1.5 border-t border-dashed border-slate-300 text-center">
                <span className="text-[9px] text-slate-400 font-medium">
                  ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= भाग 2: टूल बॉक्स (स्क्रॉलेबल / SCROLLABLE TOOL BOX) ======================= */}
        {/* नीचे का आधा हिस्सा स्वतंत्र रूप से स्लाइड/स्क्रॉल होगा, प्रीव्यू के नीचे से गुजरेगा */}
        <div className="flex-1 overflow-y-auto bg-white p-3 space-y-3.5 scroll-smooth">
          <div className="max-w-sm mx-auto space-y-3.5 pb-10">
            
            {/* स्क्रॉल गाइड पट्टी */}
            <div className="text-center pt-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                ↓ टूल बॉक्स (नीचे स्क्रॉल करें)
              </p>
            </div>

            {/* टूल 1: फ्रंट और बैक अपलोड स्लॉट्स */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">1. Front (आगे)</span>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => handleOpenLiveCamera("front")}
                    className="py-1 px-1 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-bold rounded-lg border border-slate-300 shadow-xs"
                  >
                    📷 कैमरा
                  </button>
                  <label className="py-1 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center justify-center cursor-pointer text-center">
                    📁 गैलरी
                    <input type="file" accept="image/*" onChange={(e) => handleGallerySelect(e, "front")} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">2. Back (पीछे)</span>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => handleOpenLiveCamera("back")}
                    className="py-1 px-1 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-bold rounded-lg border border-slate-300 shadow-xs"
                  >
                    📷 कैमरा
                  </button>
                  <label className="py-1 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center justify-center cursor-pointer text-center">
                    📁 गैलरी
                    <input type="file" accept="image/*" onChange={(e) => handleGallerySelect(e, "back")} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* टूल 2: कागज़ का साइज़ */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">कागज़ का साइज़</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2 px-3 text-xs font-black rounded-xl bg-slate-900 text-white text-center shadow-xs">
                  A4 बड़ा पेपर (पोर्ट्रेट)
                </div>
                <div className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-400 border border-dashed border-slate-300 text-center">
                  (खाली स्लॉट)
                </div>
              </div>
            </div>

            {/* टूल 3: कार्ड लेआउट (अगल-बगल / ऊपर-नीचे) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">कार्ड लेआउट</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutMode("horizontal")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    layoutMode === "horizontal"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ऊपर - नीचे
                </button>
              </div>
            </div>

            {/* टूल 4: टारगेट KB साइज */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">टारगेट साइज़ (KB)</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 150, 200].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setTargetKb(kb)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      targetKb === kb
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    ~{kb} KB
                  </button>
                ))}
              </div>
            </div>

            {/* भविष्य के नए टूल्स (ब्राइटनेस, रोटेट आदि) यहीं नीचे आराम से जुड़ते रहेंगे */}
            
          </div>
        </div>

      </div>

      {/* ======================= कैमरा मोडल ======================= */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4">
          <div className="w-full flex justify-between items-center text-white pt-2">
            <span className="text-sm font-bold">
              {activeSlot === "front" ? "फ्रंट" : "बैक"} कार्ड की फ़ोटो लें
            </span>
            <button
              onClick={handleCloseCameraModal}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
            >
              ✕ बंद करें
            </button>
          </div>

          <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-8 border border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/60 bg-black/50 px-2 py-0.5 rounded">कार्ड यहाँ बीच में रखें</span>
            </div>
          </div>

          <div className="pb-6">
            <button
              type="button"
              onClick={handleCaptureFromCamera}
              className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ======================= स्मार्ट क्रॉपर मोडल ======================= */}
      {cropModalOpen && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-3 sm:p-5 select-none">
          <div className="w-full max-w-md flex justify-between items-center text-white pb-2">
            <span className="text-xs font-bold text-emerald-400">
              {activeSlot === "front" ? "फ्रंट" : "बैक"} के 4 कोने सेट करें
            </span>
            <button
              onClick={() => { setCropModalOpen(false); setRawImageSrc(null); }}
              className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700"
            >
              ✕ रद्द करें
            </button>
          </div>

          <div
            ref={imgContainerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full max-w-md aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden touch-none border border-slate-700 flex items-center justify-center cursor-crosshair"
          >
            <img
              ref={originalImageRef}
              src={rawImageSrc}
              alt="Raw Crop"
              className="w-full h-full object-contain pointer-events-none"
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d={pathD} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="0.8" strokeLinejoin="round" />
            </svg>

            {corners.map((c, idx) => (
              <div
                key={idx}
                onPointerDown={() => handlePointerDown(idx)}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-2xl flex items-center justify-center cursor-grab active:scale-125 transition-transform"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-md pt-3 flex justify-end">
            <button
              onClick={handleApplyCrop}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg transition active:scale-98"
            >
              ✓ सीधा क्रॉप करें व शीट पर सेट करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
''')

print("SPLIT_SCREEN_UI_DEPLOYED")
