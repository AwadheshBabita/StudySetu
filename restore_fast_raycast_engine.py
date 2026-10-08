with open("src/app/tools/cam-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
}

export default function CamDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const detectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);

  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<"camera" | "crop">("camera");
  const [capturedImgSrc, setCapturedImgSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 लाइव कोने (% में: 0 से 100)
  const [cornersPct, setCornersPct] = useState<Point[]>([
    { x: 22, y: 32 },
    { x: 78, y: 32 },
    { x: 78, y: 68 },
    { x: 22, y: 68 }
  ]);
  const [hasDocLocked, setHasDocLocked] = useState<boolean>(false);

  // क्रॉप स्क्रीन के लिए 4 कोने (पिक्सेल स्तर पर)
  const [cropCorners, setCropCorners] = useState<Point[]>([]);
  const [imgDim, setImgDim] = useState<{ w: number; h: number }>({ w: 1080, h: 1920 });
  const [activeHandle, setActiveHandle] = useState<number | null>(null);

  // 1. रियर कैमरा चालू करना
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("कैमरा एक्सेस नहीं मिला। ब्राउज़र में कैमरा परमिशन दें।");
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 2. सुपर-फास्ट सेंटर-आउटवर्ड रेकास्ट इंजन (शुद्ध जावास्क्रिप्ट - बिना किसी OpenCV के)
  const processLiveFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(processLiveFrame);
      return;
    }

    const sw = 160;
    const sh = 200;

    if (!detectCanvasRef.current) {
      detectCanvasRef.current = document.createElement("canvas");
      detectCanvasRef.current.width = sw;
      detectCanvasRef.current.height = sh;
    }

    const c = detectCanvasRef.current;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const d = imgData.data;

    // ग्रेस्केल ऐरे
    const gray = new Uint8Array(sw * sh);
    for (let i = 0; i < d.length; i += 4) {
      gray[i / 4] = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
    }

    // केंद्र बिंदु (Center of Attention)
    const cx = Math.round(sw * 0.5);
    const cy = Math.round(sh * 0.5);

    // केंद्र का औसत उजाला (कार्ड का रंग)
    let centerLumSum = 0;
    let centerCount = 0;
    for (let y = cy - 8; y <= cy + 8; y++) {
      for (let x = cx - 8; x <= cx + 8; x++) {
        centerLumSum += gray[y * sw + x];
        centerCount++;
      }
    }
    const centerLum = centerLumSum / centerCount;

    // केंद्र से बाहर की ओर 4 दिशाओं में स्कैन (Ray-Cast)
    // जैसे ही कार्ड खत्म होकर चादर/टेबल आएगी, ल्युमिनेंस अचानक गिरेगा (Drop > 18)
    let topY = Math.round(sh * 0.28);
    let bottomY = Math.round(sh * 0.72);
    let leftX = Math.round(sw * 0.22);
    let rightX = Math.round(sw * 0.78);

    // ऊपर की ओर स्कैन
    for (let y = cy - 10; y > 15; y -= 2) {
      let edgeFound = 0;
      for (let x = cx - 20; x <= cx + 20; x += 5) {
        if (Math.abs(gray[y * sw + x] - centerLum) > 22) edgeFound++;
      }
      if (edgeFound >= 5) {
        topY = y;
        break;
      }
    }

    // नीचे की ओर स्कैन
    for (let y = cy + 10; y < sh - 15; y += 2) {
      let edgeFound = 0;
      for (let x = cx - 20; x <= cx + 20; x += 5) {
        if (Math.abs(gray[y * sw + x] - centerLum) > 22) edgeFound++;
      }
      if (edgeFound >= 5) {
        bottomY = y;
        break;
      }
    }

    // बाईं ओर स्कैन
    for (let x = cx - 10; x > 12; x -= 2) {
      let edgeFound = 0;
      for (let y = cy - 20; y <= cy + 20; y += 5) {
        if (Math.abs(gray[y * sw + x] - centerLum) > 22) edgeFound++;
      }
      if (edgeFound >= 5) {
        leftX = x;
        break;
      }
    }

    // दाईं ओर स्कैन
    for (let x = cx + 10; x < sw - 12; x += 2) {
      let edgeFound = 0;
      for (let y = cy - 20; y <= cy + 20; y += 5) {
        if (Math.abs(gray[y * sw + x] - centerLum) > 22) edgeFound++;
      }
      if (edgeFound >= 5) {
        rightX = x;
        break;
      }
    }

    const docW = rightX - leftX;
    const docH = bottomY - topY;

    // यदि केंद्र में एक ठोस आयताकार वस्तु बंद मिली
    if (docW > sw * 0.20 && docH > sh * 0.16) {
      setHasDocLocked(true);
      const targetP0 = { x: (leftX / sw) * 100, y: (topY / sh) * 100 };
      const targetP1 = { x: (rightX / sw) * 100, y: (topY / sh) * 100 };
      const targetP2 = { x: (rightX / sw) * 100, y: (bottomY / sh) * 100 };
      const targetP3 = { x: (leftX / sw) * 100, y: (bottomY / sh) * 100 };

      // स्मूथ Lerp ताकि लाइन कांपे नहीं
      setCornersPct((prev) => [
        { x: prev[0].x * 0.65 + targetP0.x * 0.35, y: prev[0].y * 0.65 + targetP0.y * 0.35 },
        { x: prev[1].x * 0.65 + targetP1.x * 0.35, y: prev[1].y * 0.65 + targetP1.y * 0.35 },
        { x: prev[2].x * 0.65 + targetP2.x * 0.35, y: prev[2].y * 0.65 + targetP2.y * 0.35 },
        { x: prev[3].x * 0.65 + targetP3.x * 0.35, y: prev[3].y * 0.65 + targetP3.y * 0.35 }
      ]);
    } else {
      setHasDocLocked(false);
    }

    animFrameRef.current = requestAnimationFrame(processLiveFrame);
  }, []);

  useEffect(() => {
    if (cameraActive && viewState === "camera") {
      animFrameRef.current = requestAnimationFrame(processLiveFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, viewState, processLiveFrame]);

  // 3. फोटो कैप्चर और 8-हैंडल फाइन-ट्यून स्क्रीन
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth || 1920;
    const vh = video.videoHeight || 1080;

    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = vw;
    snapCanvas.height = vh;
    const sCtx = snapCanvas.getContext("2d");
    if (!sCtx) return;
    sCtx.drawImage(video, 0, 0, vw, vh);

    setImgDim({ w: vw, h: vh });
    const fullUrl = snapCanvas.toDataURL("image/jpeg", 0.95);
    setCapturedImgSrc(fullUrl);

    // डिटेक्ट किए गए कोनों को पिक्सेल में बदलना
    const pxCorners = cornersPct.map((p) => ({
      x: (p.x / 100) * vw,
      y: (p.y / 100) * vh
    }));
    setCropCorners(pxCorners);
    setViewState("crop");
  };

  // 8 हैंडल्स (4 कोने + 4 साइड्स)
  const getEightHandles = (): { x: number; y: number; id: number }[] => {
    if (cropCorners.length < 4) return [];
    const [c0, c1, c2, c3] = cropCorners;
    return [
      { x: c0.x, y: c0.y, id: 0 },
      { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2, id: 4 },
      { x: c1.x, y: c1.y, id: 1 },
      { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2, id: 5 },
      { x: c2.x, y: c2.y, id: 2 },
      { x: (c2.x + c3.x) / 2, y: (c2.y + c3.y) / 2, id: 6 },
      { x: c3.x, y: c3.y, id: 3 },
      { x: (c3.x + c0.x) / 2, y: (c3.y + c0.y) / 2, id: 7 }
    ];
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeHandle === null || !cropContainerRef.current) return;
    const touch = e.touches[0];
    const rect = cropContainerRef.current.getBoundingClientRect();

    const scaleX = imgDim.w / rect.width;
    const scaleY = imgDim.h / rect.height;

    const curX = Math.max(0, Math.min(imgDim.w, (touch.clientX - rect.left) * scaleX));
    const curY = Math.max(0, Math.min(imgDim.h, (touch.clientY - rect.top) * scaleY));

    setCropCorners((prev) => {
      const next = [...prev];
      if (activeHandle >= 0 && activeHandle <= 3) {
        next[activeHandle] = { x: curX, y: curY };
      } else if (activeHandle === 4) {
        next[0].y = curY; next[1].y = curY;
      } else if (activeHandle === 5) {
        next[1].x = curX; next[2].x = curX;
      } else if (activeHandle === 6) {
        next[2].y = curY; next[3].y = curY;
      } else if (activeHandle === 7) {
        next[0].x = curX; next[3].x = curX;
      }
      return next;
    });
  };

  // 4. सीधा करना (माइक्रो-स्लाइसिंग 450) + ऑटो एनहांस
  const handleApplyTransformAndContinue = async () => {
    if (!capturedImgSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = capturedImgSrc;
      await new Promise((res) => { img.onload = res; });

      const pts = cropCorners;
      const topW = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const botW = Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y);
      const leftH = Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y);
      const rightH = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);

      const docW = Math.round(Math.max(topW, botW));
      const docH = Math.round(Math.max(leftH, rightH));

      const straightCanvas = document.createElement("canvas");
      straightCanvas.width = docW;
      straightCanvas.height = docH;
      const sCtx = straightCanvas.getContext("2d");
      if (!sCtx) return;

      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = "high";

      const slices = Math.min(docH, 450);
      for (let i = 0; i < slices; i++) {
        const t1 = i / slices;
        const t2 = (i + 1) / slices;

        const leftX1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
        const leftY1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
        const rightX1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
        const rightY1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

        const destY1 = t1 * docH;
        const destY2 = t2 * docH;
        const destH = destY2 - destY1;

        sCtx.save();
        sCtx.beginPath();
        sCtx.rect(0, destY1, docW, destH + 0.8);
        sCtx.clip();

        const sliceAngle = Math.atan2(rightY1 - leftY1, rightX1 - leftX1);
        const sliceWidth = Math.hypot(rightX1 - leftX1, rightY1 - leftY1);

        sCtx.translate(0, destY1);
        sCtx.scale(docW / sliceWidth, 1);
        sCtx.rotate(-sliceAngle);
        sCtx.drawImage(img, -leftX1, -leftY1);
        sCtx.restore();
      }

      // ऑटो एनहांस टोनल कर्व
      const imgData = sCtx.getImageData(0, 0, docW, docH);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const norm = lum / 255;
        let enhanced = norm > 0.52 ? 0.52 + Math.pow((norm - 0.52) / 0.48, 0.85) * 0.48 : Math.pow(norm / 0.52, 1.25) * 0.52;
        enhanced = Math.min(1, enhanced * 1.08);
        const ratio = (enhanced * 255) / (lum || 1);
        d[i] = Math.min(255, d[i] * ratio);
        d[i + 1] = Math.min(255, d[i + 1] * ratio);
        d[i + 2] = Math.min(255, d[i + 2] * ratio);
      }
      sCtx.putImageData(imgData, 0, 0);

      // A4 में फिट करना
      const a4Canvas = document.createElement("canvas");
      a4Canvas.width = 1240;
      a4Canvas.height = 1754;
      const aCtx = a4Canvas.getContext("2d");
      if (aCtx) {
        aCtx.fillStyle = "#ffffff";
        aCtx.fillRect(0, 0, 1240, 1754);
        const scale = Math.min(1160 / docW, 1670 / docH);
        const fw = docW * scale;
        const fh = docH * scale;
        aCtx.drawImage(straightCanvas, (1240 - fw) / 2, (1754 - fh) / 2, fw, fh);
      }

      setPages((prev) => [...prev, { id: Date.now().toString(), dataUrl: a4Canvas.toDataURL("image/jpeg", 0.92) }]);
      setCapturedImgSrc(null);
      setViewState("camera");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // 5. PDF एक्सपोर्ट
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(pages[i].dataUrl, "JPEG", 0, 0, 210, 297);
      }
      pdf.save(`OpenScan_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  const cropPathD = cropCorners.length === 4
    ? `M ${(cropCorners[0].x / imgDim.w) * 100} ${(cropCorners[0].y / imgDim.h) * 100} L ${(cropCorners[1].x / imgDim.w) * 100} ${(cropCorners[1].y / imgDim.h) * 100} L ${(cropCorners[2].x / imgDim.w) * 100} ${(cropCorners[2].y / imgDim.h) * 100} L ${(cropCorners[3].x / imgDim.w) * 100} ${(cropCorners[3].y / imgDim.h) * 100} Z`
    : "";

  const livePathD = `M ${cornersPct[0].x} ${cornersPct[0].y} L ${cornersPct[1].x} ${cornersPct[1].y} L ${cornersPct[2].x} ${cornersPct[2].y} L ${cornersPct[3].x} ${cornersPct[3].y} Z`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-[11px] font-black px-2 py-0.5 rounded">SMART ENGINE</span>
          <h1 className="text-sm font-bold text-white">Live Smart Scanner</h1>
        </div>
        <Link href="/tools/document-scanner" className="text-xs text-slate-400 hover:text-white">
          मुख्य मेनू
        </Link>
      </header>

      {/* व्यू 1: लाइव कैमरा */}
      {viewState === "camera" && (
        <div className="flex-1 relative flex flex-col items-center justify-center p-2 bg-black overflow-hidden">
          {cameraError ? (
            <div className="text-center p-4 bg-red-900/40 border border-red-600 rounded-xl max-w-sm">
              <p className="text-sm font-medium mb-3">{cameraError}</p>
              <button onClick={startCamera} className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold">
                फिर कोशिश करें
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* हेयरलाइन लाइव बाउंड्री (सटीक 1px पतली हरी रेखा) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {hasDocLocked && (
                  <>
                    <path
                      d={livePathD}
                      fill="rgba(16, 185, 129, 0.18)"
                      stroke="#10b981"
                      strokeWidth="0.9"
                      strokeLinejoin="round"
                    />
                    {cornersPct.map((c, i) => (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r="1.6"
                        fill="#34d399"
                        stroke="#ffffff"
                        strokeWidth="0.4"
                      />
                    ))}
                  </>
                )}
              </svg>

              <div className="absolute top-3 inset-x-3 flex justify-between pointer-events-none">
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md transition ${
                    hasDocLocked ? "bg-emerald-600 text-white shadow-lg" : "bg-black/60 text-slate-300"
                  }`}
                >
                  {hasDocLocked ? "✓ कार्ड लॉक हुआ (क्लिक करें)" : "कार्ड को कैमरे के केंद्र में लाएँ..."}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* व्यू 2: 8-हैंडल फाइन-ट्यून स्क्रीन */}
      {viewState === "crop" && capturedImgSrc && (
        <div className="flex-1 relative flex flex-col items-center justify-center p-2 bg-black overflow-hidden">
          <div
            ref={cropContainerRef}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setActiveHandle(null)}
            className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl touch-none"
          >
            <img
              src={capturedImgSrc}
              alt="Snap"
              className="w-full h-full object-fill pointer-events-none"
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={cropPathD}
                fill="rgba(16, 185, 129, 0.20)"
                stroke="#10b981"
                strokeWidth="1.2"
              />
            </svg>

            {/* 8 टच हैंडल्स */}
            {getEightHandles().map((h) => {
              const leftPct = (h.x / imgDim.w) * 100;
              const topPct = (h.y / imgDim.h) * 100;
              const isCorner = h.id <= 3;
              return (
                <div
                  key={h.id}
                  onTouchStart={() => setActiveHandle(h.id)}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${
                    isCorner ? "w-8 h-8" : "w-6 h-6"
                  }`}
                >
                  <div
                    className={`rounded-full border-2 border-white shadow-xl ${
                      isCorner ? "w-4.5 h-4.5 bg-emerald-400" : "w-3 h-3 bg-emerald-200"
                    }`}
                  />
                </div>
              );
            })}

            {processing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-2 z-30">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-emerald-300">A4 में सीधा व साफ़ हो रहा है...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* कंट्रोल बार */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {viewState === "camera" ? (
            <>
              <div className="w-16 h-16 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden relative">
                {pages.length > 0 ? (
                  <>
                    <img src={pages[pages.length - 1].dataUrl} alt="Thumb" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] text-center font-bold">
                      {pages.length} पेज
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">0 पेज</span>
                )}
              </div>

              <button
                onClick={handleCapture}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition"
              >
                <div className="w-full h-full bg-emerald-500 hover:bg-emerald-400 rounded-full"></div>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={pages.length === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition ${
                  pages.length > 0 ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                }`}
              >
                PDF सेव ({pages.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setViewState("camera")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              >
                ✕ रद्द करें (Retake)
              </button>

              <button
                onClick={handleApplyTransformAndContinue}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg flex items-center space-x-1.5 active:scale-95 transition"
              >
                <span>✓ कंटिन्यू (अगला पेज)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
''')

print("FAST_RAYCAST_ENGINE_RESTORED")
