"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface PdfItem {
  id: string;
  file: File;
  name: string;
  originalKb: number;
  compressedKb: number | null;
  downloadUrl: string | null;
  status: "idle" | "processing" | "done" | "error";
  errorMsg?: string;
  modeUsed?: string;
}

export default function PdfCompressorPage() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState("");

  // सेटिंग्स: डिफ़ॉल्ट यूनिट हमेशा KB, डिफ़ॉल्ट टारगेट 100 KB
  const [targetKb, setTargetKb] = useState<number>(100);
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [customInputValue, setCustomInputValue] = useState<string>("100");

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: PdfItem[] = [];

    Array.from(fileList).forEach((f) => {
      if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          name: f.name,
          originalKb: Math.round(f.size / 1024),
          compressedKb: null,
          downloadUrl: null,
          status: "idle",
        });
      }
    });

    if (newItems.length === 0) {
      alert("कृपया केवल मान्य PDF फ़ाइलें चुनें।");
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUnitChange = (newUnit: "KB" | "MB") => {
    setUnit(newUnit);
    if (newUnit === "MB") {
      const inMb = (targetKb / 1024).toFixed(1).replace(/\.0$/, "");
      setCustomInputValue(inMb);
    } else {
      setCustomInputValue(String(targetKb));
    }
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      if (unit === "MB") {
        setTargetKb(Math.round(num * 1024));
      } else {
        setTargetKb(Math.round(num));
      }
    }
  };

  const setPreset = (kbValue: number) => {
    setTargetKb(kbValue);
    if (kbValue >= 1024) {
      setUnit("MB");
      setCustomInputValue((kbValue / 1024).toString());
    } else {
      setUnit("KB");
      setCustomInputValue(kbValue.toString());
    }
  };

  // 1. सुरक्षित इंजन (Stream / Structure Optimization) - 0% Text/Font Loss
  const compressLosslessStream = async (arrayBuffer: ArrayBuffer): Promise<Uint8Array | null> => {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      const savedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      return savedBytes;
    } catch {
      return null;
    }
  };

  // 2. स्कैंड / हेवी डॉक्यूमेंट इंजन (CMap सुरक्षित रेंडरिंग)
  const compressPdfSafely = async (
    item: PdfItem,
    desiredKb: number
  ): Promise<{ compressedKb: number; url: string; modeUsed: string }> => {
    const arrayBuffer = await item.file.arrayBuffer();

    // पहले बिना टेक्स्ट छुए शुद्ध स्ट्रीम ऑप्टिमाइज़ेशन करें
    const streamResult = await compressLosslessStream(arrayBuffer);
    const streamKb = streamResult ? Math.round(streamResult.byteLength / 1024) : Infinity;

    if (streamResult && streamKb <= desiredKb * 1.15) {
      const blob = new Blob([streamResult.buffer as ArrayBuffer], { type: "application/pdf" });
      return {
        compressedKb: streamKb,
        url: URL.createObjectURL(blob),
        modeUsed: "स्ट्रक्चर ऑप्टिमाइज़",
      };
    }

    const pdfjs = await import("pdfjs-dist");
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const outPdfDoc = await PDFDocument.create();

    const overheadBytes = 1024 * (numPages + 2);
    const maxTotalBytes = desiredKb * 1024;
    const perPageMaxBytes = Math.floor(Math.max(20 * 1024, (maxTotalBytes - overheadBytes) / numPages));

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      let currentScale = perPageMaxBytes < 40 * 1024 ? 1.4 : perPageMaxBytes < 80 * 1024 ? 1.7 : 2.0833;

      const viewport = page.getViewport({ scale: currentScale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) continue;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // @ts-ignore
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: "print",
      }).promise;

      let qLow = 0.28;
      let qHigh = 0.88;
      let bestBlob: Blob | null = null;
      let bestDiff = Infinity;

      for (let iter = 0; iter < 4; iter++) {
        const qMid = (qLow + qHigh) / 2;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", qMid));
        const diff = blob.size - perPageMaxBytes;

        if (blob.size <= perPageMaxBytes || Math.abs(diff) < bestDiff) {
          bestBlob = blob;
          bestDiff = Math.abs(diff);
        }

        if (blob.size > perPageMaxBytes) {
          qHigh = qMid;
        } else {
          qLow = qMid;
        }
      }

      if (!bestBlob) {
        bestBlob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.70));
      }

      const imgBytes = await bestBlob!.arrayBuffer();
      const embeddedJpg = await outPdfDoc.embedJpg(imgBytes);
      const origVp = page.getViewport({ scale: 1.0 });

      const newPage = outPdfDoc.addPage([origVp.width, origVp.height]);
      newPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: origVp.width,
        height: origVp.height,
      });
    }

    const compressedPdfBytes = await outPdfDoc.save({ useObjectStreams: true });
    const finalBlob = new Blob([compressedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const finalSizeKb = Math.round(finalBlob.size / 1024);
    const url = URL.createObjectURL(finalBlob);

    return {
      compressedKb: finalSizeKb,
      url,
      modeUsed: "अडैप्टिव ऑप्टिमाइज़",
    };
  };

  const processBatchCompression = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (current.status === "done") continue;

      setGlobalProgress(`फ़ाइल ${i + 1} / ${items.length} कंप्रेस हो रही है...`);
      setItems((prev) =>
        prev.map((it) => (it.id === current.id ? { ...it, status: "processing" } : it))
      );

      try {
        const res = await compressPdfSafely(current, targetKb);
        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? {
                  ...it,
                  status: "done",
                  compressedKb: res.compressedKb,
                  downloadUrl: res.url,
                  modeUsed: res.modeUsed,
                }
              : it
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? { ...it, status: "error", errorMsg: err.message || "त्रुटि आई" }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
    setGlobalProgress("सभी फ़ाइलें कंप्रेस हो गईं!");
  };

  const downloadAll = () => {
    items.forEach((item) => {
      if (item.downloadUrl) {
        const link = document.createElement("a");
        link.href = item.downloadUrl;
        link.download = `compressed_${item.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* शीर्ष नेविगेशन */}
        <div className="flex items-center justify-between">
          <Link href="/tools" className="text-xs font-bold text-slate-500 hover:text-slate-800">
            ← सभी टूल्स
          </Link>
          <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
            ExamSewa
          </span>
        </div>

        {/* मुख्य शीर्षक कार्ड */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-sm text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            PDF कंप्रेसर — ExamSewa
          </h1>
          <p className="text-xs text-slate-500">
            एक साथ कई PDF फ़ाइलें सटीक साइज़ (KB / MB) में कंप्रेस करें
          </p>
        </div>

        {/* मुख्य अपलोड बॉक्स */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <label className="cursor-pointer border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/60 hover:bg-blue-50 transition rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-2">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <span className="text-4xl">📥</span>
            <div>
              <span className="font-bold text-sm text-blue-800 block">
                PDF फ़ाइलें चुनें या ड्रैग करें (Multiple PDFs)
              </span>
              <span className="text-[11px] text-slate-500">
                एक साथ 1 से 10+ फ़ाइलें चुन सकते हैं
              </span>
            </div>
          </label>

          {/* कॉम्पैक्ट हॉरिजॉन्टल स्लाइडर / चिप स्ट्रिप (Zero Vertical Scroll) */}
          {items.length > 0 && (
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-700">
                  📁 कुल फ़ाइलें ({items.length})
                </span>
                <label className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">
                  + और जोड़ें
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* हॉरिजॉन्टल स्क्रॉल स्ट्रिप */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    title={item.name}
                    className="shrink-0 flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs text-xs"
                  >
                    <span className="font-black text-blue-700">#{idx + 1}</span>
                    <span className="text-slate-500 text-[11px]">{item.originalKb}KB</span>
                    
                    {item.status === "processing" && (
                      <span className="flex items-center text-[11px] text-blue-600 font-bold">
                        <svg className="animate-spin h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      </span>
                    )}

                    {item.status === "done" && item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        download={`compressed_${item.name}`}
                        className="bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] hover:bg-emerald-700"
                        title="डाउनलोड"
                      >
                        ✓ {item.compressedKb}KB 📥
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-600 font-bold text-xs pl-0.5"
                      title="हटाएँ"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* सेटिंग्स शेल्फ़ */}
          <div className="pt-1 border-t space-y-3">
            {/* त्वरित प्रीसेट्स */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">क्विक प्रीसेट्स:</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[
                  { label: "50 KB", val: 50 },
                  { label: "100 KB", val: 100 },
                  { label: "150 KB", val: 150 },
                  { label: "200 KB", val: 200 },
                  { label: "300 KB", val: 300 },
                  { label: "500 KB", val: 500 },
                  { label: "1 MB", val: 1024 },
                  { label: "2 MB", val: 2048 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPreset(p.val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition active:scale-95 ${
                      targetKb === p.val
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* कस्टम साइज़ व यूनिट स्विच (डिफ़ॉल्ट हमेशा KB) */}
            <div className="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">कस्टम साइज़:</span>
                <span className="text-[10px] text-slate-500">
                  वर्तमान: <b className="text-blue-700">{targetKb} KB</b>
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="10"
                  value={customInputValue}
                  onChange={(e) => handleCustomInputChange(e.target.value)}
                  className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-900 focus:outline-blue-600"
                />

                <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-white text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleUnitChange("KB")}
                    className={`px-2.5 py-1 transition ${
                      unit === "KB" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange("MB")}
                    className={`px-2.5 py-1 transition ${
                      unit === "MB" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>
            </div>

            {/* मुख्य एक्शन बटन */}
            <button
              type="button"
              onClick={processBatchCompression}
              disabled={isProcessing || items.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>{globalProgress || "फ़ाइल कंप्रेस हो रही है..."}</span>
                </span>
              ) : items.length === 0
                ? "पहले PDF फ़ाइलें जोड़ें"
                : `⚡ सभी ${items.length} फ़ाइलें कंप्रेस करें`}
            </button>

            {/* सभी डाउनलोड करें */}
            {items.some((i) => i.status === "done") && (
              <button
                type="button"
                onClick={downloadAll}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center space-x-1"
              >
                <span>📥</span>
                <span>सभी तैयार फ़ाइलें डाउनलोड करें</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
