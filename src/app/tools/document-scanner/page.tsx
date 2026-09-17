"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent, TouchEvent } from "react";

type FilterMode = "magic" | "bw" | "grayscale" | "original";

interface Point {
  x: number;
  y: number;
}

export default function DocumentScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [step, setStep] = useState<"crop" | "filter">("crop");
  const [filter, setFilter] = useState<FilterMode>("magic");
  const [brightness, setBrightness] = useState<number>(10);
  const [contrast, setContrast] = useState<number>(25);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // 4 Corner Points for Perspective Transform
  const [corners, setCorners] = useState<Point[]>([
    { x: 40, y: 40 },
    { x: 360, y: 40 },
    { x: 360, y: 460 },
    { x: 40, y: 460 },
  ]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const deskewedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setStep("crop");

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        originalImgRef.current = img;
        setImageSrc(src);

        // Auto-initialize 4 corners inside image bounds
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setCorners([
          { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
          { x: Math.round(w * 0.92), y: Math.round(h * 0.08) },
          { x: Math.round(w * 0.92), y: Math.round(h * 0.92) },
          { x: Math.round(w * 0.08), y: Math.round(h * 0.92) },
        ]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Draw Interactive Editor (Image + 4 Corner Pins + Polygon Line)
  useEffect(() => {
    if (step !== "crop" || !originalImgRef.current || !editorCanvasRef.current) return;
    const img = originalImgRef.current;
    const canvas = editorCanvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    // Draw connecting quadrilateral
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(img.naturalWidth / 200));
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.stroke();

    // Fill transparent blue overlay inside crop region
    ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
    ctx.fill();

    // Draw 4 handles
    const radius = Math.max(12, Math.round(img.naturalWidth / 70));
    corners.forEach((p, idx) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#1e3a8a";
      ctx.font = `bold ${Math.round(radius * 0.9)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1}`, p.x, p.y);
    });
  }, [step, corners, imageSrc]);

  // Coordinate mapper from Display CSS to Canvas Real Size
  const getCanvasCoords = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const handlePointerDown = (e: any) => {
    const pt = getCanvasCoords(e);
    if (!originalImgRef.current) return;
    const thresh = Math.max(35, Math.round(originalImgRef.current.naturalWidth / 25));

    let foundIdx: number | null = null;
    corners.forEach((p, idx) => {
      const dist = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (dist < thresh) foundIdx = idx;
    });

    if (foundIdx !== null) {
      setDraggingIdx(foundIdx);
    }
  };

  const handlePointerMove = (e: any) => {
    if (draggingIdx === null || !originalImgRef.current) return;
    const pt = getCanvasCoords(e);
    const w = originalImgRef.current.naturalWidth;
    const h = originalImgRef.current.naturalHeight;

    const boundedX = Math.max(0, Math.min(w, pt.x));
    const boundedY = Math.max(0, Math.min(h, pt.y));

    setCorners((prev) =>
      prev.map((c, idx) => (idx === draggingIdx ? { x: boundedX, y: boundedY } : c))
    );
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
  };

  // Bilinear interpolation warp to straighten paper
  const runStraighten = () => {
    if (!originalImgRef.current) return;
    setProcessing(true);

    setTimeout(() => {
      try {
        const img = originalImgRef.current!;
        const [tl, tr, br, bl] = corners;

        // Estimated unwarped dimensions
        const widthTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
        const widthBottom = Math.hypot(br.x - bl.x, br.y - bl.y);
        const targetW = Math.round(Math.max(widthTop, widthBottom));

        const heightLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
        const heightRight = Math.hypot(br.x - tr.x, br.y - tr.y);
        const targetH = Math.round(Math.max(heightLeft, heightRight));

        // Source Canvas
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const sCtx = srcCanvas.getContext("2d")!;
        sCtx.drawImage(img, 0, 0);
        const sData = sCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;

        // Dest Canvas
        const destCanvas = document.createElement("canvas");
        destCanvas.width = targetW;
        destCanvas.height = targetH;
        const dCtx = destCanvas.getContext("2d")!;
        const dImgData = dCtx.createImageData(targetW, targetH);
        const dData = dImgData.data;

        const sw = srcCanvas.width;
        const sh = srcCanvas.height;

        for (let y = 0; y < targetH; y++) {
          const v = y / targetH;
          for (let x = 0; x < targetW; x++) {
            const u = x / targetW;

            // Bilinear map
            const srcX = Math.round(
              (1 - u) * (1 - v) * tl.x +
              u * (1 - v) * tr.x +
              u * v * br.x +
              (1 - u) * v * bl.x
            );
            const srcY = Math.round(
              (1 - u) * (1 - v) * tl.y +
              u * (1 - v) * tr.y +
              u * v * br.y +
              (1 - u) * v * bl.y
            );

            const destIdx = (y * targetW + x) * 4;
            if (srcX >= 0 && srcX < sw && srcY >= 0 && srcY < sh) {
              const srcIdx = (srcY * sw + srcX) * 4;
              dData[destIdx] = sData[srcIdx];
              dData[destIdx + 1] = sData[srcIdx + 1];
              dData[destIdx + 2] = sData[srcIdx + 2];
              dData[destIdx + 3] = 255;
            }
          }
        }

        dCtx.putImageData(dImgData, 0, 0);
        deskewedCanvasRef.current = destCanvas;
        setStep("filter");
        applyFilter(destCanvas, filter, brightness, contrast);
      } catch (err) {
        console.error(err);
        alert("कागज़ सीधा करने में समस्या आई।");
      } finally {
        setProcessing(false);
      }
    }, 50);
  };

  const applyFilter = (
    baseCanvas: HTMLCanvasElement,
    mode: FilterMode,
    bOffset: number,
    cOffset: number
  ) => {
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = baseCanvas.width;
    finalCanvas.height = baseCanvas.height;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(baseCanvas, 0, 0);

    if (mode !== "original") {
      const imgData = ctx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
      const d = imgData.data;
      const contrastFactor = (259 * (cOffset + 255)) / (255 * (259 - cOffset));

      for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        // Contrast & brightness
        r = contrastFactor * (r - 128) + 128 + bOffset;
        g = contrastFactor * (g - 128) + 128 + bOffset;
        b = contrastFactor * (b - 128) + 128 + bOffset;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (mode === "bw") {
          // Sharp Xerox contrast
          const val = gray > 145 ? 255 : gray < 75 ? 0 : (gray - 75) * (255 / 70);
          d[i] = val;
          d[i + 1] = val;
          d[i + 2] = val;
        } else if (mode === "grayscale") {
          d[i] = Math.min(255, Math.max(0, gray));
          d[i + 1] = Math.min(255, Math.max(0, gray));
          d[i + 2] = Math.min(255, Math.max(0, gray));
        } else if (mode === "magic") {
          // Boost paper white, enhance text & stamp sharpness
          d[i] = Math.min(255, Math.max(0, r > 140 ? r + 30 : r * 0.88));
          d[i + 1] = Math.min(255, Math.max(0, g > 140 ? g + 30 : g * 0.88));
          d[i + 2] = Math.min(255, Math.max(0, b > 140 ? b + 30 : b * 0.88));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    finalCanvas.toBlob((blob) => {
      if (blob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(blob));
      }
    }, "image/jpeg", 0.95);
  };

  const updateFilters = (newFilter: FilterMode, newB: number, newC: number) => {
    setFilter(newFilter);
    setBrightness(newB);
    setContrast(newC);
    if (deskewedCanvasRef.current) {
      applyFilter(deskewedCanvasRef.current, newFilter, newB, newC);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Smart Document Scanner & Straightener
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          तिरछी फ़ोटो के चारों कोनों को पकड़कर सीधा करें और साफ़ ज़ेरॉक्स प्रिंट में बदलें
        </p>

        {/* Upload Button */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-5 text-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📸 डॉक्यूमेंट या मुड़ी फ़ोटो चुनें
          </button>
        </div>

        {/* STEP 1: INTERACTIVE 4-CORNER CROPPER */}
        {imageSrc && step === "crop" && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <span>👉 <strong>कोने पकड़ें:</strong> चारों नंबर वाले डॉट्स (1, 2, 3, 4) को उंगली से खींचकर कागज़ के चारों कोनों पर सेट करें।</span>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 touch-none">
              <canvas
                ref={editorCanvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className="max-h-[500px] max-w-full object-contain cursor-crosshair"
              />
            </div>

            <button
              onClick={runStraighten}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-sm sm:text-base"
            >
              {processing ? "कागज़ सीधा हो रहा है..." : "📐 कागज़ सीधा करें (Straighten Paper)"}
            </button>
          </div>
        )}

        {/* STEP 2: FILTERS & ENHANCEMENTS */}
        {step === "filter" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase">कागज़ साफ़ करें</span>
              <button
                type="button"
                onClick={() => setStep("crop")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                ↺ फिर से कोने सेट करें
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "magic", label: "✨ Magic Color" },
                { id: "bw", label: "📄 B&W Xerox" },
                { id: "grayscale", label: "🔘 Grayscale" },
                { id: "original", label: "🖼️ Original" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateFilters(f.id as FilterMode, brightness, contrast)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    filter === f.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  उजाला (Brightness): {brightness}
                </label>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={brightness}
                  onChange={(e) => updateFilters(filter, Number(e.target.value), contrast)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  गहराई (Contrast / Sharpness): {contrast}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="70"
                  value={contrast}
                  onChange={(e) => updateFilters(filter, brightness, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Live Result Preview */}
            {downloadUrl && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-2 text-center">
                <img
                  src={downloadUrl}
                  alt="Enhanced Document"
                  className="max-h-[480px] mx-auto rounded object-contain shadow-sm"
                />
              </div>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="studysetu-straight-scanned-doc.jpg"
                className="block text-center w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition text-sm sm:text-base"
              >
                📥 सीधा व साफ़ डॉक्यूमेंट डाउनलोड करें
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
