"use client";

import { useState, useRef, ChangeEvent } from "react";

type Format = "image/jpeg" | "image/png" | "image/webp";

export default function ImageFormatConverterPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<Format>("image/png");
  const [quality, setQuality] = useState<number>(0.92);
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
    setFileName(file.name.substring(0, file.name.lastIndexOf('.')) || "image");

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const convertFormat = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), targetFormat, quality);
      });

      if (blob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(blob));
        setResultKB(Number((blob.size / 1024).toFixed(1)));
      }
    } catch (err) {
      console.error(err);
      alert("फॉर्मेट बदलने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  const getExtension = () => {
    if (targetFormat === "image/jpeg") return "jpg";
    if (targetFormat === "image/png") return "png";
    return "webp";
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Image Format Converter
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          JPG, PNG और WebP फॉर्मेट में 1-क्लिक में तुरंत बदलें
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                किस फॉर्मेट में बदलना है?
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as Format)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
              >
                <option value="image/jpeg">JPG / JPEG (फ़ॉर्म्स के लिए सर्वश्रेष्ठ)</option>
                <option value="image/png">PNG (ट्रांसपेरेंट और लॉसलेस)</option>
                <option value="image/webp">WebP (वेबसाइट्स के लिए सबसे हल्का)</option>
              </select>
            </div>

            {targetFormat !== "image/png" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  क्वालिटी: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={convertFormat}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "कन्वर्ट हो रहा है..." : `${getExtension().toUpperCase()} में बदलें`}
            </button>
          </div>
        )}

        {resultKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">कन्वर्ज़न पूरा हुआ!</p>
            <p className="text-xs text-green-700 mt-1">
              फ़ाइल टाइप: <strong>.{getExtension()}</strong> | साइज: <strong>{resultKB} KB</strong>
            </p>
            <a
              href={downloadUrl}
              download={`${fileName}.${getExtension()}`}
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड फ़ाइल
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
