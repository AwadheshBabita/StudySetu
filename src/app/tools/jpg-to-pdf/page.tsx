"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

type PageOrientation = "portrait" | "landscape";
type FilterMode = "original" | "magic" | "bw" | "grayscale";

interface Point {
  x: number;
  y: number;
}

export default function JpgToPdfPage() {
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
  const [actualKb, setActualKb] = useState<number | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);

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

  // Render Interactive Dewarping Surface with Magnifier
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

    // Dark backdrop overlay
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Document Cutout Window
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

    // Laser Grid Lines
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = Math.max(3, Math.round(img.naturalWidth / 280));
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.stroke();

    // Subtle 3x3 internal alignment grid for perfect perspective feel
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = Math.max(1, Math.round(img.naturalWidth / 600));
    for (let i = 1; i <= 2; i++) {
      const t = i / 3;
      // Horizontal grid
      const hx1 = corners[0].x + (corners[3].x - corners[0].x) * t;
      const hy1 = corners[0].y + (corners[3].y - corners[0].y) * t;
      const hx2 = corners[1].x + (corners[2].x - corners[1].x) * t;
      const hy2 = corners[1].y + (corners[2].y - corners[1].y) * t;
      ctx.beginPath();
      ctx.moveTo(hx1, hy1);
      ctx.lineTo(hx2, hy2);
      ctx.stroke();

      // Vertical grid
      const vx1 = corners[0].x + (corners[1].x - corners[0].x) * t;
      const vy1 = corners[0].y + (corners[1].y - corners[0].y) * t;
      const vx2 = corners[3].x + (corners[2].x - corners[3].x) * t;
      const vy2 = corners[3].y + (corners[2].y - corners[3].y) * t;
      ctx.beginPath();
      ctx.moveTo(vx1, vy1);
      ctx.lineTo(vx2, vy2);
      ctx.stroke();
    }

    // High Precision Touch Corner Handles
    const handleRadius = Math.max(16, Math.round(img.naturalWidth / 50));
    corners.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = activeCorner === i ? "#f59e0b" : "#10b981";
      ctx.fill();
      ctx.lineWidth = Math.max(3, Math.round(handleRadius / 3));
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Target Crosshair
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.round(handleRadius * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // Mobile Magnifier Lens (उंगली के ऊपर लाइव ज़ूम लेंस)
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

      // 2.5x Zoom Image under finger
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

      // Lens Reticle Crosshair
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - 16, ly);
      ctx.lineTo(lx + 16, ly);
      ctx.moveTo(lx, ly - 16);
      ctx.lineTo(lx, ly + 16);
      ctx.stroke();

      // Lens Outer Border
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

  // TRUE PERSPECTIVE HOMOGRAPHY WARP (कागज़ को 100% समतल सीधा A4 बनाना)
  const runStraighten = () => {
    if (!originalImgRef.current) return;
    setProcessing(true);

    setTimeout(() => {
      try {
        const img = originalImgRef.current!;
        const [c0, c1, c2, c3] = corners;

        // Calculate true natural aspect ratio from quad corners
        const topW = Math.hypot(c1.x - c0.x, c1.y - c0.y);
        const botW = Math.hypot(c2.x - c3.x, c2.y - c3.y);
        const outW = Math.round(Math.max(topW, botW));

        const leftH = Math.hypot(c3.x - c0.x, c3.y - c0.y);
        const rightH = Math.hypot(c2.x - c1.x, c2.y - c1.y);
        const outH = Math.round(Math.max(leftH, rightH));

        // High resolution warp canvas
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(100, outW);
        canvas.height = Math.max(100, outH);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Inverse projective mapping for pixel-perfect straight rectangular output
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

        // Bilinear forward-backward mapping without gaps or lines
        for (let y = 0; y < oh; y++) {
          const v = y / (oh - 1);
          // Left to right interpolations
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

  // Ultra-Crisp A4 Sheet Placement & Filters
  const applyFilters = () => {
    const cropped = rawCroppedCanvasRef.current;
    if (!cropped) return;

    // True standard ISO A4 Ratio (1 : 1.4142)
    const a4W = orientation === "portrait" ? 1414 : 2000;
    const a4H = orientation === "portrait" ? 2000 : 1414;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = a4W;
    finalCanvas.height = a4H;
    const ctx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Pure White Studio Sheet
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, a4W, a4H);

    // Smart Margins: 3.5% padding so document looks beautifully printed
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

    // Document Text Sharpener & Background Whiteness
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
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else if (filter === "grayscale") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const clamped = Math.max(0, Math.min(255, gray));
        d[i] = clamped;
        d[i + 1] = clamped;
        d[i + 2] = clamped;
      } else if (filter === "magic") {
        // Smart CamScanner Magic Whiteness
        const maxVal = Math.max(r, g, b);
        if (maxVal > 156) {
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
        } else {
          d[i] = Math.max(0, Math.min(255, r * 0.82));
          d[i + 1] = Math.max(0, Math.min(255, g * 0.82));
          d[i + 2] = Math.max(0, Math.min(255, b * 0.82));
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

    setJpgDownloadUrl(finalCanvas.toDataURL("image/jpeg", 0.96));
  };

  useEffect(() => {
    if (step === "filter") {
      applyFilters();
    }
  }, [step, filter, brightness, contrast, orientation]);

  // Binary Search Exact KB PDF Engine
  const generateFinalPdf = async () => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    setPdfGenerating(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const pageWidth = orientation === "portrait" ? 595.28 : 841.89;
      const pageHeight = orientation === "portrait" ? 841.89 : 595.28;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const targetBytes = targetKb * 1024;
      let lowQ = 0.05;
      let highQ = 0.98;
      let bestBlob: Blob | null = null;
      let currentBytes = 0;

      for (let iter = 0; iter < 7; iter++) {
        const midQ = (lowQ + highQ) / 2;
        const blob: Blob = await new Promise((res) => {
          preview.toBlob((b) => res(b!), "image/jpeg", midQ);
        });

        currentBytes = blob.size;
        bestBlob = blob;

        if (Math.abs(currentBytes - targetBytes) < targetBytes * 0.05) {
          break;
        }
        if (currentBytes > targetBytes) {
          highQ = midQ;
        } else {
          lowQ = midQ;
        }
      }

      const imageBytes = await bestBlob!.arrayBuffer();
      const embeddedImage = await pdfDoc.embedJpg(imageBytes);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });

      const pdfBytes = await pdfDoc.save();
      const finalBlob = new Blob([pdfBytes], { type: "application/pdf" });
      setActualKb(Math.round(finalBlob.size / 1024));

      if (pdfDownloadUrl) URL.revokeObjectURL(pdfDownloadUrl);
      const newUrl = URL.createObjectURL(finalBlob);
      setPdfDownloadUrl(newUrl);
    } catch {
      alert("PDF तैयार करने में समस्या आई।");
    } finally {
      setPdfGenerating(false);
    }
  };

  useEffect(() => {
    if (step === "filter") {
      generateFinalPdf();
    }
  }, [step, targetKb, orientation, filter, brightness, contrast]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            JPG से A4 PDF कनवर्टर (सरकारी फॉर्म व मार्कशीट)
          </h1>
          <p className="text-gray-600 text-sm">
            4-कॉर्नर कटिंग, Portrait/Landscape स्विच और 10 से 200 KB सटीक स्लाइडर
          </p>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-emerald-500 shadow-sm transition-colors">
            <input
              type="file"
              accept="image/*"
              id="doc-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl font-bold">
                +
              </div>
              <div>
                <span className="text-lg font-medium text-gray-900 block">
                  कागज़ या मार्कशीट की फोटो चुनें
                </span>
                <span className="text-xs text-gray-500">JPG, PNG या WEBP फाइल चुनें</span>
              </div>
            </label>
          </div>
        )}

        {/* Step 2: Next-Gen Perspective Crop with Magnifier */}
        {step === "crop" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-semibold text-gray-900">कागज़ के 4 कोने सेट करें</h2>
                <p className="text-xs text-emerald-600 font-medium">
                  💡 किसी भी कोने को दबाएँ—सटीक सेटिंग के लिए ज़ूम लेंस ऊपर दिखेगा
                </p>
              </div>

              {/* Zoom Screen Controls */}
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-600 font-medium">कैनवस ज़ूम:</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                  className="w-7 h-7 bg-white hover:bg-gray-200 text-gray-800 rounded font-bold shadow-sm border border-gray-200"
                >
                  -
                </button>
                <span className="text-xs font-mono w-10 text-center font-bold text-gray-700">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                  className="w-7 h-7 bg-white hover:bg-gray-200 text-gray-800 rounded font-bold shadow-sm border border-gray-200"
                >
                  +
                </button>
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

        {/* Step 3: Controls, Orientation & 10-200 KB Slider */}
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

              {/* Exact Target KB Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span>फ़ाइल साइज़ लिमिट (10 KB से 200 KB):</span>
                  <span className="text-emerald-700 font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-gray-200 shadow-sm">
                    {targetKb} KB
                  </span>
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
                <div className="flex justify-between text-[11px] text-gray-500 font-mono font-medium">
                  <span>10 KB</span>
                  <span>50 KB</span>
                  <span>100 KB</span>
                  <span>150 KB</span>
                  <span>200 KB</span>
                </div>
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

              {/* Live Brightness & Contrast */}
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

            {/* Document Preview Canvas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-gray-600">
                <span>लाइव प्रीव्यू ({orientation === "portrait" ? "खड़ा A4" : "आड़ा A4"})</span>
                {actualKb && (
                  <span className="text-emerald-700 font-mono font-bold">
                    तैयार PDF: ~{actualKb} KB
                  </span>
                )}
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
                    download="document.jpg"
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-sm border border-gray-300 shadow-sm transition-all"
                  >
                    डाउनलोड JPG
                  </a>
                )}

                {pdfDownloadUrl && (
                  <a
                    href={pdfDownloadUrl}
                    download={`document-${targetKb}kb-${orientation}.pdf`}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    {pdfGenerating ? "तैयार हो रहा है..." : `डाउनलोड A4 PDF (${targetKb} KB)`}
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
