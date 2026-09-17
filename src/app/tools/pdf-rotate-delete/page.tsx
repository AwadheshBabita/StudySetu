"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument, degrees } from "pdf-lib";

interface PageMeta {
  pageNumber: number;
  rotation: number;
  isDeleted: boolean;
  thumbnailUrl: string;
}

export default function PdfRotateDeletePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(f);
    setLoading(true);

    try {
      const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any;
      const fileBytes = new Uint8Array(await f.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: fileBytes, disableWorker: true }).promise;

      const metaList: PageMeta[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        metaList.push({
          pageNumber: i,
          rotation: 0,
          isDeleted: false,
          thumbnailUrl: canvas.toDataURL("image/jpeg", 0.7),
        });
      }
      setPages(metaList);
    } catch (err) {
      console.error(err);
      alert("PDF लोड करने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  const rotatePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const toggleDelete = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === pageIndex ? { ...p, isDeleted: !p.isDeleted } : p
      )
    );
  };

  const processAndDownload = async () => {
    if (!file) return;
    const activePages = pages.filter((p) => !p.isDeleted);
    if (activePages.length === 0) {
      alert("कम से कम 1 पेज बचा होना चाहिए!");
      return;
    }

    setProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(await file.arrayBuffer());
      const outDoc = await PDFDocument.create();

      for (const p of pages) {
        if (p.isDeleted) continue;
        const [copiedPage] = await outDoc.copyPages(srcDoc, [p.pageNumber - 1]);
        const currentRot = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((currentRot + p.rotation) % 360));
        outDoc.addPage(copiedPage);
      }

      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("PDF सेव करने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          PDF Page Rotate & Delete
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          पेजों को सीधा घुमाएँ और अनचाहे पेजों को हटाकर नई PDF डाउनलोड करें
        </p>

        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".pdf,application/pdf"
            id="pdfRotateInput"
            onChange={handleFile}
            className="hidden"
          />
          <label
            htmlFor="pdfRotateInput"
            className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📄 PDF चुनें
          </label>
        </div>

        {loading && (
          <p className="mt-6 text-center text-sm font-semibold text-blue-600">
            पेज लोड हो रहे हैं, कृपया प्रतीक्षा करें...
          </p>
        )}

        {pages.length > 0 && !loading && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={p.pageNumber}
                  className={`relative p-3 border rounded-xl flex flex-col items-center justify-between transition ${
                    p.isDeleted
                      ? "opacity-40 bg-red-50 border-red-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-full flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>पेज {p.pageNumber}</span>
                    {p.rotation > 0 && <span>{p.rotation}°</span>}
                  </div>

                  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded bg-white border">
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${p.pageNumber}`}
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform"
                    />
                    {p.isDeleted && (
                      <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center font-bold text-red-700 text-xs">
                        हटाया गया
                      </div>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between mt-3 space-x-2">
                    <button
                      type="button"
                      onClick={() => rotatePage(idx)}
                      disabled={p.isDeleted}
                      className="flex-1 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                    >
                      🔄 90° घुमाएँ
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDelete(idx)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                        p.isDeleted
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      {p.isDeleted ? "रखें" : "हटाएँ"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={processAndDownload}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "नई PDF तैयार हो रही है..." : "बदलाव लागू करें और सेव करें"}
            </button>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">PDF सफलतापूर्वक तैयार हो गई!</p>
            <a
              href={downloadUrl}
              download="studysetu-modified.pdf"
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
