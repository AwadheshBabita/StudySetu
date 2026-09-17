"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";

export default function SignatureResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKB, setOrigSizeKB] = useState<number | null>(null);
  const [targetMinKB, setTargetMinKB] = useState<number>(10);
  const [targetMaxKB, setTargetMaxKB] = useState<number>(20);

  // Enhancements & Alignment
  const [rotation, setRotation] = useState<number>(0); // -180 to +180 deg
  const [cleanBgThreshold, setCleanBgThreshold] = useState<number>(180);
  const [inkDarkness, setInkDarkness] = useState<number>(40);
  const [autoClean, setAutoClean] = useState<boolean>(true);

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

  // Live Canvas Preview renderer
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

    // Save context for rotation
    ctx.save();
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale to fit nicely with margins
    const scale = Math.min((targetW - 50) / img.naturalWidth, (targetH - 50) / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Alignment Guideline in preview mode only
    if (!forExport) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, targetH / 2);
      ctx.lineTo(targetW, targetH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Shadow Removal & Paper Whitening
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

  // Trigger preview update on changes
  useEffect(() => {
    if (imageSrc && previewCanvasRef.current && imgElementRef.current) {
      renderSignatureToCanvas(previewCanvasRef.current, false);
    }
  }, [imageSrc, rotation, cleanBgThreshold, inkDarkness, autoClean]);

  const processSignature = async () => {
    if (!imageSrc || !imgElementRef.current) return;
    setProcessing(true);

    try {
      const exportCanvas = document.createElement("canvas");
      renderSignatureToCanvas(exportCanvas, true);

      // Binary search compression for exact KB
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
          Signature Resizer & Straightener
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          तिरछे हस्ताक्षर को 0°–180° तक सीधा करें, छाया हटाएँ और 10–20 KB में फ़िक्स करें
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
          <p className="text-xs text-slate-400 mt-2">सफ़ेद कागज़ पर किए गए साइन की फ़ोटो चुनें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {origSizeKB && (
              <p className="text-xs font-semibold text-slate-600 text-center">
                मूल साइज़: <span className="text-blue-600">{origSizeKB} KB</span>
              </p>
            )}

            {/* Live Visual Canvas Preview */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-100 flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                लाइव प्रीव्यू (समतल गाइडलाइन के साथ)
              </span>
              <div className="bg-white p-1 rounded-lg border shadow-sm max-w-full overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  className="max-h-36 max-w-full object-contain"
                />
              </div>
            </div>

            {/* Rotation Controls (-180 to +180) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🔄 हस्ताक्षर सीधा करें (Rotate Angle): <span className="text-blue-600 font-black">{rotation}°</span>
                </label>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => Math.max(-180, r - 5))}
                    className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    -5°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation(0)}
                    className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                  >
                    0° रीसेट
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => Math.min(180, r + 5))}
                    className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    +5°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90 > 180 ? -180 + (r + 90 - 180) : r + 90))}
                    className="px-2 py-0.5 text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100"
                  >
                    +90°
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[11px] text-slate-500">
                स्लाइडर को आगे-पीछे करके हस्ताक्षर को ठीक नीली मध्य रेखा के समानांतर सीधा करें।
              </p>
            </div>

            {/* Shadow Removal & Contrast Controls */}
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
                      स्याही की गहराई (Contrast): {inkDarkness}%
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
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "हस्ताक्षर प्रोसेस हो रहा है..." : "हस्ताक्षर रिसाइज़ व सीधा करें"}
            </button>
          </div>
        )}

        {/* Download Box */}
        {resultKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center space-y-3">
            <p className="text-sm font-bold text-green-800">हस्ताक्षर पूरी तरह सीधा और साफ़ हो चुका है!</p>
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
              📥 डाउनलोड सीधा हस्ताक्षर
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
