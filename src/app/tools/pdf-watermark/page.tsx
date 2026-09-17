"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export default function PdfWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("StudySetu");
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotation, setRotation] = useState<number>(45);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(f);
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) {
      alert("कृपया PDF फ़ाइल और वॉटरमार्क टेक्स्ट दोनों दर्ज करें!");
      return;
    }
    setProcessing(true);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        // Center position
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const outBytes = await pdf.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("वॉटरमार्क लगाने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          PDF Watermark Adder
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          PDF के सभी पेजों पर अपना नाम, ब्रांड या सुरक्षा वॉटरमार्क जोड़ें
        </p>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".pdf,application/pdf"
            id="watermarkPdfInput"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="watermarkPdfInput"
            className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📄 PDF फ़ाइल चुनें
          </label>
          {file && (
            <p className="text-xs font-semibold text-slate-600 mt-2 truncate">
              चयनित: {file.name}
            </p>
          )}
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                वॉटरमार्क टेक्स्ट
              </label>
              <input
                type="text"
                placeholder="उदा. StudySetu / Confidential"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  फ़ॉन्ट साइज़: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  पारदर्शिता: {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  एंगल: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={applyWatermark}
              disabled={processing || !watermarkText.trim()}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "वॉटरमार्क लगाया जा रहा है..." : "वॉटरमार्क जोड़ें (Apply Watermark)"}
            </button>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">वॉटरमार्क सफलतापूर्वक जुड़ गया!</p>
            <a
              href={downloadUrl}
              download={`watermarked-${file?.name || "document.pdf"}`}
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड वॉटरमार्क्ड PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
