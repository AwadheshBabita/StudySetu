"use client";

import { useState, useRef, ChangeEvent } from "react";

interface SignPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  targetKB: number;
}

const SIGN_PRESETS: SignPreset[] = [
  { id: "custom", name: "Custom (कस्टम साइज)", width: 280, height: 120, targetKB: 15 },
  { id: "ssc", name: "SSC (CGL, CHSL, MTS) — 10-20 KB (4x2 cm)", width: 280, height: 120, targetKB: 15 },
  { id: "upsc", name: "UPSC Civil Services — 20-50 KB", width: 350, height: 150, targetKB: 30 },
  { id: "uppolice", name: "UP Police Constable/SI — 5-20 KB", width: 240, height: 100, targetKB: 12 },
  { id: "ibps", name: "IBPS / SBI Bank — 10-20 KB (140x60 px)", width: 280, height: 120, targetKB: 15 },
  { id: "railway", name: "RRB Railway — 10-20 KB", width: 260, height: 110, targetKB: 14 },
];

export default function SignatureResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("ssc");
  const [width, setWidth] = useState<number>(280);
  const [height, setHeight] = useState<number>(120);
  const [targetKB, setTargetKB] = useState<number>(15);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);

  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<{ sizeKB: number; width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultInfo(null);

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = SIGN_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      setWidth(preset.width);
      setHeight(preset.height);
      setTargetKB(preset.targetKB);
    }
  };

  const processSignature = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      // Fill clean pure white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Fit with aspect ratio preservation (no stretch)
      const scale = Math.min(width / img.width, height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Enhance Contrast (Deep Black Signature, Clean White Paper)
      if (enhanceContrast) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          // Thresholding for clean signature
          if (avg > 185) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          } else {
            const factor = avg * 0.75; // darken ink
            d[i] = factor;
            d[i + 1] = factor;
            d[i + 2] = factor;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Exact KB binary search compression
      let minQ = 0.05;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;
      const targetBytes = targetKB * 1024;

      for (let i = 0; i < 6; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob: Blob = await new Promise((res) => {
          canvas.toBlob((b) => res(b!), "image/jpeg", midQ);
        });

        bestBlob = blob;
        if (blob.size > targetBytes) {
          maxQ = midQ;
        } else {
          minQ = midQ;
        }
      }

      if (bestBlob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(bestBlob);
        setDownloadUrl(url);
        setResultInfo({
          sizeKB: Number((bestBlob.size / 1024).toFixed(1)),
          width,
          height,
        });
      }
    } catch (err) {
      console.error(err);
      alert("हस्ताक्षर प्रोसेस करने में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Signature Resizer (Exam & Forms)
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          हस्ताक्षर को 10-20 KB में सटीक अनुपात और गहरी स्याही के साथ सेट करें
        </p>

        {/* Upload Input */}
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
            ✍️ हस्ताक्षर फोटो चुनें
          </button>
          <p className="text-xs text-slate-500 mt-2">सफ़ेद कागज़ पर किए गए साइन की फ़ोटो चुनें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {/* Exam Preset Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                एग्ज़ाम प्रीसेट चुनें (1-Click)
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
              >
                {SIGN_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => {
                    setWidth(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target KB</label>
                <input
                  type="number"
                  value={targetKB}
                  onChange={(e) => {
                    setTargetKB(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Ink Enhancer Toggle */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceContrast}
                  onChange={(e) => setEnhanceContrast(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  कागज़ को साफ़ सफ़ेद और हस्ताक्षर को गहरा काला (High Contrast) करें
                </span>
              </label>
            </div>

            {/* Process Button */}
            <button
              onClick={processSignature}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "हस्ताक्षर तैयार हो रहा है..." : "हस्ताक्षर रिसाइज करें"}
            </button>
          </div>
        )}

        {/* Result */}
        {resultInfo && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">हस्ताक्षर सफलतापूर्वक तैयार हो गया!</p>
            <p className="text-xs text-green-700 mt-1">
              साइज: <strong>{resultInfo.sizeKB} KB</strong> | डाइमेंशन: <strong>{resultInfo.width}x{resultInfo.height} px</strong>
            </p>
            <a
              href={downloadUrl}
              download="studysetu-signature.jpg"
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड हस्ताक्षर
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
