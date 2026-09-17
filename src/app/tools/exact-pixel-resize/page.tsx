"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function ExactPixelResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(450);
  const [lockAspect, setLockAspect] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [unit, setUnit] = useState<"px" | "cm" | "mm">("px");
  const [dpi, setDpi] = useState<number>(300);

  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<{ width: number; height: number; sizeKB: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultInfo(null);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const toPixels = (value: number): number => {
    if (unit === "cm") return Math.round((value / 2.54) * dpi);
    if (unit === "mm") return Math.round((value / 25.4) * dpi);
    return Math.round(value);
  };

  const processResize = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const finalW = Math.max(1, toPixels(width));
      const finalH = Math.max(1, toPixels(height));

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, finalW, finalH);

      const blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), "image/jpeg", 0.92);
      });

      if (blob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(blob));
        setResultInfo({
          width: finalW,
          height: finalH,
          sizeKB: Number((blob.size / 1024).toFixed(1)),
        });
      }
    } catch (err) {
      console.error(err);
      alert("रिसाइज करने में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Exact Pixel & Dimension Resizer
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          फोटो की चौड़ाई व ऊँचाई को px, cm या mm में सटीक रूप से सेट करें
        </p>

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
            📁 फोटो चुनें
          </button>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">मापक इकाई (Unit)</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white"
                >
                  <option value="px">Pixels (px)</option>
                  <option value="cm">Centimeter (cm)</option>
                  <option value="mm">Millimeter (mm)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Width ({unit})</label>
                <input
                  type="number"
                  step={unit === "px" ? "1" : "0.1"}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Height ({unit})</label>
                <input
                  type="number"
                  step={unit === "px" ? "1" : "0.1"}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span className="text-xs sm:text-sm text-slate-700 font-medium">
                  अनुपात बनाए रखें (Lock Aspect Ratio)
                </span>
              </label>

              {unit !== "px" && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-semibold">DPI:</span>
                  <input
                    type="number"
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="w-16 border border-slate-300 p-1 rounded text-xs text-center"
                  />
                </div>
              )}
            </div>

            <button
              onClick={processResize}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "रिसाइज किया जा रहा है..." : "डाइमेंशन लागू करें"}
            </button>
          </div>
        )}

        {resultInfo && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">फोटो सफलतापूर्वक रिसाइज हो गई!</p>
            <p className="text-xs text-green-700 mt-1">
              अंतिम पिक्सल: <strong>{resultInfo.width}x{resultInfo.height} px</strong> | साइज: <strong>{resultInfo.sizeKB} KB</strong>
            </p>
            <a
              href={downloadUrl}
              download="studysetu-resized.jpg"
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड फोटो
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
