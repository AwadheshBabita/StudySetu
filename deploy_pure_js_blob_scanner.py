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

  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 कोने (प्रतिशत 0 से 100)
  const [cornersPct, setCornersPct] = useState<Point[]>([
    { x: 20, y: 30 },
    { x: 80, y: 30 },
    { x: 80, y: 70 },
    { x: 20, y: 70 }
  ]);
  const [hasDocLocked, setHasDocLocked] = useState<boolean>(false);

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

  // 2. शुद्ध जावास्क्रिप्ट पिक्सल इंजन: रंगीन चादर छोड़कर सफेद ऑब्जेक्ट का क्लस्टर खोजना
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(processFrame);
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
    const d = ctx.getImageData(0, 0, sw, sh).data;

    // स्टेप A: चादर का रंग छोड़कर केवल न्यूट्रल/सफेद पिक्सल का बाइनरी मैप बनाना
    let minX = sw, maxX = 0, minY = sh, maxY = 0;
    let whitePixelCount = 0;

    let p0 = { x: sw, y: sh };
    let p1 = { x: 0, y: sh };
    let p2 = { x: 0, y: 0 };
    let p3 = { x: sw, y: 0 };

    let minSum = 9999, maxSum = -9999;
    let maxDiffX = -9999, maxDiffY = -9999;

    // स्क्रीन के बाहरी 5% मार्जिन को छोड़ें ताकि फ्रेम बॉर्डर न पकड़े
    const padX = Math.round(sw * 0.05);
    const padY = Math.round(sh * 0.05);

    for (let y = padY; y < sh - padY; y += 2) {
      for (let x = padX; x < sw - padX; x += 2) {
        const idx = (y * sw + x) * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];

        // ल्युमिनेंस
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // क्रोमा/कलर सेचुरेशन अंतर (सफेद या न्यूट्रल में R, G, B लगभग बराबर होते हैं)
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC - minC;

        // नियम: ऑब्जेक्ट का पिक्सल सफेद/हल्का होना चाहिए (lum > 115) और चादर की तरह रंगीन नहीं होना चाहिए (saturation < 38)
        if (lum > 115 && saturation < 38) {
          whitePixelCount++;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          // 4 कोनों के एक्सट्रीम्स
          const sum = x + y;
          const diffX = x - y;
          const diffY = y - x;

          if (sum < minSum) { minSum = sum; p0 = { x, y }; }
          if (sum > maxSum) { maxSum = sum; p2 = { x, y }; }
          if (diffX > maxDiffX) { maxDiffX = diffX; p1 = { x, y }; }
          if (diffY > maxDiffY) { maxDiffY = diffY; p3 = { x, y }; }
        }
      }
    }

    const blobWidth = maxX - minX;
    const blobHeight = maxY - minY;
    const totalSampled = (sw * sh) / 4;

    // यदि सफेद ऑब्जेक्ट का आकार फ्रेम के 5% से 75% के बीच है
    if (whitePixelCount > totalSampled * 0.05 && whitePixelCount < totalSampled * 0.75 && blobWidth > sw * 0.18 && blobHeight > sh * 0.15) {
      setHasDocLocked(true);

      const t0 = { x: (p0.x / sw) * 100, y: (p0.y / sh) * 100 };
      const t1 = { x: (p1.x / sw) * 100, y: (p1.y / sh) * 100 };
      const t2 = { x: (p2.x / sw) * 100, y: (p2.y / sh) * 100 };
      const t3 = { x: (p3.x / sw) * 100, y: (p3.y / sh) * 100 };

      // स्मूथ Lerp (कांपना बंद)
      setCornersPct((prev) => [
        { x: prev[0].x * 0.7 + t0.x * 0.3, y: prev[0].y * 0.7 + t0.y * 0.3 },
        { x: prev[1].x * 0.7 + t1.x * 0.3, y: prev[1].y * 0.7 + t1.y * 0.3 },
        { x: prev[2].x * 0.7 + t2.x * 0.3, y: prev[2].y * 0.7 + t2.y * 0.3 },
        { x: prev[3].x * 0.7 + t3.x * 0.3, y: prev[3].y * 0.7 + t3.y * 0.3 }
      ]);
    } else {
      setHasDocLocked(false);
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    if (cameraActive) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, processFrame]);

  // 3. कैप्चर: सीधे लॉक हुए ऑब्जेक्ट को काटकर A4 में सीधा करना
  const handleCapturePage = async () => {
    if (!videoRef.current || processing) return;
    setProcessing(true);

    try {
      const video = videoRef.current;
      const vWidth = video.videoWidth || 1920;
      const vHeight = video.videoHeight || 1080;

      const rawCanvas = document.createElement("canvas");
      rawCanvas.width = vWidth;
      rawCanvas.height = vHeight;
      const rawCtx = rawCanvas.getContext("2d");
      if (!rawCtx) return;
      rawCtx.drawImage(video, 0, 0, vWidth, vHeight);

      const pts = cornersPct.map((p) => ({
        x: (p.x / 100) * vWidth,
        y: (p.y / 100) * vHeight
      }));

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

      // माइक्रो-स्लाइसिंग पर्सपेक्टिव वार्प
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
        sCtx.drawImage(rawCanvas, -leftX1, -leftY1);
        sCtx.restore();
      }

      // ऑटो एनहांस (क्लीन वाइट बैकग्राउंड + गाढ़ा टेक्स्ट)
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

      // A4 फॉर्मेट में केंद्र पर फिट करना
      const a4W = 1200;
      const a4H = 1700;
      const a4Canvas = document.createElement("canvas");
      a4Canvas.width = a4W;
      a4Canvas.height = a4H;
      const aCtx = a4Canvas.getContext("2d");
      if (aCtx) {
        aCtx.fillStyle = "#ffffff";
        aCtx.fillRect(0, 0, a4W, a4H);
        const scale = Math.min((a4W - 60) / docW, (a4H - 60) / docH);
        const fitW = docW * scale;
        const fitH = docH * scale;
        aCtx.drawImage(straightCanvas, (a4W - fitW) / 2, (a4H - fitH) / 2, fitW, fitH);
      }

      setPages((prev) => [...prev, { id: Date.now().toString(), dataUrl: a4Canvas.toDataURL("image/jpeg", 0.92) }]);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // 4. PDF एक्सपोर्ट
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(pages[i].dataUrl, "JPEG", 0, 0, 210, 297);
      }
      pdf.save(`SmartScan_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  const pathD = `M ${cornersPct[0].x} ${cornersPct[0].y} L ${cornersPct[1].x} ${cornersPct[1].y} L ${cornersPct[2].x} ${cornersPct[2].y} L ${cornersPct[3].x} ${cornersPct[3].y} Z`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-[11px] font-black px-2 py-0.5 rounded">JS ENGINE</span>
          <h1 className="text-sm font-bold text-white">Pure Canvas Scanner</h1>
        </div>
        <Link href="/tools/document-scanner" className="text-xs text-slate-400 hover:text-white">
          मुख्य मेनू
        </Link>
      </header>

      {/* लाइव व्यूफ़ाइंडर */}
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

            {/* हेयरलाइन लाइव बाउंड्री (सटीक 0.75px पतली हरी रेखा) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {hasDocLocked && (
                <>
                  <path
                    d={pathD}
                    fill="rgba(16, 185, 129, 0.16)"
                    stroke="#10b981"
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                  />
                  {cornersPct.map((c, idx) => (
                    <circle
                      key={idx}
                      cx={c.x}
                      cy={c.y}
                      r="1.3"
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
                {hasDocLocked ? "✓ ऑब्जेक्ट लॉक हुआ (शटर दबाएँ)" : "ऑब्जेक्ट की ओर कैमरा करें..."}
              </span>
            </div>

            {processing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-2 z-20">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-emerald-300">डॉक्यूमेंट सीधा व साफ़ हो रहा है...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* कंट्रोल बार */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
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
            onClick={handleCapturePage}
            disabled={processing}
            className={`w-18 h-18 rounded-full border-4 flex items-center justify-center p-1 active:scale-95 transition ${
              hasDocLocked ? "border-emerald-400" : "border-white"
            }`}
          >
            <div
              className={`w-full h-full rounded-full transition ${
                hasDocLocked ? "bg-emerald-500 hover:bg-emerald-400" : "bg-white"
              }`}
            ></div>
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
        </div>
      </div>
    </div>
  );
}
''')

print("PURE_JS_BLOB_ENGINE_DEPLOYED")
