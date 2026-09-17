"use client";

import { useState, useRef, ChangeEvent } from "react";

interface ExamPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  minKB: number;
  maxKB: number;
  targetKB: number;
}

const PRESETS: ExamPreset[] = [
  { id: "custom", name: "Custom (कस्टम साइज)", width: 350, height: 450, minKB: 20, maxKB: 50, targetKB: 40 },
  { id: "ssc", name: "SSC (CGL, CHSL, MTS) — 20-50 KB", width: 350, height: 450, minKB: 20, maxKB: 50, targetKB: 35 },
  { id: "upsc", name: "UPSC Civil Services — 20-300 KB", width: 350, height: 450, minKB: 20, maxKB: 300, targetKB: 100 },
  { id: "uppolice", name: "UP Police Constable/SI — 20-50 KB", width: 350, height: 450, minKB: 20, maxKB: 50, targetKB: 35 },
  { id: "ibps", name: "IBPS / SBI Bank PO/Clerk — 20-50 KB", width: 200, height: 230, minKB: 20, maxKB: 50, targetKB: 35 },
  { id: "railway", name: "RRB Railway — 20-50 KB", width: 320, height: 400, minKB: 20, maxKB: 50, targetKB: 35 },
];

export default function PhotoResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("ssc");
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(450);
  const [targetKB, setTargetKB] = useState<number>(35);
  
  // Name & Date Stamping
  const [addStamp, setAddStamp] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("");
  const [photoDate, setPhotoDate] = useState<string>("");

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
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      setWidth(preset.width);
      setHeight(preset.height);
      setTargetKB(preset.targetKB);
    }
  };

  const processImage = async () => {
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

      // Draw Main Image
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      let imageDrawHeight = height;
      const stampHeight = addStamp ? Math.round(height * 0.22) : 0;
      if (addStamp) {
        imageDrawHeight = height - stampHeight;
      }

      ctx.drawImage(img, 0, 0, width, imageDrawHeight);

      // Name & Date Stamping Box
      if (addStamp) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, imageDrawHeight, width, stampHeight);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, imageDrawHeight, width, stampHeight);

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const fontSize = Math.max(12, Math.round(width * 0.048));
        ctx.font = `bold ${fontSize}px sans-serif`;

        const textCenterY = imageDrawHeight + stampHeight / 2;
        if (candidateName && photoDate) {
          ctx.fillText(candidateName.toUpperCase(), width / 2, textCenterY - fontSize * 0.65);
          ctx.font = `${Math.round(fontSize * 0.9)}px sans-serif`;
          ctx.fillText(`DOP: ${photoDate}`, width / 2, textCenterY + fontSize * 0.75);
        } else {
          const singleText = candidateName ? candidateName.toUpperCase() : `DOP: ${photoDate}`;
          ctx.fillText(singleText, width / 2, textCenterY);
        }
      }

      // Binary search compression for target KB lock
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
      alert("फोटो प्रोसेस करने में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Photo Resizer (Exam & Forms)
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          सरकारी फॉर्म्स के लिए सटीक KB, पिक्सल और नाम-तारीख जोड़ें
        </p>

        {/* File Input */}
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
          <p className="text-xs text-slate-500 mt-2">JPG, PNG या WebP फ़ाइल अपलोड करें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {/* Exam Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                एग्ज़ाम प्रीसेट चुनें (One-Click)
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Dimensions & Target KB */}
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

            {/* Name & Date on Photo Feature */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addStamp}
                  onChange={(e) => setAddStamp(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-semibold text-slate-800">
                  फोटो पर नाम और तारीख (DOP) लिखें
                </span>
              </label>

              {addStamp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">उम्मीदवार का नाम</label>
                    <input
                      type="text"
                      placeholder="उदा. RAHUL KUMAR"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded-lg text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">तारीख (DOP)</label>
                    <input
                      type="text"
                      placeholder="उदा. 15/09/2026"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={processImage}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "फोटो तैयार हो रही है..." : "फोटो रिसाइज और तैयार करें"}
            </button>
          </div>
        )}

        {/* Result Area */}
        {resultInfo && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">फोटो सफलतापूर्वक तैयार हो गई!</p>
            <p className="text-xs text-green-700 mt-1">
              साइज: <strong>{resultInfo.sizeKB} KB</strong> | डाइमेंशन: <strong>{resultInfo.width}x{resultInfo.height} px</strong>
            </p>
            <a
              href={downloadUrl}
              download="studysetu-photo.jpg"
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
