"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent, TouchEvent } from "react";
import { PDFDocument } from "pdf-lib";

interface Point {
  x: number;
  y: number;
}

interface SideData {
  src: string | null;
  rotation: number;
  points: [Point, Point, Point, Point] | null; // 0: TL, 1: TR, 2: BR, 3: BL
  canvas: HTMLCanvasElement | null;
  brightness: number;
  contrast: number;
}

export default function IdCardJoinerPage() {
  const [front, setFront] = useState<SideData>({
    src: null,
    rotation: 0,
    points: null,
    canvas: null,
    brightness: 0,
    contrast: 0,
  });

  const [back, setBack] = useState<SideData>({
    src: null,
    rotation: 0,
    points: null,
    canvas: null,
    brightness: 0,
    contrast: 0,
  });

  const [activeTab, setActiveTab] = useState<"front" | "back">("front");
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // Magnifying Lens
  const [lens, setLens] = useState<{
    show: boolean;
    x: number;
    y: number;
    label: string;
  }>({ show: false, x: 0, y: 0, label: "" });

  // Output Controls
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

  const curData = activeTab === "front" ? front : back;
  const setCurData = (updater: (prev: SideData) => SideData) => {
    if (activeTab === "front") setFront(updater);
    else setBack(updater);
  };

  // Upload handler
  const handleUpload = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const initial: SideData = {
        src,
        rotation: 0,
        points: null,
        canvas: null,
        brightness: 0,
        contrast: 0,
      };
      if (side === "front") setFront(initial);
      else setBack(initial);
      setActiveTab(side);
      setDownloadJpgUrl(null);
      setDownloadPdfUrl(null);
      setOutputSizeKb(null);
    };
    reader.readAsDataURL(file);
  };

  // Rotate 90
  const rotateImage = () => {
    setCurData((p) => ({
      ...p,
      rotation: (p.rotation + 90) % 360,
      points: null,
      canvas: null,
    }));
  };

  // Default points when image loads
  const onImgLoad = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const padX = nw * 0.08;
    const padY = nh * 0.08;

    const defaultPoints: [Point, Point, Point, Point] = [
      { x: padX, y: padY },           // TL
      { x: nw - padX, y: padY },      // TR
      { x: nw - padX, y: nh - padY }, // BR
      { x: padX, y: nh - padY },      // BL
    ];

    if (!curData.points) {
      setCurData((p) => ({ ...p, points: defaultPoints }));
    }
  };

  // Magnifier rendering
  const renderMagnifier = (imgX: number, imgY: number, screenX: number, screenY: number, idx: number) => {
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

    // Crosshair Target
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

  // Dragging individual free corner
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

    renderMagnifier(curImgX, curImgY, clientX, clientY, draggingIdx);
    setCurData((p) => ({ ...p, points: updated }));
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
    setLens({ show: false, x: 0, y: 0, label: "" });
  };

  // Perspective Warp Engine
  const warpPerspective = async (side: SideData): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const rCanvas = document.createElement("canvas");
        const is90 = side.rotation === 90 || side.rotation === 270;
        rCanvas.width = is90 ? img.height : img.width;
        rCanvas.height = is90 ? img.width : img.height;
        const rCtx = rCanvas.getContext("2d")!;
        rCtx.translate(rCanvas.width / 2, rCanvas.height / 2);
        rCtx.rotate((side.rotation * Math.PI) / 180);
        rCtx.drawImage(img, -img.width / 2, -img.height / 2);

        // Standard 300 DPI PVC Smart Card: 1011 x 638 px (85.6mm x 54mm)
        const dw = 1011;
        const dh = 638;
        const out = document.createElement("canvas");
        out.width = dw;
        out.height = dh;
        const oCtx = out.getContext("2d")!;

        const pts = side.points || [
          { x: 0, y: 0 },
          { x: rCanvas.width, y: 0 },
          { x: rCanvas.width, y: rCanvas.height },
          { x: 0, y: rCanvas.height },
        ];

        const [p0, p1, p2, p3] = pts;
        const n = 16;

        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const u0 = x / n;
            const u1 = (x + 1) / n;
            const v0 = y / n;
            const v1 = (y + 1) / n;

            const getPt = (u: number, v: number): Point => {
              const tx = p0.x + (p1.x - p0.x) * u;
              const ty = p0.y + (p1.y - p0.y) * u;
              const bx = p3.x + (p2.x - p3.x) * u;
              const by = p3.y + (p2.y - p3.y) * u;
              return { x: tx + (bx - tx) * v, y: ty + (by - ty) * v };
            };

            const sA = getPt(u0, v0);
            const sB = getPt(u1, v0);
            const sC = getPt(u0, v1);
            const sD = getPt(u1, v1);

            const dx0 = u0 * dw;
            const dx1 = u1 * dw;
            const dy0 = v0 * dh;
            const dy1 = v1 * dh;

            drawTri(oCtx, rCanvas, sA, sB, sC, { x: dx0, y: dy0 }, { x: dx1, y: dy0 }, { x: dx0, y: dy1 });
            drawTri(oCtx, rCanvas, sB, sD, sC, { x: dx1, y: dy0 }, { x: dx1, y: dy1 }, { x: dx0, y: dy1 });
          }
        }
        resolve(out);
      };
      img.src = side.src!;
    });
  };

  const drawTri = (
    ctx: CanvasRenderingContext2D,
    img: HTMLCanvasElement,
    s0: Point, s1: Point, s2: Point,
    d0: Point, d1: Point, d2: Point
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d0.x, d0.y);
    ctx.lineTo(d1.x, d1.y);
    ctx.lineTo(d2.x, d2.y);
    ctx.closePath();
    ctx.clip();

    const denom = s0.x * (s2.y - s1.y) - s1.x * s2.y + s2.x * s1.y + (s1.x - s2.x) * s0.y;
    if (Math.abs(denom) > 0.0001) {
      const m11 = -(s0.y * (d2.x - d1.x) - s1.y * d2.x + s2.y * d1.x + (s1.y - s2.y) * d0.x) / denom;
      const m12 = (s0.y * d2.y + s1.y * (d0.y - d2.y) - s2.y * d0.y + (s2.y - s1.y) * d1.y) / denom;
      const m21 = (s0.x * (d2.x - d1.x) - s1.x * d2.x + s2.x * d1.x + (s1.x - s2.x) * d0.x) / denom;
      const m22 = -(s0.x * d2.y + s1.x * (d0.y - d2.y) - s2.x * d0.y + (s2.x - s1.x) * d1.y) / denom;
      const dx = (s0.x * (s2.y * d1.x - s1.y * d2.x) + s0.y * (s1.x * d2.x - s2.x * d1.x) + (s2.x * s1.y - s1.x * s2.y) * d0.x) / denom;
      const dy = (s0.x * (s2.y * d1.y - s1.y * d2.y) + s0.y * (s1.x * d2.y - s2.x * d1.y) + (s2.x * s1.y - s1.x * s2.y) * d0.y) / denom;
      ctx.transform(m11, m12, m21, m22, dx, dy);
      ctx.drawImage(img, 0, 0);
    }
    ctx.restore();
  };

  // Generate Master Output
  const generateJoinedSheet = async () => {
    if (!front.src || !back.src) {
      alert("कृपया कार्ड के दोनों साइड (Front व Back) अपलोड करें!");
      return;
    }
    setIsProcessing(true);
    setProcMsg("कार्ड को सीधा व एनहांस किया जा रहा है...");

    try {
      const [fCanvas, bCanvas] = await Promise.all([
        warpPerspective(front),
        warpPerspective(back),
      ]);

      const applyFilters = (c: HTMLCanvasElement, br: number, ct: number): HTMLCanvasElement => {
        const out = document.createElement("canvas");
        out.width = c.width;
        out.height = c.height;
        const ctx = out.getContext("2d")!;
        ctx.filter = `brightness(${100 + br}%) contrast(${100 + ct}%)`;
        ctx.drawImage(c, 0, 0);
        return out;
      };

      const finalF = applyFilters(fCanvas, front.brightness, front.contrast);
      const finalB = applyFilters(bCanvas, back.brightness, back.contrast);

      // A4 Master Canvas: 2480 x 3508 px (300 DPI)
      const a4 = document.createElement("canvas");
      a4.width = 2480;
      a4.height = 3508;
      const ctx = a4.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 2480, 3508);

      const cardW = 1011;
      const cardH = 638;
      const radius = 24;

      const drawPVC = (c: HTMLCanvasElement, x: number, y: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, radius);
        ctx.clip();
        ctx.drawImage(c, x, y, cardW, cardH);
        ctx.restore();

        // 1px Cutting line
        ctx.save();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, radius);
        ctx.stroke();
        ctx.restore();
      };

      if (layoutMode === "side-by-side") {
        const gap = 120;
        const startX = (2480 - (cardW * 2 + gap)) / 2;
        const startY = 320;
        drawPVC(finalF, startX, startY);
        drawPVC(finalB, startX + cardW + gap, startY);

        ctx.save();
        ctx.strokeStyle = "#e2e8f0";
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(startX + cardW + gap / 2, startY - 30);
        ctx.lineTo(startX + cardW + gap / 2, startY + cardH + 30);
        ctx.stroke();
        ctx.restore();
      } else {
        const startX = (2480 - cardW) / 2;
        const startY = 320;
        drawPVC(finalF, startX, startY);
        drawPVC(finalB, startX, startY + cardH + 10);

        ctx.save();
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX - 25, startY + cardH + 5);
        ctx.lineTo(startX + cardW + 25, startY + cardH + 5);
        ctx.stroke();
        ctx.restore();
      }

      // Exact KB Lock Loop (10 to 500 KB)
      setProcMsg(`टारगेट ${targetKb} KB में प्रोसेस हो रहा है...`);
      const targetBytes = targetKb * 1024;
      let qLow = 0.05;
      let qHigh = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 6; i++) {
        const qMid = (qLow + qHigh) / 2;
        const b: Blob = await new Promise((res) => {
          a4.toBlob((blob) => res(blob!), "image/jpeg", qMid);
        });
        if (b.size <= targetBytes) {
          bestBlob = b;
          qLow = qMid;
        } else {
          qHigh = qMid;
        }
      }

      if (!bestBlob) {
        bestBlob = await new Promise((res) => {
          a4.toBlob((blob) => res(blob!), "image/jpeg", 0.08);
        });
      }

      const sizeKb = Math.round(bestBlob!.size / 1024);
      setOutputSizeKb(sizeKb);
      if (downloadJpgUrl) URL.revokeObjectURL(downloadJpgUrl);
      setDownloadJpgUrl(URL.createObjectURL(bestBlob!));

      // 100% Scale ISO A4 PDF
      setProcMsg("A4 PDF तैयार हो रही है...");
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

    } catch (err) {
      console.error(err);
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
            सर्टिफिकेट-स्टाइल 4-कॉर्नर लेंस • 300 DPI Ultra HD PVC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ID Card Both Side Joiner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            चारों कोनों को पूरी आज़ादी से सेट करें, ब्राइटनेस सुधारें और सटीक KB में प्रिंट शीट पाएँ
          </p>
        </div>

        {/* Dual Upload */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-700 block">1. कार्ड फ़्रंट</span>
            <label className="block border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-3 cursor-pointer bg-slate-50/50">
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "front")} className="sr-only" />
              <span className="text-xs font-semibold text-slate-600 block truncate">
                {front.src ? "✅ फ़्रंट अपलोड है" : "➕ फ़्रंट अपलोड"}
              </span>
            </label>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-700 block">2. कार्ड बैक</span>
            <label className="block border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-3 cursor-pointer bg-slate-50/50">
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "back")} className="sr-only" />
              <span className="text-xs font-semibold text-slate-600 block truncate">
                {back.src ? "✅ बैक अपलोड है" : "➕ बैक अपलोड"}
              </span>
            </label>
          </div>
        </div>

        {/* Workspace Card */}
        {(front.src || back.src) && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Tab & Rotate Tools */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("front")}
                  disabled={!front.src}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    activeTab === "front"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 disabled:opacity-40"
                  }`}
                >
                  फ़्रंट साइड
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("back")}
                  disabled={!back.src}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    activeTab === "back"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 disabled:opacity-40"
                  }`}
                >
                  बैक साइड
                </button>
              </div>

              {curData.src && (
                <button
                  type="button"
                  onClick={rotateImage}
                  className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition"
                >
                  🔄 90° घुमाएँ
                </button>
              )}
            </div>

            {/* 4-Corner Canvas with Floating Magnifying Glass */}
            {curData.src && (
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
                  src={curData.src}
                  alt="Card Work"
                  onLoad={onImgLoad}
                  style={{
                    transform: `rotate(${curData.rotation}deg)`,
                    filter: `brightness(${100 + curData.brightness}%) contrast(${100 + curData.contrast}%)`,
                  }}
                  className="max-h-[360px] w-auto object-contain pointer-events-none transition-transform"
                />

                {/* Free Poly Overlay & 4 Corner Grips */}
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

                {/* Magnifier */}
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
            )}

            {/* Brightness & Contrast Adjustments */}
            {curData.src && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>चमक (Brightness)</span>
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
                      className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-rose-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>गहरापन (Contrast)</span>
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
                      className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-rose-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target KB & Sheet Settings */}
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

            <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              <input
                type="number"
                min="10"
                max="500"
                value={targetKb}
                onChange={(e) => setTargetKb(Math.max(10, Math.min(500, Number(e.target.value))))}
                className="w-14 bg-transparent text-right font-mono font-black text-rose-600 text-sm focus:outline-none"
              />
              <span className="text-xs font-bold text-rose-600">KB</span>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "50 KB", desc: "छोटा", kb: 50 },
              { label: "100 KB", desc: "सरकारी पोर्टल", kb: 100 },
              { label: "300 KB", desc: "मानक प्रिंट", kb: 300 },
              { label: "500 KB", desc: "अल्ट्रा HD", kb: 500 },
            ].map((p) => (
              <button
                key={p.kb}
                type="button"
                onClick={() => setTargetKb(p.kb)}
                className={`py-2 px-1 text-center rounded-xl border transition ${
                  targetKb === p.kb
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-extrabold">{p.label}</div>
                <div className={`text-[9px] ${targetKb === p.kb ? "text-rose-100" : "text-slate-400"}`}>
                  {p.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min="10"
            max="500"
            step="5"
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />

          {/* Layout Options */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">प्रिंट लेआउट चुनें:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode("side-by-side")}
                className={`p-3 rounded-xl border text-center transition ${
                  layoutMode === "side-by-side"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                <span className="text-xs font-bold block">साइड-बाय-साइड</span>
                <span className={`text-[9px] ${layoutMode === "side-by-side" ? "text-rose-100" : "text-slate-400"}`}>
                  अलग-अलग काटकर चिपकाने हेतु
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("stack-fold")}
                className={`p-3 rounded-xl border text-center transition ${
                  layoutMode === "stack-fold"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                <span className="text-xs font-bold block">सेंटर-फ़ोल्ड</span>
                <span className={`text-[9px] ${layoutMode === "stack-fold" ? "text-rose-100" : "text-slate-400"}`}>
                  बीच से मोड़कर लेमिनेशन हेतु
                </span>
              </button>
            </div>
          </div>

          {/* Join & Generate Sheet */}
          <button
            type="button"
            onClick={generateJoinedSheet}
            disabled={!front.src || !back.src || isProcessing}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{procMsg || "शीट तैयार हो रही है..."}</span>
              </span>
            ) : (
              <span>🖨️ दोनों साइड जोड़कर A4 शीट बनाएँ ({targetKb} KB लक्ष्य)</span>
            )}
          </button>
        </div>

        {/* Output Download Section */}
        {(downloadJpgUrl || downloadPdfUrl) && (
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">300 DPI A4 शीट तैयार है!</h3>
                <p className="text-xs text-slate-500">सटीक 85.6mm x 54mm PVC साइज़ (100% प्रिंट रेडी)</p>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono text-sm font-black">
                {outputSizeKb} KB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {downloadPdfUrl && (
                <a
                  href={downloadPdfUrl}
                  download={`PVC-Card-A4-${outputSizeKb}kb.pdf`}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  📄 डाउनलोड A4 PDF (सटीक प्रिंट स्केल)
                </a>
              )}
              {downloadJpgUrl && (
                <a
                  href={downloadJpgUrl}
                  download={`PVC-Card-Sheet-${outputSizeKb}kb.jpg`}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  🖼️ डाउनलोड Ultra HD JPG ({outputSizeKb} KB)
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
