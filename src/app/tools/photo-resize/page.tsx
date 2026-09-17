"use client";

import { useState, useRef, ChangeEvent } from "react";

interface ExamPreset {
  id: string;
  name: string;
  wPx: number;
  hPx: number;
  minKB: number;
  maxKB: number;
  note: string;
}

const presets: ExamPreset[] = [
  { id: "ssc", name: "SSC (CGL, CHSL, GD, MTS)", wPx: 413, hPx: 531, minKB: 20, maxKB: 50, note: "3.5 x 4.5 cm @ 300 DPI" },
  { id: "upsc", name: "UPSC (CSE, NDA, CDS)", wPx: 350, hPx: 450, minKB: 20, maxKB: 300, note: "3.5 x 4.5 cm (DOP अनिवार्य)" },
  { id: "uppolice", name: "UP Police Constable / SI", wPx: 413, hPx: 531, minKB: 20, maxKB: 50, note: "3.5 x 4.5 cm (हल्का बैकग्राउंड)" },
  { id: "ibps", name: "IBPS / SBI Bank PO & Clerk", wPx: 200, hPx: 230, minKB: 20, maxKB: 50, note: "4.5 x 3.5 cm" },
  { id: "railway", name: "Railway RRB (NTPC, Group D)", wPx: 320, hPx: 400, minKB: 20, maxKB: 50, note: "साफ़ चेहरा और दोनों कान" },
  { id: "custom", name: "कस्टम (अपनी पसंद से)", wPx: 413, hPx: 531, minKB: 20, maxKB: 50, note: "मनचाहे पिक्सेल और KB दर्ज करें" },
];

export default function PhotoResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKB, setOrigSizeKB] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("ssc");
  const [widthPx, setWidthPx] = useState<number>(413);
  const [heightPx, setHeightPx] = useState<number>(531);
  const [minKB, setMinKB] = useState<number>(20);
  const [maxKB, setMaxKB] = useState<number>(50);

  // DOP / Name Stamp Controls
  const [enableStamp, setEnableStamp] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("");
  const [dopDate, setDopDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [stampMode, setStampMode] = useState<"margin" | "overlay">("margin");

  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultKB, setResultKB] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultKB(null);
    setOrigSizeKB(Number((file.size / 1024).toFixed(1)));

    try {
      if (typeof window !== "undefined" && "createImageBitmap" in window) {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const c = document.createElement("canvas");
        c.width = bitmap.width;
        c.height = bitmap.height;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          setImageSrc(c.toDataURL("image/jpeg", 0.95));
          return;
        }
      }
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = presets.find((x) => x.id === presetId);
    if (p && presetId !== "custom") {
      setWidthPx(p.wPx);
      setHeightPx(p.hPx);
      setMinKB(p.minKB);
      setMaxKB(p.maxKB);
    }
  };

  const processPhoto = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Determine photo drawing bounds
      const stampHeight = enableStamp ? Math.round(heightPx * 0.18) : 0;
      const photoAreaHeight = (enableStamp && stampMode === "margin") ? (heightPx - stampHeight) : heightPx;

      // Smart crop/fit into photo area preserving center
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const targetRatio = widthPx / photoAreaHeight;

      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (imgRatio > targetRatio) {
        sw = img.naturalHeight * targetRatio;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / targetRatio;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, widthPx, photoAreaHeight);

      // Draw DOP / Name Stamp if enabled
      if (enableStamp) {
        const stampY = heightPx - stampHeight;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, stampY, widthPx, stampHeight);

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, stampY, widthPx, stampHeight);

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const fontSize = Math.max(12, Math.round(stampHeight * 0.32));
        ctx.font = `bold ${fontSize}px sans-serif`;

        const formattedDate = dopDate ? dopDate.split("-").reverse().join("-") : "";

        if (candidateName.trim()) {
          ctx.fillText(candidateName.toUpperCase(), widthPx / 2, stampY + stampHeight * 0.35);
          ctx.font = `600 ${Math.round(fontSize * 0.88)}px sans-serif`;
          ctx.fillText(`DOP: ${formattedDate}`, widthPx / 2, stampY + stampHeight * 0.72);
        } else {
          ctx.fillText(`DOP: ${formattedDate}`, widthPx / 2, stampY + stampHeight / 2);
        }
      }

      // Step-compression to fit exact target KB range
      const targetMaxBytes = maxKB * 1024;
      const targetMinBytes = minKB * 1024;
      let minQ = 0.1;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((b) => res(b), "image/jpeg", midQ);
        });

        if (blob) {
          bestBlob = blob;
          if (blob.size > targetMaxBytes) {
            maxQ = midQ;
          } else if (blob.size < targetMinBytes && maxQ - minQ > 0.05) {
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
      alert("फोटो रिसाइज करने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Photo Resizer (सरकारी परीक्षा विशेष)
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          SSC, UPSC, UP Police के सटीक साइज, सेंटीमीटर और DOP/नाम स्टैम्प के साथ
        </p>

        {/* Upload Box */}
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
            📸 पासपोर्ट फोटो चुनें
          </button>
          <p className="text-xs text-slate-400 mt-2">कैमरे से खींची या गैलरी की फोटो अपलोड करें</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {origSizeKB && (
              <p className="text-xs font-semibold text-slate-600 text-center">
                मूल साइज़: <span className="text-blue-600">{origSizeKB} KB</span>
              </p>
            )}

            {/* Exam Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                परीक्षा प्रीसेट चुनें (Exam Preset)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetChange(p.id)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition ${
                      selectedPreset === p.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold block">{p.name}</span>
                    <span className={`text-[10px] block mt-0.5 ${selectedPreset === p.id ? "text-blue-100" : "text-slate-400"}`}>
                      {p.minKB}-{p.maxKB} KB
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom dimensions if needed */}
            {selectedPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">चौड़ाई (Width Px)</label>
                  <input
                    type="number"
                    value={widthPx}
                    onChange={(e) => setWidthPx(Number(e.target.value))}
                    className="w-full border p-2 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ऊँचाई (Height Px)</label>
                  <input
                    type="number"
                    value={heightPx}
                    onChange={(e) => setHeightPx(Number(e.target.value))}
                    className="w-full border p-2 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* DOP / Name Stamp Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableStamp}
                  onChange={(e) => setEnableStamp(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  🏷️ नाम और फोटो की तारीख (DOP) स्टैम्प जोड़ें
                </span>
              </label>

              {enableStamp && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">अभ्यर्थी का नाम (वैकल्पिक)</label>
                      <input
                        type="text"
                        placeholder="उदा. AMIT KUMAR"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full border border-slate-300 p-2 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">फोटो की तारीख (Date of Photo)</label>
                      <input
                        type="date"
                        value={dopDate}
                        onChange={(e) => setDopDate(e.target.value)}
                        className="w-full border border-slate-300 p-2 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={stampMode === "margin"}
                        onChange={() => setStampMode("margin")}
                        name="stampMode"
                      />
                      <span>बिना चेहरा काटे नीचे पट्टी जोड़ें (सुरक्षित)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={stampMode === "overlay"}
                        onChange={() => setStampMode("overlay")}
                        name="stampMode"
                      />
                      <span>फ़ोटो के ऊपर ओवरले करें</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={processPhoto}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "फोटो तैयार हो रही है..." : "⚡ परीक्षा अनुसार फोटो रिसाइज करें"}
            </button>
          </div>
        )}

        {/* Result Area */}
        {resultKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center space-y-3">
            <p className="text-sm font-bold text-green-800">पासपोर्ट फोटो सफलतापूर्वक तैयार हो गई!</p>
            <p className="text-xs text-green-700">
              साइज़: <strong>{resultKB} KB</strong> | रेजोल्यूशन: <strong>{widthPx} × {heightPx} px</strong>
            </p>

            <div className="border border-green-300 rounded-lg p-2 bg-white inline-block shadow-sm">
              <img src={downloadUrl} alt="Processed Passport Photo" className="max-h-52 object-contain rounded" />
            </div>

            <div>
              <a
                href={downloadUrl}
                download={`studysetu-photo-${selectedPreset}.jpg`}
                className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
              >
                📥 डाउनलोड पासपोर्ट फोटो
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
