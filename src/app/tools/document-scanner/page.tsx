"use client";

import { useState, useRef, ChangeEvent } from "react";

type FilterMode = "original" | "magic" | "bw" | "grayscale";

export default function DocumentScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("magic");
  const [brightness, setBrightness] = useState<number>(10);
  const [contrast, setContrast] = useState<number>(20);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

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
        applyFilter(img, filter, brightness, contrast);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (
    img: HTMLImageElement,
    mode: FilterMode,
    bOffset: number,
    cOffset: number
  ) => {
    setProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      if (mode !== "original") {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const contrastFactor = (259 * (cOffset + 255)) / (255 * (259 - cOffset));

        for (let i = 0; i < d.length; i += 4) {
          let r = d[i];
          let g = d[i + 1];
          let b = d[i + 2];

          // Brightness & Contrast adjustment
          r = contrastFactor * (r - 128) + 128 + bOffset;
          g = contrastFactor * (g - 128) + 128 + bOffset;
          b = contrastFactor * (b - 128) + 128 + bOffset;

          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (mode === "bw") {
            // High contrast Xerox B&W
            const val = gray > 140 ? 255 : gray < 70 ? 0 : (gray - 70) * (255 / 70);
            d[i] = val;
            d[i + 1] = val;
            d[i + 2] = val;
          } else if (mode === "grayscale") {
            d[i] = Math.min(255, Math.max(0, gray));
            d[i + 1] = Math.min(255, Math.max(0, gray));
            d[i + 2] = Math.min(255, Math.max(0, gray));
          } else if (mode === "magic") {
            // Boost whites, keep colored text readable
            d[i] = Math.min(255, Math.max(0, r > 150 ? r + 25 : r * 0.9));
            d[i + 1] = Math.min(255, Math.max(0, g > 150 ? g + 25 : g * 0.9));
            d[i + 2] = Math.min(255, Math.max(0, b > 150 ? b + 25 : b * 0.9));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          setDownloadUrl(URL.createObjectURL(blob));
        }
        setProcessing(false);
      }, "image/jpeg", 0.92);
    } catch {
      setProcessing(false);
    }
  };

  const updateSettings = (newFilter: FilterMode, newB: number, newC: number) => {
    setFilter(newFilter);
    setBrightness(newB);
    setContrast(newC);
    if (originalImgRef.current) {
      applyFilter(originalImgRef.current, newFilter, newB, newC);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Document Scanner & Enhancer
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          कागज़ व रसीदों की फ़ोटो को साफ़, सफ़ेद और स्पष्ट ज़ेरॉक्स स्टाइल में बदलें
        </p>

        {/* Upload */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
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
            📸 डॉक्यूमेंट फ़ोटो चुनें
          </button>
          <p className="text-xs text-slate-500 mt-2">कैमरे से ली गई कॉपी, नोट्स या सर्टिफिकेट अपलोड करें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-6">
            {/* Filter Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                स्कैन इफ़ेक्ट (Filter Preset)
              </label>
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
                    onClick={() => updateSettings(f.id as FilterMode, brightness, contrast)}
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
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  उजाला (Brightness): {brightness}
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => updateSettings(filter, Number(e.target.value), contrast)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  गहराई (Contrast): {contrast}
                </label>
                <input
                  type="range"
                  min="-30"
                  max="80"
                  value={contrast}
                  onChange={(e) => updateSettings(filter, brightness, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Live Preview */}
            {downloadUrl && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-2 text-center">
                <img
                  src={downloadUrl}
                  alt="Enhanced Document"
                  className="max-h-96 mx-auto rounded object-contain shadow-sm"
                />
              </div>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="studysetu-scanned-doc.jpg"
                className="block text-center w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition"
              >
                📥 साफ़ डॉक्यूमेंट डाउनलोड करें (Download)
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
