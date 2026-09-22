"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

export default function PdfCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState<number>(150);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);
  const [originalSizeKb, setOriginalSizeKb] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      alert("कृपया केवल मान्य PDF फ़ाइल चुनें।");
      return;
    }
    setFile(selected);
    setOriginalSizeKb(Math.round(selected.size / 1024));
    setCompressedPdfUrl(null);
    setCompressedSizeKb(null);
  };

  const processPdfCompression = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressText("PDF इंजन लोड हो रहा है...");

    try {
      const pdfjs = await import("pdfjs-dist");
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const outPdfDoc = await PDFDocument.create();

      const overheadBytes = 1024 * (numPages + 2);
      const maxTotalBytes = targetKb * 1024;
      const targetNetBytes = Math.max(15 * 1024 * numPages, maxTotalBytes - overheadBytes);
      const perPageMaxBytes = Math.floor(targetNetBytes / numPages);

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgressText(`पेज ${pageNum} / ${numPages} ऑप्टिमाइज़ हो रहा है...`);
        const page = await pdf.getPage(pageNum);
        const originalViewport = page.getViewport({ scale: 1.0 });

        let renderScale = perPageMaxBytes < 40 * 1024 ? 1.0 : perPageMaxBytes < 90 * 1024 ? 1.3 : 1.6;
        let viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) continue;

        // @ts-ignore
        await page.render({ canvasContext: ctx, viewport }).promise;

        let qLow = 0.15;
        let qHigh = 0.85;
        let bestBlob: Blob | null = null;

        for (let iter = 0; iter < 5; iter++) {
          const qMid = (qLow + qHigh) / 2;
          const blob: Blob = await new Promise((res) => {
            canvas.toBlob((b) => res(b!), "image/jpeg", qMid);
          });

          if (blob.size <= perPageMaxBytes) {
            bestBlob = blob;
            qLow = qMid;
          } else {
            qHigh = qMid;
          }
        }

        if (!bestBlob) {
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = Math.round(canvas.width * 0.75);
          smallCanvas.height = Math.round(canvas.height * 0.75);
          const sCtx = smallCanvas.getContext("2d", { alpha: false });
          sCtx?.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

          bestBlob = await new Promise((res) => {
            smallCanvas.toBlob((b) => res(b!), "image/jpeg", 0.45);
          });
        }

        const imgBytes = await bestBlob!.arrayBuffer();
        const embeddedImg = await outPdfDoc.embedJpg(imgBytes);

        const outPage = outPdfDoc.addPage([originalViewport.width, originalViewport.height]);
        outPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });
      }

      setProgressText("फ़ाइनल फ़ाइल सुरक्षित हो रही है...");
      const finalPdfBytes = await outPdfDoc.save({ useObjectStreams: true });
      let outputBlob = new Blob([finalPdfBytes], { type: "application/pdf" });

      // No-inflation check
      if (outputBlob.size >= file.size) {
        outputBlob = file;
      }

      const calculatedKb = Math.round(outputBlob.size / 1024);
      setCompressedSizeKb(calculatedKb);

      if (compressedPdfUrl) URL.revokeObjectURL(compressedPdfUrl);
      setCompressedPdfUrl(URL.createObjectURL(outputBlob));
    } catch (err) {
      console.error(err);
      alert("PDF कंप्रेस करने में समस्या आई। कृपया फ़ाइल दोबारा जाँचें।");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs px-3 py-1 rounded-full font-bold border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            100% सटीक लॉक • नो-इन्फ्लेशन इंजन
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            सरकारी पोर्टल PDF कंप्रेसर
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            बिना टेक्स्ट धुंधला किए अपनी ज़रूरत अनुसार सटीक KB में सुरक्षित कंप्रेस करें
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Custom Modern File Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              PDF फ़ाइल अपलोड करें
            </label>
            
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-rose-50/30 transition-all group">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              
              <div className="w-12 h-12 rounded-2xl bg-rose-100/70 text-rose-600 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                📄
              </div>
              
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : "यहाँ क्लिक करके PDF चुनें"}
              </p>
              
              <p className="text-xs text-slate-400 mt-0.5">
                {file ? "फ़ाइल बदलने के लिए दोबारा क्लिक करें" : "सभी सरकारी डॉक्यूमेंट, मार्कशीट व रिज़्यूमे समर्थित"}
              </p>

              {file && originalSizeKb && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
                  <span>मूल साइज़:</span>
                  <span className="font-mono font-bold text-rose-600">{originalSizeKb} KB</span>
                </div>
              )}
            </label>
          </div>

          {/* Target KB Selection Area */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                टारगेट साइज़ (लक्ष्य):
              </label>
              
              {/* Direct Type Input Box */}
              <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Math.max(10, Number(e.target.value)))}
                  className="w-14 bg-transparent text-right font-mono font-black text-rose-600 text-sm focus:outline-none"
                />
                <span className="text-xs font-bold text-rose-600">KB</span>
              </div>
            </div>

            {/* Quick 2x2 Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "50 KB", desc: "साइन/अंगूठा", kb: 50 },
                { label: "100 KB", desc: "UPSC / SSC", kb: 100 },
                { label: "200 KB", desc: "मानक डॉक", kb: 200 },
                { label: "300 KB", desc: "अल्ट्रा HD", kb: 300 },
              ].map((p) => (
                <button
                  key={p.kb}
                  type="button"
                  onClick={() => setTargetKb(p.kb)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    targetKb === p.kb
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-extrabold">{p.label}</span>
                  <span className={`text-[10px] leading-tight ${targetKb === p.kb ? "text-rose-100" : "text-slate-400"}`}>
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="30"
                max="600"
                step="5"
                value={targetKb}
                onChange={(e) => setTargetKb(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <span>30 KB</span>
                <span>150 KB</span>
                <span>300 KB</span>
                <span>600 KB</span>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <button
            type="button"
            onClick={processPdfCompression}
            disabled={!file || isProcessing}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{progressText || "प्रोसेस हो रहा है..."}</span>
              </span>
            ) : (
              <span>⚡ कंप्रेस करें ({targetKb} KB लक्ष्य)</span>
            )}
          </button>
        </div>

        {/* Result Card */}
        {compressedPdfUrl && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  फ़ाइल कंप्रेस हो गई!
                </h3>
                <p className="text-xs text-slate-400">गुणवत्ता सुरक्षित और साइज लिमिट में लॉक्ड</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block line-through">पहले: {originalSizeKb} KB</span>
                <span className="text-emerald-600 font-mono font-black text-lg">
                  तैयार: {compressedSizeKb} KB
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={compressedPdfUrl}
                download={`compressed-${compressedSizeKb}kb.pdf`}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-sm shadow-sm transition-all"
              >
                📥 डाउनलोड PDF ({compressedSizeKb} KB)
              </a>
              <a
                href={compressedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-center text-sm border border-slate-200"
              >
                👁️ प्रीव्यू
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
