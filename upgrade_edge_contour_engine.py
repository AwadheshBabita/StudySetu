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
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 मुख्य कोने (% में)
  const [cornersPct, setCornersPct] = useState<Point[]>([
    { x: 25, y: 35 },
    { x: 75, y: 35 },
    { x: 75, y: 65 },
    { x: 25, y: 65 }
  ]);
  const [hasDetectedDoc, setHasDetectedDoc] = useState<boolean>(false);

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
      setIsCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("कैमरा एक्सेस नहीं मिला। ब्राउज़र से कैमरा परमिशन दें।");
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // सोबेल ग्रेडिएंट + एज कंटूर इंजन (चादर या बैकग्राउंड को काटकर सिर्फ दस्तावेज़ को पकड़ना)
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

    // 1. ग्रेस्केल बफर
    const gray = new Uint8Array(sw * sh);
    for (let i = 0; i < d.length; i += 4) {
      gray[i / 4] = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
    }

    // 2. सोबेल एज-मैग्नीट्यूड (किनारे पकड़ना)
    // दस्तावेज़ का किनारा बैकग्राउंड की तुलना में एक तीव्र ल्यूमिनेन्स कट बनाता है
    const edges = new Uint8Array(sw * sh);
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const gx =
          -gray[(y - 1) * sw + (x - 1)] + gray[(y - 1) * sw + (x + 1)] +
          -2 * gray[y * sw + (x - 1)] + 2 * gray[y * sw + (x + 1)] +
          -gray[(y + 1) * sw + (x - 1)] + gray[(y + 1) * sw + (x + 1)];

        const gy =
          -gray[(y - 1) * sw + (x - 1)] - 2 * gray[(y - 1) * sw + x] - gray[(y - 1) * sw + (x + 1)] +
          gray[(y + 1) * sw + (x - 1)] + 2 * gray[(y + 1) * sw + x] + gray[(y + 1) * sw + (x + 1)];

        const mag = (Math.abs(gx) + Math.abs(gy)) >> 2;
        edges[y * sw + x] = mag > 24 ? 255 : 0;
      }
    }

    // 3. दस्तावेज़ के 4 किनारों (Top, Bottom, Left, Right) का रे-कास्ट स्कैन
    // केंद्र से बाहर की ओर 4 दिशाओं में ठोस किनारों की खोज
    const cx = Math.round(sw * 0.5);
    const cy = Math.round(sh * 0.5);

    let topY = Math.round(sh * 0.25);
    let bottomY = Math.round(sh * 0.75);
    let leftX = Math.round(sw * 0.2);
    let rightX = Math.round(sw * 0.8);

    // ऊपर की ओर स्कैन
    for (let y = cy - 10; y > 15; y--) {
      let edgeCount = 0;
      for (let x = cx - 25; x <= cx + 25; x += 3) {
        if (edges[y * sw + x] === 255) edgeCount++;
      }
      if (edgeCount >= 5) {
        topY = y;
        break;
      }
    }

    // नीचे की ओर स्कैन
    for (let y = cy + 10; y < sh - 15; y++) {
      let edgeCount = 0;
      for (let x = cx - 25; x <= cx + 25; x += 3) {
        if (edges[y * sw + x] === 255) edgeCount++;
      }
      if (edgeCount >= 5) {
        bottomY = y;
        break;
      }
    }

    // बाईं ओर स्कैन
    for (let x = cx - 10; x > 12; x--) {
      let edgeCount = 0;
      for (let y = cy - 25; y <= cy + 25; y += 3) {
        if (edges[y * sw + x] === 255) edgeCount++;
      }
      if (edgeCount >= 5) {
        leftX = x;
        break;
      }
    }

    // दाईं ओर स्कैन
    for (let x = cx + 10; x < sw - 12; x++) {
      let edgeCount = 0;
      for (let y = cy - 25; y <= cy + 25; y += 3) {
        if (edges[y * sw + x] === 255) edgeCount++;
      }
      if (edgeCount >= 5) {
        rightX = x;
        break;
      }
    }

    const docWidth = rightX - leftX;
    const docHeight = bottomY - topY;

    // यदि कार्ड/कागज़ का एक ठोस चौकोर आकार केंद्र के पास मिला
    if (docWidth > sw * 0.25 && docHeight > sh * 0.18) {
      setHasDetectedDoc(true);

      const targetP0 = { x: (leftX / sw) * 100, y: (topY / sh) * 100 };
      const targetP1 = { x: (rightX / sw) * 100, y: (topY / sh) * 100 };
      const targetP2 = { x: (rightX / sw) * 100, y: (bottomY / sh) * 100 };
      const targetP3 = { x: (leftX / sw) * 100, y: (bottomY / sh) * 100 };

      // स्मूथ ट्रैकिंग (Lerp)
      setCornersPct((prev) => [
        { x: prev[0].x * 0.65 + targetP0.x * 0.35, y: prev[0].y * 0.65 + targetP0.y * 0.35 },
        { x: prev[1].x * 0.65 + targetP1.x * 0.35, y: prev[1].y * 0.65 + targetP1.y * 0.35 },
        { x: prev[2].x * 0.65 + targetP2.x * 0.35, y: prev[2].y * 0.65 + targetP2.y * 0.35 },
        { x: prev[3].x * 0.65 + targetP3.x * 0.35, y: prev[3].y * 0.65 + targetP3.y * 0.35 }
      ]);
    } else {
      setHasDetectedDoc(false);
    }

    animFrameRef.current = requestAnimationFrame(processLiveFrame);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      animFrameRef.current = requestAnimationFrame(processLiveFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, processLiveFrame]);

  // कैप्चर व अलाइनमेंट
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

      // ऑटो-एनहांस
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

      const capturedUrl = a4Canvas.toDataURL("image/jpeg", 0.92);
      setPages((prev) => [...prev, { id: Date.now().toString(), dataUrl: capturedUrl }]);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

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
      console.error(err);
    }
  };

  const [c0, c1, c2, c3] = cornersPct;
  const eightPoints: Point[] = [
    c0,
    { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2 },
    c1,
    { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 },
    c2,
    { x: (c2.x + c3.x) / 2, y: (c2.y + c3.y) / 2 },
    c3,
    { x: (c3.x + c0.x) / 2, y: (c3.y + c0.y) / 2 }
  ];

  const pathD = `M ${c0.x} ${c0.y} L ${c1.x} ${c1.y} L ${c2.x} ${c2.y} L ${c3.x} ${c3.y} Z`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded">OPENSCAN</span>
          <h1 className="text-sm font-bold text-white">Live Smart Scanner</h1>
        </div>
        <Link href="/tools/document-scanner" className="text-xs text-slate-400 hover:text-white px-2 py-1">
          मुख्य स्कैनर
        </Link>
      </header>

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

            {/* लाइव मजबूत बाउंड्री + 8 गाइडिंग पॉइंट्स */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {hasDetectedDoc && (
                <>
                  <path
                    d={pathD}
                    fill="rgba(16, 185, 129, 0.22)"
                    stroke="#10b981"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  {eightPoints.map((pt, idx) => {
                    const isCorner = idx % 2 === 0;
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={isCorner ? 2.5 : 1.6}
                        fill={isCorner ? "#34d399" : "#ffffff"}
                        stroke="#059669"
                        strokeWidth="0.6"
                      />
                    );
                  })}
                </>
              )}
            </svg>

            {/* स्थिति बैज */}
            <div className="absolute top-3 inset-x-3 flex justify-between pointer-events-none">
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md transition ${
                  hasDetectedDoc ? "bg-emerald-600 text-white shadow-lg" : "bg-black/60 text-slate-300"
                }`}
              >
                {hasDetectedDoc ? "✓ कार्ड/दस्तावेज़ लॉक हुआ" : "दस्तावेज़ को केंद्र में लाएँ..."}
              </span>
            </div>

            {processing && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center space-y-2 z-20">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-emerald-300">डॉक्यूमेंट प्रोसेस हो रहा है...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
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

          <button
            onClick={handleCapturePage}
            disabled={processing}
            className={`w-18 h-18 rounded-full border-4 flex items-center justify-center p-1 active:scale-95 transition ${
              hasDetectedDoc ? "border-emerald-400" : "border-white"
            }`}
          >
            <div
              className={`w-full h-full rounded-full transition ${
                hasDetectedDoc ? "bg-emerald-500 hover:bg-emerald-400" : "bg-white"
              }`}
            ></div>
          </button>

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
        </div>
      </div>
    </div>
  );
}
''')

print("EDGE_GRADIENT_ENGINE_DEPLOYED")
