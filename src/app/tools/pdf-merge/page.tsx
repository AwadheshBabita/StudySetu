"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface PageThumb {
  id: string;
  fileIndex: number;
  fileName: string;
  pageIndex: number; // 0-based in original file
  pageNumber: number; // 1-based in original file
  dataUrl: string;
}

interface LoadedFile {
  name: string;
  bytes: Uint8Array;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // PDF.js वर्कर सेटअप
  useEffect(() => {
    const initPdfJs = async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    };
    initPdfJs();
  }, []);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setError("");
    setStatusMsg("");
    setPages([]);
    setSelectedPageIds([]);
    setLoadingThumbs(true);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const loaded: LoadedFile[] = [];
      const thumbs: PageThumb[] = [];
      const allSelected: string[] = [];

      for (let fIdx = 0; fIdx < uploadedFiles.length; fIdx++) {
        const upFile = uploadedFiles[fIdx];
        const arr = new Uint8Array(await upFile.arrayBuffer());
        loaded.push({
          name: upFile.name.replace(/\.[^/.]+$/, ""),
          bytes: arr,
        });

        const loadingTask = pdfjsLib.getDocument({ data: arr.slice() });
        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;

        for (let pIdx = 1; pIdx <= pageCount; pIdx++) {
          const page = await pdfDoc.getPage(pIdx);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const uniqueId = `f${fIdx}_p${pIdx}`;
            thumbs.push({
              id: uniqueId,
              fileIndex: fIdx,
              fileName: upFile.name.replace(/\.[^/.]+$/, ""),
              pageIndex: pIdx - 1,
              pageNumber: pIdx,
              dataUrl: canvas.toDataURL("image/jpeg", 0.75),
            });
            allSelected.push(uniqueId);
          }
        }
      }

      setFiles(loaded);
      setPages(thumbs);
      setSelectedPageIds(allSelected);
    } catch (err: any) {
      console.error(err);
      setError("फ़ाइल पढ़ने में असमर्थ। कृपया सुनिश्चित करें कि PDF पासवर्ड से सुरक्षित न हो।");
    } finally {
      setLoadingThumbs(false);
    }
  };

  const togglePage = (id: string) => {
    if (selectedPageIds.includes(id)) {
      setSelectedPageIds(selectedPageIds.filter((pId) => pId !== id));
    } else {
      setSelectedPageIds([...selectedPageIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedPageIds(pages.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedPageIds([]);
  };

  // सभी चुने हुए पेजों को एक ही PDF में मर्ज करना
  const handleMerge = async () => {
    if (files.length === 0 || selectedPageIds.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    setBusy(true);
    setStatusMsg("सभी चुने हुए पेजों को एक PDF में जोड़ा जा रहा है...");

    try {
      const mergedPdf = await PDFDocument.create();

      // फ़ाइलों को कैश करें ताकि बार-बार लोड न करना पड़े
      const loadedDocMap: { [key: number]: PDFDocument } = {};
      for (let i = 0; i < files.length; i++) {
        loadedDocMap[i] = await PDFDocument.load(files[i].bytes);
      }

      // जिस क्रम में ग्रिड में पेजेस हैं, उसी क्रम में जोड़े जाएंगे
      for (const p of pages) {
        if (!selectedPageIds.includes(p.id)) continue;

        const srcDoc = loadedDocMap[p.fileIndex];
        const [copiedPage] = await mergedPdf.copyPages(srcDoc, [p.pageIndex]);
        mergedPdf.addPage(copiedPage);
      }

      setStatusMsg("PDF तैयार हो रही है, डाउनलोड शुरू होने वाला है...");
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Merged_Document_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setStatusMsg("मर्ज की गई PDF सफलतापूर्वक डाउनलोड हो गई!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "PDF मर्ज करने में त्रुटि आई।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* नेविगेशन */}
        <div className="flex items-center justify-between">
          <Link
            href="/tools/pdf-merge-split"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            &larr; PDF हब पर लौटें
          </Link>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
            स्मार्ट मर्ज टूल
          </span>
        </div>

        {/* मुख्य कार्ड */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600 text-lg">📑</span>
              PDF मर्ज करें (Merge PDF)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              कई PDF फ़ाइलों को एक साथ चुनें, पेजों का लाइव प्रीव्यू देखें और गैर-ज़रूरी पेज हटाकर एक नई PDF फ़ाइल बनाएँ।
            </p>
          </div>

          {/* फ़ाइल चयन (मल्टीपल फाइल्स) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              PDF फ़ाइलें चुनें (एक साथ 2 या अधिक फ़ाइलें चुन सकते हैं):
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleUpload}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-2xl cursor-pointer p-1"
            />
          </div>

          {/* लोडिंग स्पिनर */}
          {loadingThumbs && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-600">सभी फ़ाइलों के पेजों का प्रीव्यू लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
            </div>
          )}

          {/* एरर */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* स्टेटस मैसेज */}
          {statusMsg && !error && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
              ⏳ {statusMsg}
            </div>
          )}

          {/* पेजों का प्रीव्यू ग्रिड */}
          {pages.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="text-xs font-bold text-slate-800">
                  कुल फ़ाइलें: <span className="text-indigo-600 font-extrabold">{files.length}</span> | कुल पेज:{" "}
                  <span className="text-indigo-600 font-extrabold">{pages.length}</span> | शामिल पेज:{" "}
                  <span className="text-emerald-600 font-extrabold">{selectedPageIds.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    सभी चुनें
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    सब हटाएं
                  </button>
                </div>
              </div>

              {/* ग्रिड */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[460px] overflow-y-auto p-2 bg-slate-50/70 rounded-2xl border border-slate-200">
                {pages.map((p) => {
                  const isChecked = selectedPageIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => togglePage(p.id)}
                      className={`relative flex flex-col items-center bg-white rounded-xl p-2 cursor-pointer border-2 transition shadow-xs select-none ${
                        isChecked
                          ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30"
                          : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="absolute top-2.5 right-2.5 accent-indigo-600 w-4 h-4 cursor-pointer"
                      />
                      <img
                        src={p.dataUrl}
                        alt={`${p.fileName} Page ${p.pageNumber}`}
                        className="w-full h-auto object-contain rounded border border-slate-100 mb-2 pointer-events-none"
                      />
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px] font-medium" title={p.fileName}>
                        {p.fileName}
                      </span>
                      <span className="text-[11px] font-black text-slate-700">
                        पेज {p.pageNumber}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* सिंगल डाउनलोड बटन */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={busy || selectedPageIds.length === 0}
                  onClick={handleMerge}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📄</span>
                  <span>सभी पेज मर्ज करें और डाउनलोड करें ({selectedPageIds.length} पेज)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
