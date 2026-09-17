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
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const deskewedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start Live Camera
  const startCamera = async () => {
    try {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      alert("कैमरा एक्सेस नहीं मिला। कृपया परमिशन दें या फ़ाइल अपलोड का उपयोग करें।");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopCamera();
    loadImage(dataUrl);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const loadImage = (src: string) => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

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

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
          Live CamScanner & Straightener
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          लाइव कैमरे से फ़ोटो खींचें, चारों कोनों से तिरछा कागज़ सीधा करें और साफ़ ज़ेरॉक्स प्रिंट पाएँ
        </p>

        {/* STEP 1: CAPTURE OR UPLOAD */}
        {step === "capture" && !isCameraActive && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={startCamera}
              className="p-8 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 hover:bg-blue-100/50 transition flex flex-col items-center justify-center space-y-3"
            >
              <span className="text-4xl">📷</span>
              <span className="font-bold text-base text-blue-700">लाइव कैमरा से स्कैन करें</span>
              <span className="text-xs text-slate-500 text-center">सीधे कैमरे से कागज़ की तस्वीर लें</span>
            </button>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center space-y-3 cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-4xl">📁</span>
              <span className="font-bold text-base text-slate-700">गैलरी से फ़ोटो चुनें</span>
              <span className="text-xs text-slate-500 text-center">पहले से खींची हुई फ़ोटो अपलोड करें</span>
            </div>
          </div>
        )}

        {/* LIVE CAMERA VIEWFINDER */}
        {isCameraActive && (
          <div className="mt-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[520px] mx-auto border-2 border-blue-500 shadow-lg">
              <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />
              {/* Document Alignment Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-white/80 text-xs bg-black/40 px-3 py-1 rounded-full backdrop-blur">
                  कागज़ को इस फ़्रेम में रखें
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={stopCamera}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
              >
                ✕ रद्द करें
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md flex items-center space-x-2"
              >
                <span>📸</span>
                <span>फ़ोटो लें (Capture)</span>
              </button>
            </div>
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
