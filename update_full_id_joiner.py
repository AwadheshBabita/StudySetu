full_code = '''"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { exportSmartJpg } from "@/lib/image-engine";

interface Point {
  x: number;
  y: number;
}

type ActiveTarget = "front" | "back" | null;
type PaperType = "A4" | "4x6" | "letter";
type LayoutMode = "portrait_side_by_side" | "landscape_stacked";

interface PaperSpec {
  sheetW_mm: number;
  sheetH_mm: number;
  cardW_mm: number;
  cardH_mm: number;
}

const PAPER_SPECS: Record<PaperType, PaperSpec> = {
  A4: { sheetW_mm: 210, sheetH_mm: 297, cardW_mm: 85.6, cardH_mm: 53.98 },
  "4x6": { sheetW_mm: 101.6, sheetH_mm: 152.4, cardW_mm: 85.6, cardH_mm: 53.98 },
  letter: { sheetW_mm: 215.9, sheetH_mm: 279.4, cardW_mm: 85.6, cardH_mm: 53.98 },
};

export default function IdCardJoinerPage() {
  const [paperType, setPaperType] = useState<PaperType>("4x6");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("portrait_side_by_side");
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [cardGapMm, setCardGapMm] = useState<number>(4);
  const [targetKb, setTargetKb] = useState<number>(200);

  const [frontCropped, setFrontCropped] = useState<string | null>(null);
  const [backCropped, setBackCropped] = useState<string | null>(null);

  // अलग-अलग बटन स्टेट्स
  const [downloadingFormat, setDownloadingFormat] = useState<"jpg" | "pdf" | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // 🎯 स्मार्ट डॉक्यूमेंट स्कैनर कैनवास क्रॉपर स्टेट
  const [cropTarget, setCropTarget] = useState<ActiveTarget>(null);
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropSourceImgRef = useRef<HTMLImageElement | null>(null);
  const cropCornersRef = useRef<Point[]>([]);
  const cropActivePointIdxRef = useRef<number | null>(null);

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const spec = PAPER_SPECS[paperType];

  const handleFileChange = (file: File | undefined, target: "front" | "back") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setCropImgSrc(src);
      setCropTarget(target);

      const img = new Image();
      img.onload = () => {
        cropSourceImgRef.current = img;
        setTimeout(() => {
          const cvs = cropCanvasRef.current;
          if (!cvs) return;
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          cvs.width = w;
          cvs.height = h;

          const padX = w * 0.08;
          const padY = h * 0.08;
          cropCornersRef.current = [
            { x: padX, y: padY },
            { x: w - padX, y: padY },
            { x: w - padX, y: h - padY },
            { x: padX, y: h - padY },
          ];
          drawCropCanvas(null);
        }, 120);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // 2.2x मैग्नीफ़ायर लेंस और कैनवास रेंडरर (Smart Document Scanner)
  const drawCropCanvas = (activeIdx: number | null = cropActivePointIdxRef.current) => {
    const cvs = cropCanvasRef.current;
    const img = cropSourceImgRef.current;
    if (!cvs || !img) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

    const pts = cropCornersRef.current;
    if (!pts || pts.length !== 4) return;

    // डार्क ओवरले
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, cvs.width, cvs.height);
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.closePath();
    ctx.fill("evenodd");

    // बाउंड्री लाइन
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(cvs.width / 320));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.stroke();

    // 4 गोल हैंडल
    const baseRadius = Math.max(16, Math.round(cvs.width / 45));
    pts.forEach((p, i) => {
      const isDragging = activeIdx === i;
      const r = isDragging ? baseRadius * 1.3 : baseRadius;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDragging ? "#16a34a" : "#2563eb";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // 2.2x मैग्नीफ़ायर लेंस
    if (activeIdx !== null && pts[activeIdx]) {
      const cur = pts[activeIdx];
      const lensRadius = Math.max(70, Math.round(cvs.width / 10));
      const zoom = 2.2;

      let lensX = cur.x;
      let lensY = cur.y - lensRadius - 60;
      if (lensY - lensRadius < 20) lensY = cur.y + lensRadius + 60;
      if (lensX - lensRadius < 20) lensX = lensRadius + 20;
      if (lensX + lensRadius > cvs.width - 20) lensX = cvs.width - lensRadius - 20;

      ctx.save();
      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        (cur.x / cvs.width) * img.width - (lensRadius / zoom) * (img.width / cvs.width),
        (cur.y / cvs.height) * img.height - (lensRadius / zoom) * (img.height / cvs.height),
        ((lensRadius * 2) / zoom) * (img.width / cvs.width),
        ((lensRadius * 2) / zoom) * (img.height / cvs.height),
        lensX - lensRadius,
        lensY - lensRadius,
        lensRadius * 2,
        lensRadius * 2
      );

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lensX - 22, lensY);
      ctx.lineTo(lensX + 22, lensY);
      ctx.moveTo(lensX, lensY - 22);
      ctx.lineTo(lensX + 22, lensY);
      ctx.stroke();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2563eb";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  };

  const getCropCanvasCoords = (clientX: number, clientY: number) => {
    const cvs = cropCanvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height),
    };
  };

  const handleCropPointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCropCanvasCoords(clientX, clientY);
    const cvs = cropCanvasRef.current;
    if (!cvs) return;

    let foundIdx: number | null = null;
    let minDist = Math.max(65, cvs.width / 12);

    cropCornersRef.current.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        foundIdx = idx;
      }
    });

    if (foundIdx !== null) {
      cropActivePointIdxRef.current = foundIdx;
      drawCropCanvas(foundIdx);
    }
  };

  const handleCropPointerMove = (clientX: number, clientY: number) => {
    if (cropActivePointIdxRef.current === null) return;
    const cvs = cropCanvasRef.current;
    if (!cvs) return;

    const { x, y } = getCropCanvasCoords(clientX, clientY);
    const boundedX = Math.max(0, Math.min(cvs.width, x));
    const boundedY = Math.max(0, Math.min(cvs.height, y));

    cropCornersRef.current[cropActivePointIdxRef.current] = { x: boundedX, y: boundedY };
    requestAnimationFrame(() => drawCropCanvas(cropActivePointIdxRef.current));
  };

  const handleCropPointerUp = () => {
    if (cropActivePointIdxRef.current !== null) {
      cropActivePointIdxRef.current = null;
      drawCropCanvas(null);
    }
  };

  const applyPerspectiveWarp = (
    image: HTMLImageElement,
    srcPts: Point[],
    dstW: number,
    dstH: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const [tl, tr, br, bl] = srcPts;
    const segs = 32;
    for (let y = 0; y < segs; y++) {
      const v0 = y / segs;
      const v1 = (y + 1) / segs;
      for (let x = 0; x < segs; x++) {
        const u0 = x / segs;
        const u1 = (x + 1) / segs;

        const p00 = {
          x: (1 - u0) * ((1 - v0) * tl.x + v0 * bl.x) + u0 * ((1 - v0) * tr.x + v0 * br.x),
          y: (1 - u0) * ((1 - v0) * tl.y + v0 * bl.y) + u0 * ((1 - v0) * tr.y + v0 * br.y),
        };
        const p10 = {
          x: (1 - u1) * ((1 - v0) * tl.x + v0 * bl.x) + u1 * ((1 - v0) * tr.x + v0 * br.x),
          y: (1 - u1) * ((1 - v0) * tl.y + v0 * bl.y) + u1 * ((1 - v0) * tr.y + v0 * br.y),
        };

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(u0 * dstW, v0 * dstH);
        ctx.lineTo(u1 * dstW, v0 * dstH);
        ctx.lineTo(u1 * dstW, v1 * dstH);
        ctx.lineTo(u0 * dstW, v1 * dstH);
        ctx.closePath();
        ctx.clip();

        const dx = p10.x - p00.x;
        const dy = p10.y - p00.y;
        const sx = Math.hypot(dx, dy) / (dstW / segs);
        const ang = Math.atan2(dy, dx);

        ctx.translate(u0 * dstW, v0 * dstH);
        ctx.rotate(-ang);
        ctx.scale(1 / (sx || 1), 1 / (sx || 1));
        ctx.drawImage(image, -p00.x, -p00.y);
        ctx.restore();
      }
    }
    return canvas;
  };

  const handleApplyCrop = () => {
    const cvs = cropCanvasRef.current;
    const img = cropSourceImgRef.current;
    if (!cvs || !img || !cropTarget) return;

    const scaleX = img.width / cvs.width;
    const scaleY = img.height / cvs.height;

    const srcPoints: Point[] = cropCornersRef.current.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const cardW = 1011;
    const cardH = 638;
    const warpedCanvas = applyPerspectiveWarp(img, srcPoints, cardW, cardH);
    const dataUrl = warpedCanvas.toDataURL("image/jpeg", 0.96);

    if (cropTarget === "front") {
      setFrontCropped(dataUrl);
    } else {
      setBackCropped(dataUrl);
    }

    setCropTarget(null);
    setCropImgSrc(null);
  };

  // शीट कैनवास जनरेशन
  const generateSheetCanvas = async (scale = 1.0): Promise<HTMLCanvasElement | null> => {
    const dpi = 300 * scale;
    const dpmm = dpi / 25.4;

    const sheetW = Math.round(spec.sheetW_mm * dpmm);
    const sheetH = Math.round(spec.sheetH_mm * dpmm);
    const cardW = Math.round(spec.cardW_mm * dpmm);
    const cardH = Math.round(spec.cardH_mm * dpmm);
    const gap = Math.round(cardGapMm * dpmm);

    const canvas = document.createElement("canvas");
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sheetW, sheetH);

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    let frontImg: HTMLImageElement | null = null;
    let backImg: HTMLImageElement | null = null;

    try {
      if (frontCropped) frontImg = await loadImage(frontCropped);
      if (backCropped) backImg = await loadImage(backCropped);
    } catch {
      // Image load error
    }

    const drawCard = (img: HTMLImageElement | null, x: number, y: number) => {
      if (img) {
        ctx.drawImage(img, x, y, cardW, cardH);
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(x, y, cardW, cardH);
      }
      if (showBorder) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(1, Math.round(scale * 1.5));
        ctx.strokeRect(x, y, cardW, cardH);
      }
    };

    if (layoutMode === "portrait_side_by_side") {
      const totalCardsW = cardW * 2 + gap;
      const startX = Math.round((sheetW - totalCardsW) / 2);
      const startY = Math.round((sheetH - cardH) / 2);

      drawCard(frontImg, startX, startY);
      drawCard(backImg, startX + cardW + gap, startY);
    } else {
      const totalCardsH = cardH * 2 + gap;
      const startX = Math.round((sheetW - cardW) / 2);
      const startY = Math.round((sheetH - totalCardsH) / 2);

      drawCard(frontImg, startX, startY);
      drawCard(backImg, startX, startY + cardH + gap);
    }

    return canvas;
  };

  const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    const canvas = await generateSheetCanvas(1.0);
    if (!canvas) return null;

    try {
      const smartRes = await exportSmartJpg(canvas, {
        targetKb: targetSizeKb,
        isDocument: true,
        minQuality: 0.15,
        maxQuality: 0.98,
      });
      return smartRes.blob;
    } catch {
      return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    }
  };

  const handleDownload = async (format: "jpg" | "pdf") => {
    if (downloadingFormat || isSharing) return;
    setDownloadingFormat(format);
    try {
      if (format === "jpg") {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `id_card_${targetKb}kb.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (format === "pdf") {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;

        const arrayBuffer = await blob.arrayBuffer();
        const imgBytes = new Uint8Array(arrayBuffer);

        const pW = (spec.sheetW_mm * 72) / 25.4;
        const pH = (spec.sheetH_mm * 72) / 25.4;

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([pW, pH]);
        const embeddedImg = await pdfDoc.embedJpg(imgBytes);

        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: pW,
          height: pH,
        });

        const finalPdf = await pdfDoc.save();
        const pdfBlob = new Blob([finalPdf.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `id_card_${targetKb}kb.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleShare = async () => {
    if (isSharing || downloadingFormat) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.98);
      const res = await fetch(jpgDataUrl);
      const blob = await res.blob();
      const fileName = `ExamSewa_IDCard_${paperType}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ExamSewa आईडी कार्ड",
          text: "ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़",
        });
      } else if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "ExamSewa आईडी कार्ड",
          text: "ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़",
        });
      } else {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError" && err?.name !== "NotAllowedError") {
        console.error("शेयरिंग त्रुटि:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = async () => {
    const canvas = await generateSheetCanvas(1.0);
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Print ID Card</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col select-none">
      <header className="border-b border-slate-200 bg-white px-3 sm:px-4 h-11 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-bold">
            ← होम
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
            <span>🪪</span> ID कार्ड जॉइनर
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={!frontCropped && !backCropped}
            className="text-[11px] font-black px-3 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-sm transition active:scale-95"
          >
            🖨️️ प्रिंट
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-start p-2 sm:p-2.5 gap-3 max-w-7xl mx-auto w-full">
        <div className="w-full lg:flex-1 sticky top-1 lg:top-3 z-30 bg-slate-200/95 rounded-2xl border-2 border-slate-400 shadow-md p-2 flex flex-col items-center justify-center relative shrink-0 overflow-hidden backdrop-blur-sm max-h-[44vh] sm:max-h-[48vh] lg:max-h-none">
          <div className="w-full flex items-center justify-between mb-1 text-[10px] sm:text-[11px] font-bold text-slate-700 px-2 shrink-0">
            <span>
              शीट: <span className="text-blue-700 font-black ml-1">{paperType}</span>
            </span>
            <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              लक्ष्य: {targetKb} KB
            </span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center lg:items-start lg:justify-center overflow-hidden lg:overflow-y-auto p-1 lg:p-4">
            <div
              className="bg-white rounded-xl shadow-xl border-2 border-slate-900 transition-all flex flex-col items-center max-h-full max-w-full p-2 lg:p-6 relative lg:w-[600px] lg:!h-auto"
              style={{
                aspectRatio: `${spec.sheetW_mm} / ${spec.sheetH_mm}`,
              }}
            >
              <div
                className={`flex items-center justify-center gap-2 transition-all max-h-full max-w-full ${
                  layoutMode === "portrait_side_by_side" ? "flex-row" : "flex-col"
                }`}
              >
                <div
                  className={`rounded-xs overflow-hidden flex items-center justify-center bg-slate-50 transition-all ${
                    showBorder ? "border border-black shadow-xs" : ""
                  }`}
                  style={{
                    aspectRatio: "85.6 / 53.98",
                    width: layoutMode === "portrait_side_by_side" ? "48%" : "85%",
                  }}
                >
                  {frontCropped ? (
                    <img src={frontCropped} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 text-center px-1">
                      Front Side
                    </span>
                  )}
                </div>

                <div
                  className={`rounded-xs overflow-hidden flex items-center justify-center bg-slate-50 transition-all ${
                    showBorder ? "border border-black shadow-xs" : ""
                  }`}
                  style={{
                    aspectRatio: "85.6 / 53.98",
                    width: layoutMode === "portrait_side_by_side" ? "48%" : "85%",
                  }}
                >
                  {backCropped ? (
                    <img src={backCropped} alt="Back" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 text-center px-1">
                      Back Side
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-88 xl:w-96 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3.5 space-y-3 pb-28 sm:pb-12 z-20">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputFrontRef}
                onChange={(e) => handleFileChange(e.target.files?.[0], "front")}
                className="hidden"
              />
              <button
                onClick={() => fileInputFrontRef.current?.click()}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-98"
              >
                <span>📷 Front (आगे)</span>
                <span className="text-[9px] font-semibold text-blue-600">
                  {frontCropped ? "✅ बदला गया" : "अपलोड करें"}
                </span>
              </button>
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputBackRef}
                onChange={(e) => handleFileChange(e.target.files?.[0], "back")}
                className="hidden"
              />
              <button
                onClick={() => fileInputBackRef.current?.click()}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-98"
              >
                <span>📷 Back (पीछे)</span>
                <span className="text-[9px] font-semibold text-blue-600">
                  {backCropped ? "✅ बदला गया" : "अपलोड करें"}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              कागज़ का आकार (Paper Size)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["4x6", "A4", "letter"] as PaperType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPaperType(type)}
                  className={`py-1.5 rounded-lg font-black text-xs border cursor-pointer transition-all ${
                    paperType === type
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              कार्ड लेआउट (Placement)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setLayoutMode("portrait_side_by_side")}
                className={`py-1.5 px-2 rounded-lg font-black text-[11px] border cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  layoutMode === "portrait_side_by_side"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>↔️</span>
                <span>अगल-बगल</span>
              </button>
              <button
                onClick={() => setLayoutMode("landscape_stacked")}
                className={`py-1.5 px-2 rounded-lg font-black text-[11px] border cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  layoutMode === "landscape_stacked"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>↕️</span>
                <span>ऊपर-नीचे</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700">
              <span>फाइल साइज (टारगेट KB):</span>
              <span className="text-blue-700 font-mono font-black">{targetKb} KB</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[100, 200, 300, 500].map((kb) => (
                <button
                  key={kb}
                  onClick={() => setTargetKb(kb)}
                  className={`py-1 rounded font-black text-[10px] border cursor-pointer transition-all ${
                    targetKb === kb
                      ? "bg-blue-50 text-blue-800 border-blue-400 font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {kb} KB
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBorder}
                onChange={(e) => setShowBorder(e.target.checked)}
                className="w-3.5 h-3.5 accent-black cursor-pointer"
              />
              <span className="text-[11px] font-black text-slate-900">काली कटिंग बॉर्डर</span>
            </label>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-600">गैप:</span>
              <input
                type="number"
                min="2"
                max="15"
                value={cardGapMm}
                onChange={(e) => setCardGapMm(Number(e.target.value))}
                className="w-12 text-center text-xs font-black border border-slate-300 rounded bg-white py-0.5"
              />
              <span className="text-[10px] font-black text-slate-500">mm</span>
            </div>
          </div>

          {/* 7. डाउनलोड सेक्शन (प्रत्येक बटन पूरी तरह अलग) */}
          <div className="pt-2 border-t-2 border-slate-300 space-y-1.5">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block text-center">
              आउटपुट डाउनलोड व शेयर
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload("jpg");
                }}
                disabled={(!frontCropped && !backCropped) || downloadingFormat === "jpg"}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || downloadingFormat === "jpg"
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
              >
                <span>🖼️</span>
                <span>{downloadingFormat === "jpg" ? "तैयार..." : "JPG"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload("pdf");
                }}
                disabled={(!frontCropped && !backCropped) || downloadingFormat === "pdf"}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || downloadingFormat === "pdf"
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
              >
                <span>📄</span>
                <span>{downloadingFormat === "pdf" ? "तैयार..." : "PDF"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={(!frontCropped && !backCropped) || isSharing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
              >
                <span>🔗</span>
                <span>{isSharing ? "खुल रहा..." : "शेयर करें"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4-कॉर्नर पर्सपेक्टिव क्रॉपर मोडल (Smart Document Scanner 2.2x Lens) */}
      {cropTarget && cropImgSrc && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-between p-2.5 sm:p-4 select-none">
          <div className="w-full max-w-2xl flex items-center justify-between text-white py-1">
            <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
              <span>📐</span> चारों कोनों को कार्ड पर बैठाएँ ({cropTarget === "front" ? "आगे का भाग" : "पीछे का भाग"})
            </span>
            <button
              type="button"
              onClick={() => {
                setCropTarget(null);
                setCropImgSrc(null);
              }}
              className="text-xs bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-lg font-bold cursor-pointer"
            >
              रद्द करें
            </button>
          </div>

          <div className="flex-1 w-full max-w-2xl flex items-center justify-center overflow-hidden my-auto p-1">
            <div className="border-2 border-slate-700 rounded-2xl p-1 bg-slate-900 shadow-2xl overflow-hidden select-none touch-none">
              <canvas
                ref={cropCanvasRef}
                onMouseDown={(e) => handleCropPointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handleCropPointerMove(e.clientX, e.clientY)}
                onMouseUp={handleCropPointerUp}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    const t = e.touches[0];
                    handleCropPointerDown(t.clientX, t.clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (cropActivePointIdxRef.current !== null && e.touches.length > 0) {
                    if (e.cancelable) e.preventDefault();
                    const t = e.touches[0];
                    handleCropPointerMove(t.clientX, t.clientY);
                  }
                }}
                onTouchEnd={handleCropPointerUp}
                className="max-h-[65vh] sm:max-h-[500px] w-auto max-w-full mx-auto cursor-crosshair block select-none rounded-xl"
              />
            </div>
          </div>

          <div className="w-full max-w-2xl flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (cropTarget === "front" && fileInputFrontRef.current) fileInputFrontRef.current.click();
                if (cropTarget === "back" && fileInputBackRef.current) fileInputBackRef.current.click();
              }}
              className="w-1/3 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95 text-center cursor-pointer"
            >
              🔄 नई तस्वीर
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="w-2/3 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-md active:scale-95 text-center cursor-pointer"
            >
              📐 कार्ड क्रॉप करें (Crop)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
'''

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(full_code)

print("ID_CARD_JOINER_FULLY_RESTORED_AND_UPGRADED")
