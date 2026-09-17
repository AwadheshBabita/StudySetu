"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [origSizeKB, setOrigSizeKB] = useState<number | null>(null);
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [targetPreset, setTargetPreset] = useState<number>(200); // 100, 200, 300 KB
  const [customKB, setCustomKB] = useState<number>(150);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [compressedKB, setCompressedKB] = useState<number | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setCompressedKB(null);
    setProgressText("");

    setFile(f);
    setOrigSizeKB(Number((f.size / 1024).toFixed(1)));
  };

  const compressPdf = async () => {
    if (!file) return;
    setProcessing(true);

    const desiredTargetKB = mode === "preset" ? targetPreset : customKB;
    setProgressText("PDF पेज लोड हो रहे हैं...");

    try {
      const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any;
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const sourcePdf = await pdfjs.getDocument({ data: fileBytes, disableWorker: true }).promise;
      const totalPages = sourcePdf.numPages;

      // Target size budget per page roughly calculates initial rendering scale
      const perPageBudgetKB = desiredTargetKB / Math.max(1, totalPages);
      let renderScale = 1.25;
      let initialQuality = 0.75;

      if (perPageBudgetKB < 40) {
        renderScale = 0.9;
        initialQuality = 0.55;
      } else if (perPageBudgetKB < 80) {
        renderScale = 1.1;
        initialQuality = 0.68;
      }

      const outPdf = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        setProgressText(`पेज ${i} / ${totalPages} कंप्रेस किया जा रहा है...`);
        const page = await sourcePdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Render page as compressed JPEG image
        const imgBlob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas blob error"))), "image/jpeg", initialQuality);
        });

        const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
        const embeddedImg = await outPdf.embedJpg(imgBytes);

        // Keep standard PDF points scale (72 DPI reference)
        const standardViewport = page.getViewport({ scale: 1.0 });
        const outPage = outPdf.addPage([standardViewport.width, standardViewport.height]);
        outPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: standardViewport.width,
          height: standardViewport.height,
        });
      }

      setProgressText("अंतिम कंप्रेस्ड PDF तैयार हो रही है...");
      const finalBytes = await outPdf.save();
      const finalBlob = new Blob([finalBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(finalBlob));
      setCompressedKB(Number((finalBlob.size / 1024).toFixed(1)));
    } catch (err) {
      console.error(err);
      alert("PDF कंप्रेस करने में समस्या आई।");
    } finally {
      setProcessing(false);
      setProgressText("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          PDF Compressor (Target KB Mode)
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          सरकारी फॉर्म्स के लिए PDF को 100 KB, 200 KB या मनचाहे साइज़ में कंप्रेस करें
        </p>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".pdf,application/pdf"
            id="pdfCompressInput"
            onChange={handleFile}
            className="hidden"
          />
          <label
            htmlFor="pdfCompressInput"
            className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📄 PDF फ़ाइल चुनें
          </label>
          <p className="text-xs text-slate-400 mt-2">100% इन-डिवाइस सुरक्षित प्रोसेसिंग — कोई सर्वर अपलोड नहीं</p>
        </div>

        {file && origSizeKB && (
          <div className="mt-6 space-y-5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-600 truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border">
                मूल: {origSizeKB} KB
              </span>
            </div>

            {/* Target Mode Selector */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                टारगेट साइज़ चुनें (Target Size)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "< 100 KB", value: 100 },
                  { label: "< 200 KB (मानक)", value: 200 },
                  { label: "< 300 KB", value: 300 },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => { setMode("preset"); setTargetPreset(p.value); }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      mode === "preset" && targetPreset === p.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`text-xs font-bold ${mode === "custom" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  ⚙️ कस्टम KB दर्ज करें
                </button>
                {mode === "custom" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={customKB}
                      onChange={(e) => setCustomKB(Number(e.target.value))}
                      className="w-24 border border-slate-300 p-1.5 rounded-lg text-xs font-bold bg-white text-center"
                    />
                    <span className="text-xs font-semibold text-slate-500">KB</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={compressPdf}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? progressText || "कंप्रेस हो रहा है..." : "🗜️ PDF कंप्रेस करें"}
            </button>
          </div>
        )}

        {/* Compressed Download Box */}
        {compressedKB && downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center space-y-3">
            <p className="text-sm font-bold text-green-800">PDF सफलतापूर्वक कंप्रेस हो गई!</p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span className="text-slate-500 line-through">पहले: {origSizeKB} KB</span>
              <span className="text-green-700 font-bold text-sm">अब: {compressedKB} KB</span>
              {origSizeKB && (
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                  -{Math.round(((origSizeKB - compressedKB) / origSizeKB) * 100)}% बचत
                </span>
              )}
            </div>

            <a
              href={downloadUrl}
              download={`compressed-${file?.name || "document.pdf"}`}
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
            >
              📥 डाउनलोड कंप्रेस्ड PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
