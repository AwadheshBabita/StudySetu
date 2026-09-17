"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent, TouchEvent } from "react";

export default function SignatureResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKB, setOrigSizeKB] = useState<number | null>(null);
  const [targetMinKB, setTargetMinKB] = useState<number>(10);
  const [targetMaxKB, setTargetMaxKB] = useState<number>(20);

  // Zoom, Pan, and Rotate Controls
  const [zoom, setZoom] = useState<number>(1); // 1x to 4x
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // -180 to +180

  // Enhancements
  const [cleanBgThreshold, setCleanBgThreshold] = useState<number>(180);
  const [inkDarkness, setInkDarkness] = useState<number>(40);
  const [autoClean, setAutoClean] = useState<boolean>(true);

  // Dragging state for canvas pan
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultKB, setResultKB] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultKB(null);
    setRotation(0);
    setZoom(1.2);
    setPanX(0);
    setPanY(0);
    setOrigSizeKB(Number((file.size / 1024).toFixed(1)));

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        imgElementRef.current = img;
        setImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Render Signature to Canvas (with Zoom, Pan, Rotate, and Filters)
  const renderSignatureToCanvas = (canvas: HTMLCanvasElement, forExport = false) => {
    const img = imgElementRef.current;
    if (!img) return;

    const targetW = 560;
    const targetH = 240;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pure White Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.save();
    // Center of canvas
    ctx.translate(targetW / 2 + panX, targetH / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Base fitting scale multiplied by user zoom factor
    const baseScale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
    const effectiveScale = baseScale * zoom;

    const drawW = img.naturalWidth * effectiveScale;
    const drawH = img.naturalHeight * effectiveScale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Alignment Guideline in Preview Mode Only
    if (!forExport) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, targetH / 2);
      ctx.lineTo(targetW, targetH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Paper Whitening & Shadow Removal
    if (autoClean) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (gray >= cleanBgThreshold) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          const factor = Math.max(0, (gray / cleanBgThreshold) * (1 - inkDarkness / 100));
          const inkVal = Math.round(factor * 255);
          data[i] = inkVal;
          data[i + 1] = inkVal;
          data[i + 2] = inkVal;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  // Touch and Mouse Drag / Pan Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - panX, y: clientY - panY });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPanX(Math.round(clientX - dragStart.x));
    setPanY(Math.round(clientY - dragStart.y));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Update Live Preview when any control changes
  useEffect(() => {
    if (imageSrc && previewCanvasRef.current && imgElementRef.current) {
      renderSignatureToCanvas(previewCanvasRef.current, false);
    }
  }, [imageSrc, zoom, panX, panY, rotation, cleanBgThreshold, inkDarkness, autoClean]);

  const processSignature = async () => {
    if (!imageSrc || !imgElementRef.current) return;
    setProcessing(true);

    try {
      const exportCanvas = document.createElement("canvas");
      renderSignatureToCanvas(exportCanvas, true);

      // Binary search compression for target KB
      const targetBytes = targetMaxKB * 1024;
      const minBytes = targetMinKB * 1024;
      let minQ = 0.1;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob = await new Promise<Blob | null>((res) => {
          exportCanvas.toBlob((b) => res(b), "image/jpeg", midQ);
        });

        if (blob) {
          bestBlob = blob;
          if (blob.size > targetBytes) {
            maxQ = midQ;
          } else if (blob.size < minBytes && maxQ - minQ > 0.05) {
            minQ = midQ;
          } else {
            break;
          }
        }
      }

      if (bestBlob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(bestBlob));
        setResultKB(Number((bestBlob.size / 1024).toFixed(1)));
      }
    } catch (err) {
      console.error(err);
      alert("हस्ताक्षर प्रोसेस करने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Signature Resizer & Crop Zoomer
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          A4 पेज से सिर्फ सिग्नेचर वाले हिस्से को ज़ूम करें, सीधा करें और 10-20 KB में पाएँ
        </p>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            ✍️ हस्ताक्षर फ़ोटो चुनें
          </button>
          <p className="text-xs text-slate-400 mt-2">पूरे A4 कागज़ या कॉपी की फ़ोटो अपलोड करें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {origSizeKB && (
              <p className="text-xs font-semibold text-slate-600 text-center">
                मूल साइज़: <span className="text-blue-600">{origSizeKB} KB</span>
              </p>
            )}

            {/* Live Interactive Canvas with Touch/Mouse Drag */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-100 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase mb-2">
                <span>👇 उंगली से खींचकर सिग्नेचर को बीच में लाएँ (Drag to Move)</span>
                <button
                  type="button"
                  onClick={() => { setPanX(0); setPanY(0); setZoom(1); setRotation(0); }}
                  className="text-blue-600 hover:underline"
                >
                  रीसेट करें
                </button>
              </div>

              <div className="bg-white p-1 rounded-lg border-2 border-blue-400 shadow-md max-w-full overflow-hidden touch-none cursor-move">
                <canvas
                  ref={previewCanvasRef}
                  onMouseDown={(e: MouseEvent<HTMLCanvasElement>) => handlePointerDown(e.clientX, e.clientY)}
                  onMouseMove={(e: MouseEvent<HTMLCanvasElement>) => handlePointerMove(e.clientX, e.clientY)}
                  onMouseUp={handlePointerUp}
                  onTouchStart={(e: TouchEvent<HTMLCanvasElement>) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e: TouchEvent<HTMLCanvasElement>) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handlePointerUp}
                  className="max-h-48 max-w-full object-contain select-none"
                />
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>🔍 ज़ूम इन / आउट (Zoom Area): <span className="text-blue-600">{zoom.toFixed(1)}x</span></span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.2).toFixed(1))))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(6, Number((z + 0.2).toFixed(1))))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[11px] text-slate-400">
                अगर A4 पेज बड़ा है, तो ज़ूम बढ़ाकर केवल अपने हस्ताक्षर वाले हिस्से को बॉक्स में फ़िट करें।
              </p>
            </div>

            {/* Rotation Slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>🔄 तिरछापन सीधा करें (Rotate): <span className="text-blue-600">{rotation}°</span></span>
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                >
                  0° रीसेट
                </button>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Paper Whitening & Ink Contrast */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoClean}
                  onChange={(e) => setAutoClean(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  ✨ कागज़ की छाया हटाएँ (Pure White Paper & Dark Ink)
                </span>
              </label>

              {autoClean && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      बैकग्राउंड सफ़ेदी: {cleanBgThreshold}
                    </label>
                    <input
                      type="range"
                      min="130"
                      max="220"
                      value={cleanBgThreshold}
                      onChange={(e) => setCleanBgThreshold(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      स्याही की गहराई: {inkDarkness}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={inkDarkness}
                      onChange={(e) => setInkDarkness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Target KB Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  न्यूनतम साइज़ (Min KB)
                </label>
                <input
                  type="number"
                  value={targetMinKB}
                  onChange={(e) => setTargetMinKB(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  अधिकतम साइज़ (Max KB)
                </label>
                <input
                  type="number"
                  value={targetMaxKB}
                  onChange={(e) => setTargetMaxKB(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            <button
              onClick={processSignature}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-sm"
            >
              {processing ? "हस्ताक्षर प्रोसेस हो रहा है..." : "✂️ हस्ताक्षर क्रॉप, ज़ूम व रिसाइज़ करें"}
            </button>
          </div>
        )}

        {/* Download Box */}
        {resultKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center space-y-3">
            <p className="text-sm font-bold text-green-800">हस्ताक्षर सफलतापूर्वक क्रॉप व तैयार हो गया!</p>
            <p className="text-xs text-green-700">
              नया साइज़: <strong>{resultKB} KB</strong> | अनुपात: <strong>560×240 px</strong>
            </p>

            <div className="border border-green-300 rounded-lg p-2 bg-white max-w-xs mx-auto shadow-sm">
              <img src={downloadUrl} alt="Processed Signature" className="mx-auto max-h-24 object-contain" />
            </div>

            <a
              href={downloadUrl}
              download="studysetu-signature.jpg"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
            >
              📥 डाउनलोड सटीक हस्ताक्षर
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
