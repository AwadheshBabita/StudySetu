"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent, TouchEvent } from "react";

type FilterMode = "magic" | "bw" | "grayscale" | "original";

interface Point {
  x: number;
  y: number;
}

export default function DocumentScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [step, setStep] = useState<"capture" | "crop" | "filter">("capture");
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

  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const deskewedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        originalImgRef.current = img;
        setImageSrc(src);
        setStep("crop");

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setCorners([
          { x: Math.round(w * 0.1), y: Math.round(h * 0.1) },
          { x: Math.round(w * 0.9), y: Math.round(h * 0.1) },
          { x: Math.round(w * 0.9), y: Math.round(h * 0.9) },
          { x: Math.round(w * 0.1), y: Math.round(h * 0.9) },
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

    // Draw quadrilateral
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(img.naturalWidth / 200));
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "rgba(37, 99, 235, 0.15)";
    ctx.fill();

    // Draw 4 corner handles
    const radius = Math.max(14, Math.round(img.naturalWidth / 65));
    corners.forEach((p, idx) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#1e3a8a";
      ctx.font = `bold ${Math.round(radius * 0.85)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1}`, p.x, p.y);
    });
  }, [step, corners, imageSrc]);

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
    const thresh = Math.max(35, Math.round(originalImgRef.current.naturalWidth / 22));

    let foundIdx: number | null = null;
    corners.forEach((p, idx) => {
      const dist = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (dist < thresh) foundIdx = idx;
    });

    if (foundIdx !== null) setDraggingIdx(foundIdx);
  };

  const handlePointerMove = (e: any) => {
    if (draggingIdx === null || !originalImgRef.current) return;
    const pt = getCanvasCoords(e);
    const w = originalImgRef.current.naturalWidth;
    const h = originalImgRef.current.naturalHeight;

    setCorners((prev) =>
      prev.map((c, idx) =>
        idx === draggingIdx ? { x: Math.max(0, Math.min(w, pt.x)), y: Math.max(0, Math.min(h, pt.y)) } : c
      )
    );
  };

  const handlePointerUp = () => setDraggingIdx(null);

  // Bilinear Perspective Transform
  const runStraighten = () => {
    if (!originalImgRef.current) return;
    setProcessing(true);

    setTimeout(() => {
      try {
        const img = originalImgRef.current!;
        const [tl, tr, br, bl] = corners;

        const widthTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
        const widthBottom = Math.hypot(br.x - bl.x, br.y - bl.y);
        const targetW = Math.round(Math.max(widthTop, widthBottom));

        const heightLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
        const heightRight = Math.hypot(br.x - tr.x, br.y - tr.y);
        const targetH = Math.round(Math.max(heightLeft, heightRight));

        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const sCtx = srcCanvas.getContext("2d")!;
        sCtx.drawImage(img, 0, 0);
        const sData = sCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;

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

  const applyFilter = (baseCanvas: HTMLCanvasElement, mode: FilterMode, bOffset: number, cOffset: number) => {
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

        r = contrastFactor * (r - 128) + 128 + bOffset;
        g = contrastFactor * (g - 128) + 128 + bOffset;
        b = contrastFactor * (b - 128) + 128 + bOffset;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (mode === "bw") {
          const val = gray > 145 ? 255 : gray < 75 ? 0 : (gray - 75) * (255 / 70);
          d[i] = val;
          d[i + 1] = val;
          d[i + 2] = val;
        } else if (mode === "grayscale") {
          d[i] = Math.min(255, Math.max(0, gray));
          d[i + 1] = Math.min(255, Math.max(0, gray));
          d[i + 2] = Math.min(255, Math.max(0, gray));
        } else if (mode === "magic") {
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
          कैमरे से फ़ोटो खींचें, चारों कोनों से तिरछा कागज़ सीधा करें और साफ़ ज़ेरॉक्स प्रिंट पाएँ
        </p>

        {/* STEP 1: CAPTURE OR UPLOAD */}
        {step === "capture" && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Native Mobile Camera Input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={nativeCameraInputRef}
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => nativeCameraInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 hover:bg-blue-100/50 transition flex flex-col items-center justify-center space-y-3"
            >
              <span className="text-4xl">📸</span>
              <span className="font-bold text-base text-blue-700">कैमरा खोलें व फ़ोटो लें</span>
              <span className="text-xs text-slate-500 text-center">मोबाइल का एचडी कैमरा तुरंत खुलेगा</span>
            </button>

            {/* Gallery Upload */}
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center space-y-3"
            >
              <span className="text-4xl">📁</span>
              <span className="font-bold text-base text-slate-700">गैलरी से चुनें</span>
              <span className="text-xs text-slate-500 text-center">पहले से खींची हुई फ़ोटो अपलोड करें</span>
            </button>
          </div>
        )}

        {/* STEP 2: 4-CORNER PERSPECTIVE CROPPER */}
        {imageSrc && step === "crop" && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <span>👉 चारों नंबर वाले गोल डॉट्स (1, 2, 3, 4) को उंगली से खींचकर मुड़े हुए कागज़ के कोनों पर सेट करें।</span>
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

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setStep("capture"); setImageSrc(null); }}
                className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                ↺ नई तस्वीर लें
              </button>
              <button
                onClick={runStraighten}
                disabled={processing}
                className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-sm"
              >
                {processing ? "कागज़ सीधा हो रहा है..." : "📐 कागज़ सीधा करें (Straighten Paper)"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FILTERS & ENHANCEMENTS */}
        {step === "filter" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase">कागज़ साफ़ करें</span>
              <button
                type="button"
                onClick={() => setStep("crop")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                ↺ फिर से कोने बदलें
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
                download="studysetu-straight-doc.jpg"
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
