with open("src/app/tools/cam-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const cropContainerRef = useRef<HTMLDivElement | null>(null);

  // स्टेट्स
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<"camera" | "crop">("camera");
  const [capturedImgSrc, setCapturedImgSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 कोने (Pixel coordinates on captured image)
  const [corners, setCorners] = useState<Point[]>([
    { x: 50, y: 50 },
    { x: 350, y: 50 },
    { x: 350, y: 500 },
    { x: 50, y: 500 }
  ]);
  const [imgDim, setImgDim] = useState<{ w: number; h: number }>({ w: 400, h: 600 });
  const [activeHandle, setActiveHandle] = useState<number | null>(null);

  // 1. कैमरा शुरू
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

  // 2. कैप्चर बटन क्लिक (फुल रेजोल्यूशन फोटो + ऑटो-डिटेक्ट)
  const handleShutter = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = vw;
    snapCanvas.height = vh;
    const ctx = snapCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, vw, vh);

    setImgDim({ w: vw, h: vh });
    const fullDataUrl = snapCanvas.toDataURL("image/jpeg", 0.95);
    setCapturedImgSrc(fullDataUrl);

    // ऑटो-डिटेक्शन इंजन (कागज़ के किनारों को खोजना)
    const d = ctx.getImageData(0, 0, vw, vh).data;
    let minX = vw, maxX = 0, minY = vh, maxY = 0;
    let foundBright = 0;

    // ब्राइटनेस एवरेज
    let totalLum = 0;
    for (let i = 0; i < d.length; i += 64) {
      totalLum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    const avgLum = totalLum / (d.length / 64);
    const brightThresh = Math.max(125, avgLum + 22);

    for (let y = Math.round(vh * 0.08); y < vh * 0.92; y += 6) {
      for (let x = Math.round(vw * 0.08); x < vw * 0.92; x += 6) {
        const idx = (y * vw + x) * 4;
        const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
        if (lum > brightThresh) {
          foundBright++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (foundBright > 400 && maxX - minX > vw * 0.2 && maxY - minY > vh * 0.2) {
      // ठीक उस कागज़ के 4 कोनों पर जाकर रुकेगा
      setCorners([
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ]);
    } else {
      // सामान्य 70% केंद्र ग्रिड
      setCorners([
        { x: vw * 0.15, y: vh * 0.15 },
        { x: vw * 0.85, y: vh * 0.15 },
        { x: vw * 0.85, y: vh * 0.85 },
        { x: vw * 0.15, y: vh * 0.85 }
      ]);
    }

    setViewState("crop");
  };

  // 8 हैंडल्स (4 कोने + 4 साइड्स के मध्य बिंदु)
  const getEightHandles = (): { x: number; y: number; id: number }[] => {
    const [c0, c1, c2, c3] = corners;
    return [
      { x: c0.x, y: c0.y, id: 0 }, // Top-Left
      { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2, id: 4 }, // Top-Mid
      { x: c1.x, y: c1.y, id: 1 }, // Top-Right
      { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2, id: 5 }, // Right-Mid
      { x: c2.x, y: c2.y, id: 2 }, // Bottom-Right
      { x: (c2.x + c3.x) / 2, y: (c2.y + c3.y) / 2, id: 6 }, // Bottom-Mid
      { x: c3.x, y: c3.y, id: 3 }, // Bottom-Left
      { x: (c3.x + c0.x) / 2, y: (c3.y + c0.y) / 2, id: 7 }  // Left-Mid
    ];
  };

  // 8 हैंडल को उंगली से छूकर एडजस्ट करना (Touch Drag)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeHandle === null || !cropContainerRef.current) return;
    const touch = e.touches[0];
    const rect = cropContainerRef.current.getBoundingClientRect();

    const scaleX = imgDim.w / rect.width;
    const scaleY = imgDim.h / rect.height;

    const curX = Math.max(0, Math.min(imgDim.w, (touch.clientX - rect.left) * scaleX));
    const curY = Math.max(0, Math.min(imgDim.h, (touch.clientY - rect.top) * scaleY));

    setCorners((prev) => {
      const next = [...prev];
      if (activeHandle >= 0 && activeHandle <= 3) {
        next[activeHandle] = { x: curX, y: curY };
      } else if (activeHandle === 4) { // Top Mid
        next[0].y = curY; next[1].y = curY;
      } else if (activeHandle === 5) { // Right Mid
        next[1].x = curX; next[2].x = curX;
      } else if (activeHandle === 6) { // Bottom Mid
        next[2].y = curY; next[3].y = curY;
      } else if (activeHandle === 7) { // Left Mid
        next[0].x = curX; next[3].x = curX;
      }
      return next;
    });
  };

  // 3. 'कंटिन्यू' बटन (सीधा करना + A4 में ऑटो-क्लीन एनहांस + नेक्स्ट पेज)
  const handleApplyCropAndContinue = async () => {
    if (!capturedImgSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = capturedImgSrc;
      await new Promise((res) => { img.onload = res; });

      const pts = corners;
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

      // 450 माइक्रो-स्लाइसिंग (सुपर स्मूथ बिना किसी कट के)
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

      // ऑटो एनहांस (Magic Paper Clean + Crisp Text)
      const imgData = sCtx.getImageData(0, 0, docW, docH);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const norm = lum / 255;

        let enhanced;
        if (norm > 0.52) {
          enhanced = 0.52 + Math.pow((norm - 0.52) / 0.48, 0.85) * 0.48;
          enhanced = Math.min(1, enhanced * 1.10);
        } else {
          enhanced = Math.pow(norm / 0.52, 1.25) * 0.52;
        }

        const targetLum = enhanced * 255;
        const ratio = targetLum / (lum || 1);
        r = Math.min(255, Math.max(0, r * ratio));
        g = Math.min(255, Math.max(0, g * ratio));
        b = Math.min(255, Math.max(0, b * ratio));

        const postLum = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = Math.min(255, Math.max(0, postLum + (r - postLum) * 1.15));
        d[i + 1] = Math.min(255, Math.max(0, postLum + (g - postLum) * 1.15));
        d[i + 2] = Math.min(255, Math.max(0, postLum + (b - postLum) * 1.15));
      }
      sCtx.putImageData(imgData, 0, 0);

      // A4 कैनवास में फिट करना
      const a4W = 1200;
      const a4H = 1700;
      const a4Canvas = document.createElement("canvas");
      a4Canvas.width = a4W;
      a4Canvas.height = a4H;
      const aCtx = a4Canvas.getContext("2d");
      if (aCtx) {
        aCtx.fillStyle = "#ffffff";
        aCtx.fillRect(0, 0, a4W, a4H);
        // स्केल और सेंटर
        const scale = Math.min((a4W - 80) / docW, (a4H - 80) / docH);
        const fitW = docW * scale;
        const fitH = docH * scale;
        const offX = (a4W - fitW) / 2;
        const offY = (a4H - fitH) / 2;
        aCtx.drawImage(straightCanvas, offX, offY, fitW, fitH);
      }

      const finalPageUrl = a4Canvas.toDataURL("image/jpeg", 0.92);

      // पेज स्टैक में जोड़ना
      setPages((prev) => [...prev, { id: Date.now().toString(), dataUrl: finalPageUrl }]);

      // वापस कैमरा पर लौटना (अगला पेज कैप्चर करने के लिए)
      setCapturedImgSrc(null);
      setViewState("camera");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // 4. सभी पेजों की संयुक्त PDF बनाना
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(pages[i].dataUrl, "JPEG", 0, 0, 210, 297);
      }
      pdf.save(`OpenScan_Doc_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  // SVG पॉलीगॉन पाथ
  const getSvgPath = () => {
    if (!imgDim.w || !imgDim.h) return "";
    const p = corners.map((c) => ({
      x: (c.x / imgDim.w) * 100,
      y: (c.y / imgDim.h) * 100
    }));
    return `M ${p[0].x} ${p[0].y} L ${p[1].x} ${p[1].y} L ${p[2].x} ${p[2].y} L ${p[3].x} ${p[3].y} Z`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* हेडर */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded">OPENSCAN</span>
          <h1 className="text-sm font-bold text-white">Smart Document Scanner</h1>
        </div>
        <Link href="/tools/document-scanner" className="text-xs text-slate-400 hover:text-white px-2 py-1">
          मुख्य स्कैनर पर लौटें
        </Link>
      </header>

      {/* मुख्य बॉडी: मोड 1 - लाइव कैमरा */}
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
              <div className="absolute inset-5 border border-dashed border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <span className="text-[11px] bg-black/60 text-emerald-300 px-2 py-1 rounded self-start font-medium">
                  दस्तावेज़ को फ्रेम में रखें और शटर दबाएँ
                </span>
                <span className="text-[10px] bg-black/60 text-slate-300 px-2 py-0.5 rounded self-end">
                  ऑटो 8-हैंडल क्रॉप एक्टिव
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* मुख्य बॉडी: मोड 2 - कैप्चर के बाद 8-हैंडल क्रॉप स्क्रीन */}
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

            {/* 8-हैंडल ग्रिड व बॉर्डर */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={getSvgPath()}
                fill="rgba(16, 185, 129, 0.22)"
                stroke="#10b981"
                strokeWidth="1.2"
              />
            </svg>

            {/* 8 टच हैंडल्स (4 कोने + 4 साइड्स) */}
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
                      isCorner ? "w-4.5 h-4.5 bg-emerald-400" : "w-3 h-3 bg-emerald-300"
                    }`}
                  />
                </div>
              );
            })}

            {processing && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center space-y-2 z-30">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-emerald-300">A4 में सीधा व साफ़ हो रहा है...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* निचला कंट्रोल बार */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {viewState === "camera" ? (
            <>
              {/* थंबनेल */}
              <div className="w-16 h-16 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden relative">
                {pages.length > 0 ? (
                  <>
                    <img
                      src={pages[pages.length - 1].dataUrl}
                      alt="Thumb"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] text-center font-bold">
                      {pages.length} पेज
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">0 पेज</span>
                )}
              </div>

              {/* शटर बटन */}
              <button
                onClick={handleShutter}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition"
              >
                <div className="w-full h-full bg-emerald-500 hover:bg-emerald-400 rounded-full"></div>
              </button>

              {/* PDF सेव */}
              <button
                onClick={handleExportPdf}
                disabled={pages.length === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition ${
                  pages.length > 0
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                }`}
              >
                PDF सेव ({pages.length})
              </button>
            </>
          ) : (
            <>
              {/* क्रॉप मोड के बटन्स */}
              <button
                onClick={() => setViewState("camera")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              >
                ✕ रद्द करें (Retake)
              </button>

              <button
                onClick={handleApplyCropAndContinue}
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

print("OPENSCAN_FULL_WORKFLOW_DEPLOYED")
