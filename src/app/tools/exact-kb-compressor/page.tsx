"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function ExactKbCompressorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKB, setOrigSizeKB] = useState<number | null>(null);
  const [targetKB, setTargetKB] = useState<number>(50);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultKB, setResultKB] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultKB(null);
    setOrigSizeKB(Number((file.size / 1024).toFixed(1)));

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const compressExact = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const targetBytes = targetKB * 1024;
      let minQ = 0.02;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((b) => res(b), "image/jpeg", midQ);
        });

        if (blob) {
          bestBlob = blob;
          if (blob.size > targetBytes) {
            maxQ = midQ;
          } else {
            minQ = midQ;
          }
        }
      }

      if (bestBlob && bestBlob.size > targetBytes) {
        let currentScale = 0.9;
        while (currentScale > 0.3) {
          const scaledCanvas = document.createElement("canvas");
          scaledCanvas.width = Math.round(img.naturalWidth * currentScale);
          scaledCanvas.height = Math.round(img.naturalHeight * currentScale);
          const sCtx = scaledCanvas.getContext("2d");
          if (sCtx) {
            sCtx.imageSmoothingEnabled = true;
            sCtx.imageSmoothingQuality = "high";
            sCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
            const scaledBlob = await new Promise<Blob | null>((res) => {
              scaledCanvas.toBlob((b) => res(b), "image/jpeg", 0.75);
            });
            if (scaledBlob) {
              bestBlob = scaledBlob;
              if (scaledBlob.size <= targetBytes) break;
            }
          }
          currentScale -= 0.1;
        }
      }

      if (bestBlob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(bestBlob);
        setDownloadUrl(url);
        setResultKB(Number((bestBlob.size / 1024).toFixed(1)));
      }
    } catch (err) {
      console.error(err);
      alert("कंप्रेशन में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Exact KB Compressor
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          फोटो की क्वालिटी बनाए रखते हुए मनचाहे साइज (KB) में फिक्स करें
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
          <p className="text-xs text-slate-500 mt-2">JPG, PNG या WebP सपोर्टेड</p>
        </div>

        {imageSrc && (
          <div className="mt-6 space-y-5">
            {origSizeKB && (
              <p className="text-xs font-semibold text-slate-600 text-center">
                मूल साइज: <span className="text-blue-600">{origSizeKB} KB</span>
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                टारगेट साइज (KB)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="5"
                  max="5000"
                  value={targetKB}
                  onChange={(e) => setTargetKB(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
                />
                <div className="flex space-x-1">
                  {[20, 50, 100, 200].map((quickVal) => (
                    <button
                      key={quickVal}
                      type="button"
                      onClick={() => setTargetKB(quickVal)}
                      className="px-2.5 py-1 text-xs border rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium"
                    >
                      {quickVal}K
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={compressExact}
              disabled={processing || targetKB <= 0}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "हाई-क्वालिटी कम्प्रेशन जारी है..." : `सटीक ${targetKB} KB में बदलें`}
            </button>
          </div>
        )}

        {resultKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">कम्प्रेशन सफल!</p>
            <p className="text-xs text-green-700 mt-1">
              नया साइज: <strong>{resultKB} KB</strong> (क्वालिटी प्रिजर्व्ड)
            </p>
            <a
              href={downloadUrl}
              download="studysetu-compressed.jpg"
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
