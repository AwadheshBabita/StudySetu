"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

interface PageThumb {
  pageIndex: number; // 0-based
  pageNumber: number; // 1-based
  dataUrl: string;
}

export default function PdfSplitPage() {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
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
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setError("");
    setStatusMsg("");
    setPages([]);
    setSelectedPages([]);
    setLoadingThumbs(true);

    try {
      const arr = new Uint8Array(await uploaded.arrayBuffer());
      const pdf = await PDFDocument.load(arr);
      const count = pdf.getPageCount();

      setFile({
        name: uploaded.name.replace(/\.[^/.]+$/, ""),
        bytes: arr,
        pageCount: count,
      });

      // थंबनेल जनरेट करना
      const pdfjsLib = await import("pdfjs-dist");
      const loadingTask = pdfjsLib.getDocument({ data: arr.slice() });
      const pdfDoc = await loadingTask.promise;

      const thumbs: PageThumb[] = [];
      const allSelected: number[] = [];

      for (let i = 1; i <= count; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          thumbs.push({
            pageIndex: i - 1,
            pageNumber: i,
            dataUrl: canvas.toDataURL("image/jpeg", 0.75),
          });
        }
        allSelected.push(i - 1);
      }

      setPages(thumbs);
      setSelectedPages(allSelected);
    } catch (err: any) {
      console.error(err);
      setError("फ़ाइल पढ़ने में असमर्थ। कृपया सुनिश्चित करें कि PDF पासवर्ड से सुरक्षित न हो।");
    } finally {
      setLoadingThumbs(false);
    }
  };

  const togglePage = (index: number) => {
    if (selectedPages.includes(index)) {
      setSelectedPages(selectedPages.filter((p) => p !== index));
    } else {
      setSelectedPages([...selectedPages, index].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    if (!file) return;
    setSelectedPages(Array.from({ length: file.pageCount }, (_, i) => i));
  };

  const deselectAll = () => {
    setSelectedPages([]);
  };

  // 1. बिना ZIP के सभी फ़ाइलें एक-एक करके सीधे डाउनलोड
  const downloadSeparateFiles = async () => {
    if (!file || selectedPages.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    setBusy(true);
    setStatusMsg("अलग-अलग PDF फ़ाइलें तैयार हो रही हैं...");

    try {
      const srcPdf = await PDFDocument.load(file.bytes);

      for (let i = 0; i < selectedPages.length; i++) {
        const pageIdx = selectedPages[i];
        setStatusMsg(`पेज ${pageIdx + 1} डाउनलोड हो रहा है (${i + 1}/${selectedPages.length})...`);

        const singlePdf = await PDFDocument.create();
        const [copiedPage] = await singlePdf.copyPages(srcPdf, [pageIdx]);
        singlePdf.addPage(copiedPage);

        const pdfBytes = await singlePdf.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name}_Page_${pageIdx + 1}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // ब्राउज़र डाउनलोड ब्लॉक न करे इसलिए 350ms का अंतराल
        await new Promise((res) => setTimeout(res, 350));
        URL.revokeObjectURL(url);
      }

      setStatusMsg("सभी फ़ाइलें सफलतापूर्वक डाउनलोड हो गईं!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "फ़ाइलें डाउनलोड करने में त्रुटि आई।");
    } finally {
      setBusy(false);
    }
  };

  // 2. एक क्लिक में ZIP डाउनलोड
  const downloadAsZip = async () => {
    if (!file || selectedPages.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    setBusy(true);
    setStatusMsg("ZIP फ़ाइल बनाई जा रही है...");

    try {
      const srcPdf = await PDFDocument.load(file.bytes);
      const zip = new JSZip();

      for (let i = 0; i < selectedPages.length; i++) {
        const pageIdx = selectedPages[i];
        setStatusMsg(`ZIP में जोड़ा जा रहा है: पेज ${pageIdx + 1}...`);

        const singlePdf = await PDFDocument.create();
        const [copiedPage] = await singlePdf.copyPages(srcPdf, [pageIdx]);
        singlePdf.addPage(copiedPage);

        const pdfBytes = await singlePdf.save();
        zip.file(`${file.name}_Page_${pageIdx + 1}.pdf`, pdfBytes);
      }

      setStatusMsg("ZIP तैयार हो रही है, डाउनलोड शुरू होने वाला है...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name}_Split_Pages.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setStatusMsg("ZIP फ़ाइल डाउनलोड हो गई!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ZIP बनाने में त्रुटि आई।");
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
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors"
          >
            &larr; PDF हब पर लौटें
          </Link>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            स्मार्ट स्प्लिट टूल
          </span>
        </div>

        {/* मुख्य कार्ड */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-600 text-lg">✂️</span>
              PDF स्प्लिट करें (Split PDF)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              पेजों का लाइव प्रीव्यू देखें और उन्हें अलग-अलग PDF या ZIP में एक क्लिक में निकालें।
            </p>
          </div>

          {/* फ़ाइल चयन */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              PDF फ़ाइल चुनें:
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUpload}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 border border-slate-200 rounded-2xl cursor-pointer p-1"
            />
          </div>

          {/* लोडिंग स्पिनर */}
          {loadingThumbs && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-600">पेजों का प्रीव्यू लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
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
                  कुल पेज: <span className="text-amber-600 font-extrabold">{pages.length}</span> | चुने गए:{" "}
                  <span className="text-blue-600 font-extrabold">{selectedPages.length}</span>
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
                  const isChecked = selectedPages.includes(p.pageIndex);
                  return (
                    <div
                      key={p.pageIndex}
                      onClick={() => togglePage(p.pageIndex)}
                      className={`relative flex flex-col items-center bg-white rounded-xl p-2 cursor-pointer border-2 transition shadow-xs select-none ${
                        isChecked
                          ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30"
                          : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="absolute top-2.5 right-2.5 accent-amber-600 w-4 h-4 cursor-pointer"
                      />
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-auto object-contain rounded border border-slate-100 mb-2 pointer-events-none"
                      />
                      <span className="text-[11px] font-black text-slate-700">
                        पेज {p.pageNumber}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* डाउनलोड ऑप्शन्स पैनल */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-black text-slate-800 block">
                  डाउनलोड विकल्प चुनें:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* विकल्प 1: बिना ZIP एक-एक करके */}
                  <button
                    type="button"
                    disabled={busy || selectedPages.length === 0}
                    onClick={downloadSeparateFiles}
                    className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex flex-col items-center justify-center gap-1 text-center"
                  >
                    <span className="text-base">📥</span>
                    <span>अलग-अलग फाइलें</span>
                    <span className="text-[10px] font-normal text-emerald-100">(बिना ZIP, सीधी PDF)</span>
                  </button>

                  {/* विकल्प 2: ZIP में */}
                  <button
                    type="button"
                    disabled={busy || selectedPages.length === 0}
                    onClick={downloadAsZip}
                    className="py-3 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex flex-col items-center justify-center gap-1 text-center"
                  >
                    <span className="text-base">🗜️</span>
                    <span>ZIP फ़ाइल में</span>
                    <span className="text-[10px] font-normal text-amber-100">(एक क्लिक में सभी)</span>
                  </button>

                  
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
