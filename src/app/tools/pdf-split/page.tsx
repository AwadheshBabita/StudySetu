"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface PdfFileItem {
  id: string;
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

export default function PdfSplitPage() {
  const [file, setFile] = useState<PdfFileItem | null>(null);
  const [range, setRange] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setError("");

    try {
      const arr = new Uint8Array(await uploaded.arrayBuffer());
      const pdf = await PDFDocument.load(arr);
      setFile({
        id: Math.random().toString(36).substring(2, 9),
        name: uploaded.name,
        bytes: arr,
        pageCount: pdf.getPageCount(),
      });
      setRange(`1-${pdf.getPageCount()}`);
    } catch (err) {
      setError("फ़ाइल पढ़ने में असमर्थ। सुनिश्चित करें कि यह पासवर्ड से सुरक्षित न हो।");
    }
  };

  const parsePageNumbers = (str: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = str.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
          throw new Error(`अमान्य रेंज: "${trimmed}". कृपया 1 से ${maxPages} के बीच लिखें।`);
        }
        for (let i = start; i <= end; i++) pages.add(i - 1);
      } else {
        const p = parseInt(trimmed, 10);
        if (isNaN(p) || p < 1 || p > maxPages) {
          throw new Error(`अमान्य पेज नंबर: "${trimmed}". कुल पेज: ${maxPages}`);
        }
        pages.add(p - 1);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) {
      alert("कृपया एक PDF फ़ाइल चुनें!");
      return;
    }
    if (!range.trim()) {
      alert("कृपया पेज नंबर या रेंज दर्ज करें!");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const targetIndices = parsePageNumbers(range, file.pageCount);
      if (targetIndices.length === 0) {
        throw new Error("कोई पेज नहीं चुना गया।");
      }

      const srcPdf = await PDFDocument.load(file.bytes);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(srcPdf, targetIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const outBytes = await newPdf.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || "पेज अलग करने में त्रुटि आई।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* नेविगेशन */}
        <div className="flex items-center justify-between">
          <Link
            href="/tools/pdf-merge-split"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors"
          >
            &larr; PDF हब पर लौटें
          </Link>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            स्प्लिट टूल
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
              अपनी PDF फ़ाइल में से चुनिंदा पेज या पेज रेंज अलग करके नई PDF फ़ाइल बनाएँ।
            </p>
          </div>

          {/* फ़ाइल चयन */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              PDF फ़ाइल चुनें
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 file:cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {file && (
              <p className="text-[11px] text-slate-500 font-medium">
                चयनित: <span className="font-bold text-slate-700">{file.name}</span> (कुल पेज: <span className="text-amber-600 font-black">{file.pageCount}</span>)
              </p>
            )}
          </div>

          {/* रेंज इनपुट */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              पेज रेंज या पेज नंबर लिखें
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="उदा. 1-3, 5, 8-10"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-400">
              * कॉमा लगाकर अलग-अलग पेज चुन सकते हैं (उदा. 1, 3, 5) या रेंज दे सकते हैं (उदा. 1-4)।
            </p>
          </div>

          {/* एरर संदेश */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* एक्शन बटन */}
          <div>
            <button
              onClick={handleSplit}
              disabled={busy || !file}
              className="w-full py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  पेज अलग किए जा रहे हैं...
                </>
              ) : (
                "✂️ चयनित पेज अलग करें और डाउनलोड करें"
              )}
            </button>
          </div>

          {/* डाउनलोड बॉक्स */}
          {downloadUrl && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-3 animate-fade-in">
              <span className="text-2xl block">🎉</span>
              <div>
                <p className="text-xs sm:text-sm font-black text-amber-900">
                  सफ़ल! आपके द्वारा चुने गए पेज अलग कर दिए गए हैं।
                </p>
              </div>
              <a
                href={downloadUrl}
                download={`split_${file?.name || 'document.pdf'}`}
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition-all"
              >
                ⬇️ स्प्लिट की गई PDF डाउनलोड करें
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
