with open("src/app/tools/cam-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";

interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
}

declare global {
  interface Window {
    cv: any;
  }
}

export default function CamDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const detectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);

  const [isOpenCvReady, setIsOpenCvReady] = useState<boolean>(false);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<"camera" | "crop">("camera");
  const [capturedImgSrc, setCapturedImgSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 मुख्य कोने (लाइव वीडियो के 0-100% में)
  const [cornersPct, setCornersPct] = useState<Point[]>([
    { x: 20, y: 25 },
    { x: 80, y: 25 },
    { x: 80, y: 75 },
    { x: 20, y: 75 }
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

  // 2. OpenCV.js लाइव डिटेक्शन पाइपलाइन
  const processFrameWithOpenCV = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !window.cv || !window.cv.Mat) {
      animFrameRef.current = requestAnimationFrame(processFrameWithOpenCV);
      return;
    }

    const cv = window.cv;
    const procW = 240;
    const procH = 320;

    if (!detectCanvasRef.current) {
      detectCanvasRef.current = document.createElement("canvas");
      detectCanvasRef.current.width = procW;
      detectCanvasRef.current.height = procH;
    }

    const c = detectCanvasRef.current;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, procW, procH);

    try {
      const src = cv.imread(c);
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const edges = new cv.Mat();
      const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
      const closed = new cv.Mat();
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      // Step 1: ग्रेस्केल
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

      // Step 2: गॉसियन ब्लर (चादर/दीवार के खुरदरेपन को मिटाना)
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

      // Step 3: कैनी एज डिटेक्शन
      cv.Canny(blurred, edges, 50, 150);

      // Step 4: मॉर्फोलॉजिकल क्लोज (टूटे हुए किनारों को जोड़ना)
      cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel);

      // Step 5: क्लोज्ड लूप कंटूर्स खोजना
      cv.findContours(closed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      let maxScore = -1;
      let bestQuad: Point[] | null = null;
      const frameArea = procW * procH;

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);

        // फ्रेम के 4% से बड़ा और 92% से छोटा होना चाहिए
        if (area < frameArea * 0.04 || area > frameArea * 0.92) {
          cnt.delete();
          continue;
        }

        const perimeter = cv.arcLength(cnt, true);
        const approx = new cv.Mat();
        // Douglas-Peucker पॉलीगॉन सिम्प्लीफिकेशन
        cv.approxPolyDP(cnt, approx, 0.025 * perimeter, true);

        // यदि 4 कोने मिले और आकृति उत्तल (Convex) है
        if (approx.rows === 4 && cv.isContourConvex(approx)) {
          const pts: Point[] = [];
          for (let j = 0; j < 4; j++) {
            pts.push({
              x: approx.data32S[j * 2],
              y: approx.data32S[j * 2 + 1]
            });
          }

          // आस्पेक्ट रेशियो व स्कोरिंग फॉर्मूला
          const w1 = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          const w2 = Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y);
          const h1 = Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y);
          const h2 = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);

          const avgW = (w1 + w2) / 2;
          const avgH = (h1 + h2) / 2;
          const ratio = Math.max(avgW, avgH) / (Math.min(avgW, avgH) || 1);

          // दस्तावेज/आईडी कार्ड स्कोर (1.2 से 1.8 अनुपात के पास अधिकतम स्कोर)
          const ratioFit = 1 - Math.min(1, Math.abs(ratio - 1.45) / 1.45);
          const areaScore = area / frameArea;
          const candidateScore = ratioFit * 0.6 + areaScore * 0.4;

          if (candidateScore > maxScore) {
            maxScore = candidateScore;
            // कोनों को व्यवस्थित करना: TL, TR, BR, BL
            pts.sort((a, b) => a.y - b.y);
            const topPts = pts.slice(0, 2).sort((a, b) => a.x - b.x);
            const botPts = pts.slice(2, 4).sort((a, b) => b.x - a.x);
            bestQuad = [topPts[0], topPts[1], botPts[0], botPts[1]];
          }
        }
        approx.delete();
        cnt.delete();
      }

      if (bestQuad && maxScore > 0.28) {
        setHasDocLocked(true);
        // टेम्पोरल स्मूथिंग (Lerp)
        setCornersPct((prev) => {
          const t: Point[] = bestQuad!.map((p) => ({
            x: (p.x / procW) * 100,
            y: (p.y / procH) * 100
          }));
          return [
            { x: prev[0].x * 0.6 + t[0].x * 0.4, y: prev[0].y * 0.6 + t[0].y * 0.4 },
            { x: prev[1].x * 0.6 + t[1].x * 0.4, y: prev[1].y * 0.6 + t[1].y * 0.4 },
            { x: prev[2].x * 0.6 + t[2].x * 0.4, y: prev[2].y * 0.4 + t[2].y * 0.4 },
            { x: prev[3].x * 0.6 + t[3].x * 0.4, y: prev[3].y * 0.6 + t[3].y * 0.4 }
          ];
        });
      } else {
        setHasDocLocked(false);
      }

      // मेमोरी क्लीनअप
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      kernel.delete();
      closed.delete();
      contours.delete();
      hierarchy.delete();
    } catch (e) {
      // फ्रेम स्किप
    }

    animFrameRef.current = requestAnimationFrame(processFrameWithOpenCV);
  }, []);

  useEffect(() => {
    if (cameraActive && isOpenCvReady && viewState === "camera") {
      animFrameRef.current = requestAnimationFrame(processFrameWithOpenCV);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, isOpenCvReady, viewState, processFrameWithOpenCV]);

  // 3. फोटो कैप्चर और 8-हैंडल फाइन ट्यून स्क्रीन
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

    // डिटेक्ट किए गए कोनों को फुल-इमेज पिक्सेल में बदलना
    const pxCorners = cornersPct.map((p) => ({
      x: (p.x / 100) * vw,
      y: (p.y / 100) * vh
    }));
    setCropCorners(pxCorners);
    setViewState("crop");
  };

  // 8 हैंडल्स (4 कोने + 4 साइड्स के मध्य बिंदु)
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

  // 4. होमोग्राफी पर्सपेक्टिव ट्रांसफ़ॉर्म + ऑटो-एनहांस
  const handleApplyTransformAndContinue = async () => {
    if (!capturedImgSrc || !window.cv) return;
    setProcessing(true);

    try {
      const cv = window.cv;
      const img = new Image();
      img.src = capturedImgSrc;
      await new Promise((res) => { img.onload = res; });

      const inCanvas = document.createElement("canvas");
      inCanvas.width = imgDim.w;
      inCanvas.height = imgDim.h;
      const iCtx = inCanvas.getContext("2d");
      if (!iCtx) return;
      iCtx.drawImage(img, 0, 0);

      const srcMat = cv.imread(inCanvas);

      const pts = cropCorners;
      const w1 = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const w2 = Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y);
      const h1 = Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y);
      const h2 = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);

      const outW = Math.round(Math.max(w1, w2));
      const outH = Math.round(Math.max(h1, h2));

      // होमोग्राफी (3x3 पर्सपेक्टिव मैट्रिक्स)
      const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
        pts[0].x, pts[0].y,
        pts[1].x, pts[1].y,
        pts[2].x, pts[2].y,
        pts[3].x, pts[3].y
      ]);

      const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        outW, 0,
        outW, outH,
        0, outH
      ]);

      const M = cv.getPerspectiveTransform(srcCoords, dstCoords);
      const warpedMat = new cv.Mat();
      const dsize = new cv.Size(outW, outH);
      cv.warpPerspective(srcMat, warpedMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      cv.imshow(outCanvas, warpedMat);

      // टोनल कर्व (क्लीन वाइट बैकग्राउंड + गहरा टेक्स्ट)
      const oCtx = outCanvas.getContext("2d");
      if (oCtx) {
        const idata = oCtx.getImageData(0, 0, outW, outH);
        const d = idata.data;
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
        oCtx.putImageData(idata, 0, 0);
      }

      // A4 शीट में केंद्र पर फिट करना
      const a4Canvas = document.createElement("canvas");
      a4Canvas.width = 1240;
      a4Canvas.height = 1754;
      const aCtx = a4Canvas.getContext("2d");
      if (aCtx) {
        aCtx.fillStyle = "#ffffff";
        aCtx.fillRect(0, 0, 1240, 1754);
        const scale = Math.min(1160 / outW, 1670 / outH);
        const fw = outW * scale;
        const fh = outH * scale;
        aCtx.drawImage(outCanvas, (1240 - fw) / 2, (1754 - fh) / 2, fw, fh);
      }

      setPages((prev) => [...prev, { id: Date.now().toString(), dataUrl: a4Canvas.toDataURL("image/jpeg", 0.92) }]);

      // मेमोरी मुक्त करना
      srcMat.delete();
      srcCoords.delete();
      dstCoords.delete();
      M.delete();
      warpedMat.delete();

      setCapturedImgSrc(null);
      setViewState("camera");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // 5. कंबाइंड PDF एक्सपोर्ट
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
      {/* OpenCV.js WebAssembly स्क्रिप्ट लोड */}
      <Script
        src="https://docs.opencv.org/4.8.0/opencv.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.cv) {
            window.cv.onRuntimeInitialized = () => setIsOpenCvReady(true);
            // कुछ ब्राउज़रों में यह तुरंत तैयार होता है
            if (window.cv.Mat) setIsOpenCvReady(true);
          }
        }}
      />

      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500 text-black text-[11px] font-black px-2 py-0.5 rounded">CV ENGINE</span>
          <h1 className="text-sm font-bold text-white">OpenScan Classical Scanner</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOpenCvReady ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400"}`}>
            {isOpenCvReady ? "OpenCV Ready" : "Loading Engine..."}
          </span>
          <Link href="/tools/document-scanner" className="text-xs text-slate-400 hover:text-white">
            मुख्य मेनू
          </Link>
        </div>
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

              {/* हेयरलाइन लाइव बाउंड्री (सटीक 1px पतली लाइन) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {hasDocLocked && (
                  <>
                    <path
                      d={livePathD}
                      fill="rgba(16, 185, 129, 0.16)"
                      stroke="#10b981"
                      strokeWidth="0.8"
                      strokeLinejoin="round"
                    />
                    {cornersPct.map((c, i) => (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r="1.4"
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
                  {hasDocLocked ? "✓ दस्तावेज़ लॉक हुआ (शटर दबाएं)" : "दस्तावेज़ की ओर कैमरा रखें..."}
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
                <span className="text-xs font-bold text-emerald-300">होमोग्राफी व टोनल सीधा हो रहा है...</span>
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

print("OPENCV_ENGINE_PAGE_DEPLOYED")
