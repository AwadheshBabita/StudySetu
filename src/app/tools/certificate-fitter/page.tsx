"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

type PageOrientation = "portrait" | "landscape";
type FilterMode = "original" | "magic" | "bw" | "grayscale";

interface Point {
  x: number;
  y: number;
}

export default function CertificateFitterPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "crop" | "filter">("upload");
  const [filter, setFilter] = useState<FilterMode>("magic");
  const [brightness, setBrightness] = useState<number>(12);
  const [contrast, setContrast] = useState<number>(32);
  const [targetKb, setTargetKb] = useState<number>(100);
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [jpgDownloadUrl, setJpgDownloadUrl] = useState<string | null>(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [actualPdfKb, setActualPdfKb] = useState<number | null>(null);
  const [actualJpgKb, setActualJpgKb] = useState<number | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // 4 corners: 0:TopLeft, 1:TopRight, 2:BottomRight, 3:BottomLeft
  const [corners, setCorners] = useState<Point[]>([
    { x: 40, y: 40 },
    { x: 300, y: 40 },
    { x: 300, y: 400 },
    { x: 40, y: 400 }
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState<Point | null>(null);

  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawCroppedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        originalImgRef.current = img;
        setImageSrc(dataUrl);
        setStep("crop");
        setZoomLevel(1);

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setCorners([
          { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
          { x: Math.round(w * 0.92), y: Math.round(h * 0.08) },
          { x: Math.round(w * 0.92), y: Math.round(h * 0.92) },
          { x: Math.round(w * 0.08), y: Math.round(h * 0.92) }
        ]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 90 Degree Rotation for rotated camera uploads
  const handleRotate90 = () => {
    const img = originalImgRef.current;
    if (!img) return;

    const rCanvas = document.createElement("canvas");
    rCanvas.width = img.naturalHeight;
    rCanvas.height = img.naturalWidth;
    const rCtx = rCanvas.getContext("2d");
    if (!rCtx) return;

    rCtx.translate(rCanvas.width / 2, rCanvas.height / 2);
    rCtx.rotate((90 * Math.PI) / 180);
    rCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const rotatedDataUrl = rCanvas.toDataURL("image/jpeg", 0.98);
    const newImg = new Image();
    newImg.onload = () => {
      originalImgRef.current = newImg;
      setImageSrc(rotatedDataUrl);
      const w = newImg.naturalWidth;
      const h = newImg.naturalHeight;
      setCorners([
        { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
        { x: Math.round(w * 0.92), y: Math.round(h * 0.08) },
        { x: Math.round(w * 0.92), y: Math.round(h * 0.92) },
        { x: Math.round(w * 0.08), y: Math.round(h * 0.92) }
      ]);
    };
    newImg.src = rotatedDataUrl;
  };

  const drawCropScreen = () => {
    const canvas = cropCanvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = Math.max(3, Math.round(img.naturalWidth / 280));
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.stroke();

    const handleRadius = Math.max(16, Math.round(img.naturalWidth / 50));
    corners.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = activeCorner === i ? "#f59e0b" : "#10b981";
      ctx.fill();
      ctx.lineWidth = Math.max(3, Math.round(handleRadius / 3));
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.round(handleRadius * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    if (activeCorner !== null && touchPos) {
      const activePt = corners[activeCorner];
      const lensR = Math.max(65, Math.round(img.naturalWidth / 12));
      const lensOffsetY = Math.round(lensR * 1.5);
      const lx = activePt.x;
      const ly = Math.max(lensR + 10, activePt.y - lensOffsetY);

      ctx.save();
      ctx.beginPath();
      ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      const zoom = 2.5;
      ctx.drawImage(
        img,
        activePt.x - lensR / zoom,
        activePt.y - lensR / zoom,
        (lensR * 2) / zoom,
        (lensR * 2) / zoom,
        lx - lensR,
        ly - lensR,
        lensR * 2,
        lensR * 2
      );

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - 16, ly);
      ctx.lineTo(lx + 16, ly);
      ctx.moveTo(lx, ly - 16);
      ctx.lineTo(lx, ly + 16);
      ctx.stroke();

      ctx.restore();
      ctx.beginPath();
      ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (step === "crop") {
      drawCropScreen();
    }
  }, [step, corners, activeCorner, touchPos]);

  const getCanvasCoords = (clientX: number, clientY: number): Point => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const pt = getCanvasCoords(clientX, clientY);
    const canvas = cropCanvasRef.current;
    const touchThreshold = canvas ? Math.max(45, Math.round(canvas.width / 16)) : 50;

    let closest = -1;
    let minD = touchThreshold;

    corners.forEach((c, idx) => {
      const d = Math.hypot(c.x - pt.x, c.y - pt.y);
      if (d < minD) {
        minD = d;
        closest = idx;
      }
    });

    if (closest !== -1) {
      setActiveCorner(closest);
      setTouchPos(pt);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (activeCorner === null) return;
    const pt = getCanvasCoords(clientX, clientY);
    const img = originalImgRef.current;
    if (!img) return;

    setTouchPos(pt);
    setCorners((prev) =>
      prev.map((c, idx) =>
        idx === activeCorner
          ? {
              x: Math.max(0, Math.min(img.naturalWidth, Math.round(pt.x))),
              y: Math.max(0, Math.min(img.naturalHeight, Math.round(pt.y)))
            }
          : c
      )
    );
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
    setTouchPos(null);
  };

  const runStraighten = () => {
    if (!originalImgRef.current) return;
    setProcessing(true);

    setTimeout(() => {
      try {
        const img = originalImgRef.current!;
        const [c0, c1, c2, c3] = corners;

        const topW = Math.hypot(c1.x - c0.x, c1.y - c0.y);
        const botW = Math.hypot(c2.x - c3.x, c2.y - c3.y);
        const outW = Math.round(Math.max(topW, botW));

        const leftH = Math.hypot(c3.x - c0.x, c3.y - c0.y);
        const rightH = Math.hypot(c2.x - c1.x, c2.y - c1.y);
        const outH = Math.round(Math.max(leftH, rightH));

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(100, outW);
        canvas.height = Math.max(100, outH);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const sCtx = srcCanvas.getContext("2d");
        sCtx?.drawImage(img, 0, 0);
        const srcData = sCtx?.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        if (!srcData) return;

        const outData = ctx.createImageData(canvas.width, canvas.height);
        const sD = srcData.data;
        const oD = outData.data;
        const sw = srcCanvas.width;
        const sh = srcCanvas.height;
        const ow = canvas.width;
        const oh = canvas.height;

        for (let y = 0; y < oh; y++) {
          const v = y / (oh - 1);
          const lx = c0.x + (c3.x - c0.x) * v;
          const ly = c0.y + (c3.y - c0.y) * v;
          const rx = c1.x + (c2.x - c1.x) * v;
          const ry = c1.y + (c2.y - c1.y) * v;

          for (let x = 0; x < ow; x++) {
            const u = x / (ow - 1);
            const sx = Math.round(lx + (rx - lx) * u);
            const sy = Math.round(ly + (ry - ly) * u);

            const outIdx = (y * ow + x) * 4;
            if (sx >= 0 && sx < sw && sy >= 0 && sy < sh) {
              const srcIdx = (sy * sw + sx) * 4;
              oD[outIdx] = sD[srcIdx];
              oD[outIdx + 1] = sD[srcIdx + 1];
              oD[outIdx + 2] = sD[srcIdx + 2];
              oD[outIdx + 3] = 255;
            } else {
              oD[outIdx] = 255;
              oD[outIdx + 1] = 255;
              oD[outIdx + 2] = 255;
              oD[outIdx + 3] = 255;
            }
          }
        }

        ctx.putImageData(outData, 0, 0);
        rawCroppedCanvasRef.current = canvas;
        setStep("filter");
      } catch {
        alert("कागज़ सीधा करने में समस्या आई।");
      } finally {
        setProcessing(false);
      }
    }, 40);
  };

  const applyFilters = () => {
    const cropped = rawCroppedCanvasRef.current;
    if (!cropped) return;

    const a4W = orientation === "portrait" ? 1414 : 2000;
    const a4H = orientation === "portrait" ? 2000 : 1414;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = a4W;
    finalCanvas.height = a4H;
    const ctx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, a4W, a4H);

    const margin = Math.round(a4W * 0.035);
    const availW = a4W - margin * 2;
    const availH = a4H - margin * 2;

    const scale = Math.min(availW / cropped.width, availH / cropped.height);
    const drawW = Math.round(cropped.width * scale);
    const drawH = Math.round(cropped.height * scale);
    const drawX = Math.round(margin + (availW - drawW) / 2);
    const drawY = Math.round(margin + (availH - drawH) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(cropped, drawX, drawY, drawW, drawH);

    const imgData = ctx.getImageData(0, 0, a4W, a4H);
    const d = imgData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + brightness;
      let g = d[i + 1] + brightness;
      let b = d[i + 2] + brightness;

      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      if (filter === "bw") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = gray > 142 ? 255 : 0;
        d[i] = val; d[i + 1] = val; d[i + 2] = val;
      } else if (filter === "grayscale") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const clamped = Math.max(0, Math.min(255, gray));
        d[i] = clamped; d[i + 1] = clamped; d[i + 2] = clamped;
      } else if (filter === "magic") {
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        if (maxVal > 152 && (maxVal - minVal) < 40) {
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
        } else {
          d[i] = Math.max(0, Math.min(255, r * 0.80));
          d[i + 1] = Math.max(0, Math.min(255, g * 0.80));
          d[i + 2] = Math.max(0, Math.min(255, b * 0.80));
        }
      } else {
        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const preview = previewCanvasRef.current;
    if (preview) {
      preview.width = a4W;
      preview.height = a4H;
      const pCtx = preview.getContext("2d");
      pCtx?.drawImage(finalCanvas, 0, 0);
    }
  };

  useEffect(() => {
    if (step === "filter") {
      applyFilters();
    }
  }, [step, filter, brightness, contrast, orientation]);

  // Guaranteed Binary Search Engine for BOTH JPG & PDF
  const generateFinalOutputs = async () => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    setGenerating(true);

    try {
      const maxTargetBytes = targetKb * 1024;
      const pageWidth = orientation === "portrait" ? 595.28 : 841.89;
      const pageHeight = orientation === "portrait" ? 841.89 : 595.28;

      let bestJpgBlob: Blob | null = null;
      let bestPdfBytes: Uint8Array | null = null;

      // Dynamic initial scale based on target KB
      let currentScale = targetKb <= 30 ? 0.35 : targetKb <= 60 ? 0.52 : targetKb <= 100 ? 0.72 : 1.0;

      // Enforce hard cap loop: reduce scale and quality until BOTH JPG & PDF <= maxTargetBytes
      for (let attempt = 0; attempt < 8; attempt++) {
        const curW = Math.max(320, Math.round(preview.width * currentScale));
        const curH = Math.max(450, Math.round(preview.height * currentScale));

        const scaleCanvas = document.createElement("canvas");
        scaleCanvas.width = curW;
        scaleCanvas.height = curH;
        const sCtx = scaleCanvas.getContext("2d");
        if (!sCtx) break;
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = "high";
        sCtx.drawImage(preview, 0, 0, curW, curH);

        // Quality Binary Search
        let qLow = 0.05;
        let qHigh = targetKb >= 120 ? 0.95 : 0.85;
        let localBestBlob: Blob | null = null;
        let localBestPdf: Uint8Array | null = null;

        for (let qIter = 0; qIter < 5; qIter++) {
          const midQ = (qLow + qHigh) / 2;
          const candidateBlob: Blob = await new Promise((res) => {
            scaleCanvas.toBlob((b) => res(b!), "image/jpeg", midQ);
          });

          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          const imgBytes = await candidateBlob.arrayBuffer();
          const embedded = await pdfDoc.embedJpg(imgBytes);
          page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
          const testPdfBytes = await pdfDoc.save();

          if (candidateBlob.size <= maxTargetBytes && testPdfBytes.length <= maxTargetBytes) {
            localBestBlob = candidateBlob;
            localBestPdf = testPdfBytes;
            qLow = midQ; // try higher quality within budget
          } else {
            qHigh = midQ; // too large, lower quality
          }
        }

        if (localBestBlob && localBestPdf) {
          bestJpgBlob = localBestBlob;
          bestPdfBytes = localBestPdf;
          break; // Successfully locked strictly below Target KB
        }

        // If even lowest quality exceeded target KB, downscale canvas dimensions further
        currentScale *= 0.80;
      }

      // Emergency fail-safe fallback
      if (!bestJpgBlob || !bestPdfBytes) {
        const fallbackCanvas = document.createElement("canvas");
        fallbackCanvas.width = 400;
        fallbackCanvas.height = Math.round((400 / preview.width) * preview.height);
        const fbCtx = fallbackCanvas.getContext("2d");
        fbCtx?.drawImage(preview, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
        bestJpgBlob = await new Promise((res) => fallbackCanvas.toBlob((b) => res(b!), "image/jpeg", 0.35));

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const imgBytes = await bestJpgBlob!.arrayBuffer();
        const embedded = await pdfDoc.embedJpg(imgBytes);
        page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
        bestPdfBytes = await pdfDoc.save();
      }

      setActualJpgKb(Math.round(bestJpgBlob!.size / 1024));
      setActualPdfKb(Math.round(bestPdfBytes!.length / 1024));

      if (jpgDownloadUrl) URL.revokeObjectURL(jpgDownloadUrl);
      setJpgDownloadUrl(URL.createObjectURL(bestJpgBlob!));

      const finalPdfBlob = new Blob([bestPdfBytes!], { type: "application/pdf" });
      if (pdfDownloadUrl) URL.revokeObjectURL(pdfDownloadUrl);
      setPdfDownloadUrl(URL.createObjectURL(finalPdfBlob));

    } catch {
      alert("फाइल तैयार करने में समस्या आई।");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (step === "filter") {
      generateFinalOutputs();
    }
  }, [step, targetKb, orientation, filter, brightness, contrast]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            सर्टिफिकेट व डॉक्यूमेंट कनवर्टर (A4 डॉक्यूमेंट फिटर)
          </h1>
          <p className="text-gray-600 text-sm">
            4-कॉर्नर कटिंग, Portrait/Landscape स्विच और 10 से 200 KB सटीक लिमिट
          </p>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
            <input
              type="file"
              accept="image/*"
              id="file-gallery-upload"
              className="hidden"
              onChange={handleFileChange}
            />

            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="file-camera-upload"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl font-bold mx-auto">
                📄
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  मार्कशीट या डॉक्यूमेंट अपलोड करें
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  सीधे मोबाइल कैमरे से फोटो खींचें या गैलरी से चुनें
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label
                  htmlFor="file-camera-upload"
                  className="cursor-pointer py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <span className="text-lg">📸</span>
                  <span>कैमरे से फोटो खींचें</span>
                </label>

                <label
                  htmlFor="file-gallery-upload"
                  className="cursor-pointer py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-semibold text-sm border border-gray-300 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span className="text-lg">📁</span>
                  <span>गैलरी / फाइल से चुनें</span>
                </label>
              </div>

              <span className="text-[11px] text-gray-400 block pt-1">
                JPG, PNG, WEBP सपोर्टेड • 100% सुरक्षित और प्राइवेट
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Crop with Rotate & Zoom */}
        {step === "crop" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-semibold text-gray-900">कागज़ के 4 कोने सेट करें</h2>
                <p className="text-xs text-emerald-600 font-medium">
                  💡 किसी भी कोने को दबाएँ—सटीक सेटिंग के लिए ज़ूम लेंस ऊपर दिखेगा
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* 90 Degree Rotate Button */}
                <button
                  type="button"
                  onClick={handleRotate90}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold border border-gray-300 flex items-center gap-1 shadow-sm"
                  title="फोटो 90 डिग्री घुमाएँ"
                >
                  <span>⟳</span>
                  <span>घुमाएँ (90°)</span>
                </button>

                {/* Zoom Screen Controls */}
                <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">ज़ूम:</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                    className="w-6 h-6 bg-white hover:bg-gray-200 text-gray-800 rounded font-bold shadow-sm border border-gray-200 text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-9 text-center font-bold text-gray-700">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                    className="w-6 h-6 bg-white hover:bg-gray-200 text-gray-800 rounded font-bold shadow-sm border border-gray-200 text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[65vh] border border-gray-200 rounded-xl bg-slate-950 p-2 flex justify-center">
              <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}>
                <canvas
                  ref={cropCanvasRef}
                  className="touch-none cursor-crosshair max-w-full h-auto block rounded shadow"
                  onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                  onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                  onMouseUp={handlePointerUp}
                  onTouchStart={(e) => {
                    const t = e.touches[0];
                    handlePointerDown(t.clientX, t.clientY);
                  }}
                  onTouchMove={(e) => {
                    const t = e.touches[0];
                    handlePointerMove(t.clientX, t.clientY);
                  }}
                  onTouchEnd={handlePointerUp}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setStep("upload");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={runStraighten}
                disabled={processing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition-all"
              >
                {processing ? "सीधा हो रहा है..." : "कागज़ सीधा करें व आगे बढ़ें →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Controls, Quick Presets & Guaranteed Target KB */}
        {step === "filter" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-6 border border-gray-200 shadow-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              
              {/* Orientation Mode */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  A4 पेज मोड (Orientation)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      orientation === "portrait"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-semibold"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>📄 Portrait (खड़ा A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      orientation === "landscape"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-semibold"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>📃 Landscape (आड़ा A4)</span>
                  </button>
                </div>
              </div>

              {/* Exact Target KB Slider with Quick Presets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span>फ़ाइल साइज़ लिमिट (10 KB से 200 KB):</span>
                  <span className="text-emerald-700 font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-gray-200 shadow-sm">
                    {targetKb} KB
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 pb-1">
                  {[
                    { label: "20 KB (SSC)", kb: 20 },
                    { label: "50 KB (Sign)", kb: 50 },
                    { label: "100 KB (Doc)", kb: 100 },
                    { label: "200 KB (HD)", kb: 200 }
                  ].map((p) => (
                    <button
                      key={p.kb}
                      type="button"
                      onClick={() => setTargetKb(p.kb)}
                      className={`py-1 text-[11px] rounded border font-semibold transition-all ${
                        targetKb === p.kb
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">फ़िल्टर मोड</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["magic", "bw", "grayscale", "original"] as FilterMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFilter(m)}
                      className={`py-1.5 rounded-lg text-xs capitalize transition-all border ${
                        filter === m
                          ? "bg-emerald-600 border-emerald-600 text-white font-medium shadow-sm"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {m === "magic" ? "मैजिक सफ़ेद" : m === "bw" ? "B&W" : m === "grayscale" ? "ग्रे" : "मूल"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brightness & Contrast */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600 w-16">सफेदी:</span>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-gray-700 w-8 text-right">{brightness}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600 w-16">कंट्रास्ट:</span>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-gray-700 w-8 text-right">{contrast}</span>
                </div>
              </div>
            </div>

            {/* Document Preview Canvas with Real-Time Size Display */}
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center text-xs font-medium text-gray-600 gap-2">
                <span>लाइव प्रीव्यू ({orientation === "portrait" ? "खड़ा A4" : "आड़ा A4"})</span>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-mono font-bold">
                    तैयार JPG: ~{actualJpgKb || targetKb} KB
                  </span>
                  <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200 font-mono font-bold">
                    तैयार PDF: ~{actualPdfKb || targetKb} KB
                  </span>
                </div>
              </div>
              <div className="max-h-[50vh] overflow-auto border border-gray-200 rounded-xl bg-gray-100 p-3 flex justify-center">
                <canvas ref={previewCanvasRef} className="max-h-[46vh] w-auto block rounded shadow border border-gray-300" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("crop")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
              >
                ← दोबारा क्रॉप करें
              </button>

              <div className="flex items-center gap-3">
                {jpgDownloadUrl && (
                  <a
                    href={jpgDownloadUrl}
                    download={`document-${actualJpgKb || targetKb}kb.jpg`}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-sm border border-gray-300 shadow-sm transition-all"
                  >
                    डाउनलोड JPG (~{actualJpgKb || targetKb} KB)
                  </a>
                )}

                {pdfDownloadUrl && (
                  <a
                    href={pdfDownloadUrl}
                    download={`document-${actualPdfKb || targetKb}kb-${orientation}.pdf`}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    {generating ? "तैयार हो रहा है..." : `डाउनलोड A4 PDF (~${actualPdfKb || targetKb} KB)`}
                  </a>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
