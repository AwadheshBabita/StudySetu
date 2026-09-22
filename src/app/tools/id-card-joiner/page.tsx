"use client";

import { useState, useRef, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

interface Point {
  x: number;
  y: number;
}

interface SideState {
  rawSrc: string | null;
  rotation: number;
  zoom: number;
  brightness: number;
  contrast: number;
  points: [Point, Point, Point, Point] | null;
  lockedCanvas: HTMLCanvasElement | null;
}

export default function IdCardJoinerPage() {
  const [front, setFront] = useState<SideState>({
    rawSrc: null,
    rotation: 0,
    zoom: 1,
    brightness: 0,
    contrast: 0,
    points: null,
    lockedCanvas: null,
  });

  const [back, setBack] = useState<SideState>({
    rawSrc: null,
    rotation: 0,
    zoom: 1,
    brightness: 0,
    contrast: 0,
    points: null,
    lockedCanvas: null,
  });

  const [activeWorkspace, setActiveWorkspace] = useState<"front" | "back" | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // Magnifier Lens
  const [lens, setLens] = useState<{
    show: boolean;
    x: number;
    y: number;
    label: string;
  }>({ show: false, x: 0, y: 0, label: "" });

  // A4 Settings
  const [layoutMode, setLayoutMode] = useState<"side-by-side" | "stack-fold">("side-by-side");
  const [targetKb, setTargetKb] = useState<number>(300);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [procMsg, setProcMsg] = useState<string>("");

  const [downloadJpgUrl, setDownloadJpgUrl] = useState<string | null>(null);
  const [downloadPdfUrl, setDownloadPdfUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const curData = activeWorkspace === "front" ? front : back;
  const setCurData = (updater: (prev: SideState) => SideState) => {
    if (activeWorkspace === "front") setFront(updater);
    else if (activeWorkspace === "back") setBack(updater);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const initial: SideState = {
        rawSrc: src,
        rotation: 0,
        zoom: 1,
        brightness: 0,
        contrast: 0,
        points: null,
        lockedCanvas: null,
      };
      if (side === "front") setFront(initial);
      else setBack(initial);
      setActiveWorkspace(side);
      setDownloadJpgUrl(null);
      setDownloadPdfUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const rotateImage = () => {
    setCurData((p) => ({
      ...p,
      rotation: (p.rotation + 90) % 360,
      points: null,
    }));
  };

  const onImageLoad = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const padX = nw * 0.08;
    const padY = nh * 0.08;

    const defaultPts: [Point, Point, Point, Point] = [
      { x: padX, y: padY },
      { x: nw - padX, y: padY },
      { x: nw - padX, y: nh - padY },
      { x: padX, y: nh - padY },
    ];

    if (!curData.points) {
      setCurData((p) => ({ ...p, points: defaultPts }));
    }
  };

  const updateMagnifier = (imgX: number, imgY: number, screenX: number, screenY: number, idx: number) => {
    const mCanvas = lensCanvasRef.current;
    const img = imgRef.current;
    if (!mCanvas || !img) return;

    const labels = ["ऊपरी बायाँ कोना", "ऊपरी दायाँ कोना", "निचला दायाँ कोना", "निचला बायाँ कोना"];
    setLens({
      show: true,
      x: Math.max(70, Math.min(window.innerWidth - 70, screenX)),
      y: Math.max(90, screenY - 80),
      label: labels[idx],
    });

    const ctx = mCanvas.getContext("2d");
    if (!ctx) return;

    mCanvas.width = 130;
    mCanvas.height = 130;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, 130, 130);

    const zoom = 2.8;
    const sW = 130 / zoom;
    const sH = 130 / zoom;
    const sX = imgX - sW / 2;
    const sY = imgY - sH / 2;

    ctx.drawImage(img, sX, sY, sW, sH, 0, 0, 130, 130);

    // Crosshair target
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(65, 38);
    ctx.lineTo(65, 92);
    ctx.moveTo(38, 65);
    ctx.lineTo(92, 65);
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(65, 65, 3.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerDown = (idx: number) => {
    setDraggingIdx(idx);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (draggingIdx === null || !curData.points || !imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const curImgX = Math.max(0, Math.min(img.naturalWidth, (clientX - rect.left) * scaleX));
    const curImgY = Math.max(0, Math.min(img.naturalHeight, (clientY - rect.top) * scaleY));

    const updated: [Point, Point, Point, Point] = [...curData.points] as [Point, Point, Point, Point];
    updated[draggingIdx] = { x: curImgX, y: curImgY };

    updateMagnifier(curImgX, curImgY, clientX, clientY, draggingIdx);
    setCurData((p) => ({ ...p, points: updated }));
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
    setLens({ show: false, x: 0, y: 0, label: "" });
  };

  // LIGHTWEIGHT FAST CROP (No Browser Crash)
  const warpAndLockCurrentSide = async () => {
    if (!curData.rawSrc || !curData.points) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = rej;
        img.src = curData.rawSrc!;
      });

      // 1. First Pass: Rotation Canvas
      const rCanvas = document.createElement("canvas");
      const is90 = curData.rotation === 90 || curData.rotation === 270;
      rCanvas.width = is90 ? img.height : img.width;
      rCanvas.height = is90 ? img.width : img.height;
      const rCtx = rCanvas.getContext("2d")!;
      rCtx.translate(rCanvas.width / 2, rCanvas.height / 2);
      rCtx.rotate((curData.rotation * Math.PI) / 180);
      rCtx.drawImage(img, -img.width / 2, -img.height / 2);

      // 2. Compute Bounding Box from 4 points
      const pts = curData.points;
      const minX = Math.max(0, Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x));
      const maxX = Math.min(rCanvas.width, Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x));
      const minY = Math.max(0, Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y));
      const maxY = Math.min(rCanvas.height, Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y));

      const srcW = Math.max(10, maxX - minX);
      const srcH = Math.max(10, maxY - minY);

      // 3. Output PVC standard: 1011 x 638 px (85.6mm x 54mm @ 300 DPI)
      const dw = 1011;
      const dh = 638;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = dw;
      finalCanvas.height = dh;
      const fCtx = finalCanvas.getContext("2d")!;

      fCtx.imageSmoothingEnabled = true;
      fCtx.imageSmoothingQuality = "high";
      fCtx.filter = `brightness(${100 + curData.brightness}%) contrast(${100 + curData.contrast}%)`;

      // Fast, lightweight draw
      fCtx.drawImage(rCanvas, minX, minY, srcW, srcH, 0, 0, dw, dh);

      setCurData((p) => ({ ...p, lockedCanvas: finalCanvas }));
      setActiveWorkspace(null);

    } catch (err) {
      console.error(err);
      alert("क्रॉप करने में समस्या आई।");
    } finally {
      setIsProcessing(false);
    }
  };

  // Master A4 Sheet Generator
  const generateFinalA4Sheet = async () => {
    if (!front.lockedCanvas || !back.lockedCanvas) {
      alert("कृपया दोनों साइड्स (फ़्रंट व बैक) को पहले क्रॉप करके लॉक करें!");
      return;
    }
    setIsProcessing(true);
    setProcMsg("सटीक KB और A4 शीट तैयार हो रही है...");

    try {
      const cardW_base = 1011;
      const cardH_base = 638;
      const radius_base = 24;
      const targetBytes = targetKb * 1024;

      // 1. Determine optimal canvas dimension for the target KB
      // If target is very low (e.g. 10-80 KB), scale dimension proportionally so JPEG can hit under targetKb
      let scale = 1.0;
      if (targetKb < 40) {
        scale = 0.45; // lightweight resolution for strict low KB
      } else if (targetKb < 90) {
        scale = 0.65;
      } else if (targetKb < 160) {
        scale = 0.85;
      } else {
        scale = 1.0;  // 100% full 300 DPI Ultra HD
      }

      const a4W = Math.round(2480 * scale);
      const a4H = Math.round(3508 * scale);
      const cardW = Math.round(cardW_base * scale);
      const cardH = Math.round(cardH_base * scale);
      const radius = Math.round(radius_base * scale);

      const a4 = document.createElement("canvas");
      a4.width = a4W;
      a4.height = a4H;
      const ctx = a4.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, a4W, a4H);

      const drawSmartCard = (c: HTMLCanvasElement, x: number, y: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, radius);
        ctx.clip();
        ctx.drawImage(c, x, y, cardW, cardH);
        ctx.restore();

        // Guideline
        ctx.save();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = Math.max(1, Math.round(2 * scale));
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, radius);
        ctx.stroke();
        ctx.restore();
      };

      if (layoutMode === "side-by-side") {
        const gap = Math.round(120 * scale);
        const startX = (a4W - (cardW * 2 + gap)) / 2;
        const startY = Math.round(320 * scale);
        drawSmartCard(front.lockedCanvas, startX, startY);
        drawSmartCard(back.lockedCanvas, startX + cardW + gap, startY);

        ctx.save();
        ctx.strokeStyle = "#e2e8f0";
        ctx.setLineDash([Math.round(12 * scale), Math.round(12 * scale)]);
        ctx.beginPath();
        ctx.moveTo(startX + cardW + gap / 2, startY - 20 * scale);
        ctx.lineTo(startX + cardW + gap / 2, startY + cardH + 20 * scale);
        ctx.stroke();
        ctx.restore();
      } else {
        const startX = (a4W - cardW) / 2;
        const startY = Math.round(320 * scale);
        drawSmartCard(front.lockedCanvas, startX, startY);
        drawSmartCard(back.lockedCanvas, startX, startY + cardH + Math.round(10 * scale));

        ctx.save();
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([Math.round(8 * scale), Math.round(8 * scale)]);
        ctx.lineWidth = Math.max(1, Math.round(2 * scale));
        ctx.beginPath();
        ctx.moveTo(startX - 20 * scale, startY + cardH + 5 * scale);
        ctx.lineTo(startX + cardW + 20 * scale, startY + cardH + 5 * scale);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Binary search for EXACT byte size match
      setProcMsg(`टारगेट ${targetKb} KB में लॉक हो रहा है...`);
      let qLow = 0.02;
      let qHigh = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 8; i++) {
        const qMid = (qLow + qHigh) / 2;
        const b: Blob = await new Promise((res) => {
          a4.toBlob((blob) => res(blob!), "image/jpeg", qMid);
        });
        if (b.size <= targetBytes) {
          bestBlob = b;
          qLow = qMid; // try to get closer to target
        } else {
          qHigh = qMid; // file too big, lower quality
        }
      }

      // Fallback safeguard if even lowest quality exceeded
      if (!bestBlob) {
        bestBlob = await new Promise((res) => {
          a4.toBlob((blob) => res(blob!), "image/jpeg", 0.02);
        });
      }

      const sizeKb = Math.round(bestBlob!.size / 1024);
      setOutputSizeKb(sizeKb);
      if (downloadJpgUrl) URL.revokeObjectURL(downloadJpgUrl);
      setDownloadJpgUrl(URL.createObjectURL(bestBlob!));

      // PDF: Standard ISO A4 Dimensions (Always standard 100% scale)
      setProcMsg("A4 PDF बन रही है...");
      const pdfDoc = await PDFDocument.create();
      const jpgBytes = await bestBlob!.arrayBuffer();
      const embJpg = await pdfDoc.embedJpg(jpgBytes);
      const pdfPage = pdfDoc.addPage([595.28, 841.89]);
      pdfPage.drawImage(embJpg, {
        x: 0,
        y: 0,
        width: 595.28,
        height: 841.89,
      });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      if (downloadPdfUrl) URL.revokeObjectURL(downloadPdfUrl);
      setDownloadPdfUrl(URL.createObjectURL(pdfBlob));

    } catch (e) {
      console.error(e);
      alert("शीट बनाने में समस्या आई!");
    } finally {
      setIsProcessing(false);
      setProcMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 py-8 px-4 sm:px-6 select-none">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs px-3 py-1 rounded-full font-bold border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            300 DPI Ultra HD PVC • सुपर-फास्ट नो-क्रैश इंजन
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ID Card Both Side Joiner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            फ़्रंट व बैक को अलग-अलग क्रॉप व साफ़ करें और A4 शीट पर 1-क्लिक में प्रिंट पाएँ
          </p>
        </div>

        {/* 1. DUAL FILE UPLOAD ICONS */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-3xl border text-center transition space-y-3 ${
            front.lockedCanvas ? "bg-emerald-50/60 border-emerald-300" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1. कार्ड फ़्रंट (Front)</span>
              {front.lockedCanvas && (
                <button
                  type="button"
                  onClick={() => setActiveWorkspace("front")}
                  className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200"
                >
                  ✏️ एडिट
                </button>
              )}
            </div>

            <label className="block border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-4 cursor-pointer bg-slate-50/50 transition">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "front")} className="sr-only" />
              <div className="space-y-1">
                <span className="text-2xl block">{front.lockedCanvas ? "✅" : "🪪"}</span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {front.lockedCanvas ? "फ़्रंट क्रॉप हो चुका है" : (front.rawSrc ? "फ़्रंट री-अपलोड" : "फ़्रंट अपलोड करें")}
                </span>
              </div>
            </label>
          </div>

          <div className={`p-4 rounded-3xl border text-center transition space-y-3 ${
            back.lockedCanvas ? "bg-emerald-50/60 border-emerald-300" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">2. कार्ड बैक (Back)</span>
              {back.lockedCanvas && (
                <button
                  type="button"
                  onClick={() => setActiveWorkspace("back")}
                  className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200"
                >
                  ✏️ एडिट
                </button>
              )}
            </div>

            <label className="block border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-4 cursor-pointer bg-slate-50/50 transition">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "back")} className="sr-only" />
              <div className="space-y-1">
                <span className="text-2xl block">{back.lockedCanvas ? "✅" : "🪪"}</span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {back.lockedCanvas ? "बैक क्रॉप हो चुका है" : (back.rawSrc ? "बैक री-अपलोड" : "बैक अपलोड करें")}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* 2. CROPPING WORKSPACE */}
        {activeWorkspace && curData.rawSrc && (
          <div className="bg-white p-5 rounded-3xl border-2 border-rose-500 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {activeWorkspace === "front" ? "फ़्रंट साइड क्रॉप व एडजस्टमेंट" : "बैक साइड क्रॉप व एडजस्टमेंट"}
                </h3>
                <p className="text-[11px] text-slate-400">कोनों को बैठाएँ और ब्राइटनेस सेट करें</p>
              </div>
              <button
                type="button"
                onClick={rotateImage}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
              >
                🔄 90° घुमाएँ
              </button>
            </div>

            {/* 4 Corners with Magnifier */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center min-h-[280px] touch-none"
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={curData.rawSrc}
                alt="Card"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${curData.rotation}deg) scale(${curData.zoom})`,
                  filter: `brightness(${100 + curData.brightness}%) contrast(${100 + curData.contrast}%)`,
                }}
                className="max-h-[360px] w-auto object-contain pointer-events-none transition-transform"
              />

              {curData.points && imgRef.current && (() => {
                const img = imgRef.current;
                const rect = img.getBoundingClientRect();
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (!containerRect) return null;

                const offX = rect.left - containerRect.left;
                const offY = rect.top - containerRect.top;
                const sx = rect.width / img.naturalWidth;
                const sy = rect.height / img.naturalHeight;

                const screenPts = curData.points.map((p) => ({
                  x: offX + p.x * sx,
                  y: offY + p.y * sy,
                }));

                const polyD = `M ${screenPts[0].x} ${screenPts[0].y} L ${screenPts[1].x} ${screenPts[1].y} L ${screenPts[2].x} ${screenPts[2].y} L ${screenPts[3].x} ${screenPts[3].y} Z`;

                return (
                  <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      <path d={polyD} fill="rgba(225, 29, 72, 0.15)" stroke="#e11d48" strokeWidth="2" strokeDasharray="6 4" />
                    </svg>

                    {screenPts.map((pt, idx) => (
                      <div
                        key={idx}
                        style={{ left: `${pt.x - 14}px`, top: `${pt.y - 14}px` }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown(idx);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handlePointerDown(idx);
                        }}
                        className="absolute z-20 w-7 h-7 rounded-full bg-white border-2 border-rose-600 shadow-xl cursor-crosshair active:scale-125 transition-transform flex items-center justify-center"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      </div>
                    ))}
                  </>
                );
              })()}

              {/* Magnifier Lens */}
              <div
                style={{
                  display: lens.show ? "block" : "none",
                  left: `${lens.x - 65}px`,
                  top: `${lens.y - 65}px`,
                }}
                className="fixed pointer-events-none z-50 rounded-full border-4 border-rose-500 bg-white shadow-2xl overflow-hidden"
              >
                <canvas ref={lensCanvasRef} className="w-[130px] h-[130px]" />
                <div className="absolute bottom-1 w-full text-center text-[9px] font-bold text-rose-700 bg-white/90 py-0.5">
                  {lens.label}
                </div>
              </div>
            </div>

            {/* Zoom, Brightness, Contrast */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>🔍 ज़ूम (Zoom): {curData.zoom.toFixed(1)}x</span>
                  <button type="button" onClick={() => setCurData((p) => ({ ...p, zoom: 1 }))} className="text-[10px] text-rose-600">रीसेट</button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={curData.zoom}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCurData((p) => ({ ...p, zoom: v }));
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>☀️ ब्राइटनेस</span>
                    <span>{curData.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={curData.brightness}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCurData((p) => ({ ...p, brightness: v }));
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>🌓 कंट्रास्ट</span>
                    <span>{curData.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={curData.contrast}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCurData((p) => ({ ...p, contrast: v }));
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              </div>
            </div>

            {/* Fast Crop Button */}
            <button
              type="button"
              onClick={warpAndLockCurrentSide}
              disabled={isProcessing}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isProcessing ? "क्रॉप हो रहा है..." : `✅ ${activeWorkspace === "front" ? "फ़्रंट" : "बैक"} क्रॉप करें और A4 शीट में सेट करें`}
            </button>
          </div>
        )}

        {/* 3. A4 PREVIEW */}
        {(front.lockedCanvas || back.lockedCanvas) && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">A4 प्रिंट शीट लाइव प्रीव्यू</h3>
                <p className="text-[11px] text-slate-400">300 DPI स्टैंडर्ड 85.6mm x 54mm PVC साइज़</p>
              </div>
              <div className="flex gap-1.5 text-[11px] font-bold">
                <span className={front.lockedCanvas ? "text-emerald-600" : "text-slate-400"}>
                  {front.lockedCanvas ? "✓ फ़्रंट सेट" : "○ फ़्रंट बाक़ी"}
                </span>
                <span>•</span>
                <span className={back.lockedCanvas ? "text-emerald-600" : "text-slate-400"}>
                  {back.lockedCanvas ? "✓ बैक सेट" : "○ बैक बाक़ी"}
                </span>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-200 min-h-[220px]">
              <div className={`w-full max-w-[340px] bg-white rounded-lg shadow-md p-3 border border-slate-300 ${
                layoutMode === "side-by-side" ? "flex gap-2 justify-center" : "flex flex-col gap-1.5 items-center"
              }`}>
                <div className="w-[140px] h-[88px] rounded border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                  {front.lockedCanvas ? (
                    <img src={front.lockedCanvas.toDataURL()} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">फ़्रंट यहाँ आएगा</span>
                  )}
                </div>

                <div className="w-[140px] h-[88px] rounded border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                  {back.lockedCanvas ? (
                    <img src={back.lockedCanvas.toDataURL()} alt="Back" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">बैक यहाँ आएगा</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode("side-by-side")}
                className={`py-2 px-3 rounded-xl border text-center transition ${
                  layoutMode === "side-by-side"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <span className="text-xs font-bold block">साइड-बाय-साइड</span>
                <span className={`text-[9px] ${layoutMode === "side-by-side" ? "text-rose-100" : "text-slate-400"}`}>
                  काटकर चिपकाने हेतु
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode("stack-fold")}
                className={`py-2 px-3 rounded-xl border text-center transition ${
                  layoutMode === "stack-fold"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <span className="text-xs font-bold block">सेंटर-फ़ोल्ड</span>
                <span className={`text-[9px] ${layoutMode === "stack-fold" ? "text-rose-100" : "text-slate-400"}`}>
                  मोड़कर लेमिनेशन हेतु
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 4. TARGET KB & DOWNLOAD */}
        {front.lockedCanvas && back.lockedCanvas && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  टारगेट फ़ाइल साइज़ (10 KB - 500 KB)
                </label>
                <span className="text-[11px] text-slate-400">
                  500 KB पर 300 DPI अल्ट्रा क्लियर प्रिंट
                </span>
              </div>

              <div className="flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Math.max(10, Math.min(500, Number(e.target.value))))}
                  className="w-12 bg-transparent text-right font-mono font-black text-rose-600 text-sm focus:outline-none"
                />
                <span className="text-xs font-bold text-rose-600">KB</span>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>10 KB</span>
              <span>150 KB</span>
              <span>300 KB</span>
              <span>500 KB</span>
            </div>

            <button
              type="button"
              onClick={generateFinalA4Sheet}
              disabled={isProcessing}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{procMsg || "शीट तैयार हो रही है..."}</span>
                </span>
              ) : (
                <span>🖨️ A4 शीट तैयार करें ({targetKb} KB लक्ष्य)</span>
              )}
            </button>

            {(downloadJpgUrl || downloadPdfUrl) && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">तैयार फ़ाइल:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs font-black">
                    {outputSizeKb} KB
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {downloadPdfUrl && (
                    <a
                      href={downloadPdfUrl}
                      download={`PVC-Card-A4-${outputSizeKb}kb.pdf`}
                      className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      📄 डाउनलोड A4 PDF (100% प्रिंट स्केल)
                    </a>
                  )}
                  {downloadJpgUrl && (
                    <a
                      href={downloadJpgUrl}
                      download={`PVC-Card-Sheet-${outputSizeKb}kb.jpg`}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      🖼️ डाउनलोड Ultra HD JPG ({outputSizeKb} KB)
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
